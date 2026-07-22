#!/usr/bin/env bash
#
# Verify the published artifact rather than the source tree.
#
# Packs the package, installs the tarball into a throwaway project, then
# typechecks a real consumer against it under every module resolution mode with
# skipLibCheck OFF, and smoke-tests both require() and import at runtime.
#
# This exists because three separate defects — exported types silently
# degrading to `any`, the ESM default import resolving to a namespace, and
# callbacks not being typed as bound — were all invisible to `npm run build`
# and `npm run typecheck`, and only appeared from a consumer's point of view.
#
# Usage: npm run verify:package   (assumes `npm run build` has already run)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$ROOT"
TARBALL="$(npm pack --pack-destination "$WORK" --silent | tail -n 1)"
echo "packed $TARBALL"

cd "$WORK"
printf '{"name":"consumer","version":"1.0.0","private":true}\n' > package.json
cp "$ROOT"/scripts/package-fixtures/use.cts .
cp "$ROOT"/scripts/package-fixtures/use.mts .

# install the tarball, and typescript from the package's own devDependency
TS_VERSION="$(node -p "require('$ROOT/package.json').devDependencies.typescript")"
npm install --no-audit --no-fund --silent "$WORK/$TARBALL" "typescript@$TS_VERSION"

status=0

# skipLibCheck is deliberately OFF: with it on, unresolvable declarations fail
# silently and every exported type degrades to `any`.
for mode in node16 nodenext; do
  echo "--- typecheck: module=$mode moduleResolution=$mode (skipLibCheck off)"
  if ! npx tsc --noEmit --strict --module "$mode" --moduleResolution "$mode" \
      --lib ES2022,DOM use.cts use.mts; then
    status=1
  fi
done

echo "--- typecheck: moduleResolution=bundler (skipLibCheck off)"
if ! npx tsc --noEmit --strict --module esnext --moduleResolution bundler \
    --lib ES2022,DOM use.mts; then
  status=1
fi

echo "--- runtime: require()"
node -e "
const assert = require('assert');
const EPC = require('easy-pie-chart');
assert.strictEqual(typeof EPC, 'function', 'CJS export should be the constructor');
assert.strictEqual(EPC.name, 'EasyPieChart');
for (const k of ['EasyPieChart', 'CanvasRenderer', 'defaultEasing', 'defaultOptions']) {
  assert.ok(k in EPC, 'missing static: ' + k);
}
assert.strictEqual(typeof require('easy-pie-chart/jquery'), 'function');
console.log('    ok');
" || status=1

echo "--- runtime: import"
node --input-type=module -e "
import assert from 'assert';
import EPC, { EasyPieChart, defaultOptions } from 'easy-pie-chart';
import { registerJQueryPlugin } from 'easy-pie-chart/jquery';
assert.strictEqual(EPC, EasyPieChart, 'default export should be the class');
assert.strictEqual(typeof registerJQueryPlugin, 'function');
assert.strictEqual(defaultOptions.size, 110);
console.log('    ok');
" || status=1

echo "--- runtime: callbacks are bound to the chart"
node --input-type=module -e "
import assert from 'assert';
import { EasyPieChart } from 'easy-pie-chart';
globalThis.window = { devicePixelRatio: 1 };
const ctx = new Proxy({}, { get: () => () => ({ data: [] }) });
globalThis.document = { createElement: () => ({ getContext: () => ctx, style: {}, parentNode: null }) };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
const el = { appendChild() {}, dataset: {}, removeChild() {} };
let seen;
new EasyPieChart(el, { animate: false, barColor() { seen = this.el; return '#000'; } }).update(10);
assert.strictEqual(seen, el, 'this.el inside barColor should be the host element');
console.log('    ok');
" || status=1

if [ "$status" -ne 0 ]; then
  echo
  echo "package verification FAILED — the published artifact would be broken for consumers"
  exit 1
fi

echo
echo "package verification passed"

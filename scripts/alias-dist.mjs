/**
 * Re-emit the UMD bundles under their 2.x filenames.
 *
 * 2.x shipped dist/easypiechart.js and dist/jquery.easypiechart.js. 3.0 renamed
 * them to .cjs so Node would read them as CommonJS under "type": "module",
 * which 404s every unpkg/jsDelivr URL and every <script src> pointing at the
 * old path. The bundles are UMD, so a byte-identical copy under the old name
 * works in a browser exactly as it did before.
 *
 * Node still resolves require()/import through the exports map, which points at
 * the .cjs and .mjs files — these copies exist purely for script tags.
 */
import { copyFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const copy = (from, to) => {
  const src = resolve(dist, from);
  if (!existsSync(src)) {
    throw new Error(`alias-dist: ${from} is missing — did the UMD build run?`);
  }
  copyFileSync(src, resolve(dist, to));
  console.log(`aliased ${from} -> ${to}`);
};

for (const base of ['easypiechart', 'jquery.easypiechart']) {
  // the browser-facing 2.x filename
  copy(`${base}.cjs`, `${base}.js`);
  // and a .cjs twin of the minified bundle, so Node parses the legacy
  // dist/*.min.js export as CommonJS rather than as ESM
  copy(`${base}.min.js`, `${base}.min.cjs`);
}

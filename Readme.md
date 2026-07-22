# easy-pie-chart

> Lightweight plugin to render simple, animated and retina optimized pie charts

[![CI](https://github.com/rendro/easy-pie-chart/actions/workflows/ci.yml/badge.svg)](https://github.com/rendro/easy-pie-chart/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/easy-pie-chart.svg)](https://www.npmjs.com/package/easy-pie-chart)

- highly customizable, no dependencies
- resolution independent (retina optimized)
- written in TypeScript, ships its own types
- ESM + UMD builds, ~2 kB gzipped
- optional jQuery plugin entry point

## Install

```sh
npm install easy-pie-chart
```

## Usage

```js
import { EasyPieChart } from 'easy-pie-chart';

const chart = new EasyPieChart(document.querySelector('.chart'), {
  barColor: '#ef1e25',
  size: 110,
});

chart.update(65);
```

Via a script tag — the UMD bundle exposes a global `EasyPieChart`:

```html
<script src="node_modules/easy-pie-chart/dist/easypiechart.min.js"></script>
<script>
  new EasyPieChart(document.querySelector('.chart'), { size: 110 }).update(65);
</script>
```

### jQuery

```html
<script src="jquery.js"></script>
<script src="node_modules/easy-pie-chart/dist/jquery.easypiechart.min.js"></script>
<script>
  $('.chart').easyPieChart({ barColor: '#10b981' });

  // the instance lives on the element's data
  $('.chart').data('easyPieChart').update(42);

  // tear it down
  $('.chart').easyPieChart('destroy');
</script>
```

As a module, when jQuery is not a global:

```js
import { registerJQueryPlugin } from 'easy-pie-chart/jquery';
import $ from 'jquery';

registerJQueryPlugin($);
```

### Options via `data-*` attributes

Every option except the callbacks can be set on the element. Explicit options
passed to the constructor win over attributes.

```html
<div class="chart" data-percent="65" data-size="140" data-bar-color="#7c3aed"></div>
```

`data-track-color="false"` and `data-scale-color="false"` disable the track and
the scale. `data-percent` sets the initial value.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `barColor` | `'#ef1e25'` | CSS color string, or `(percent) => string` |
| `trackColor` | `'#f9f9f9'` | Track color, or `false` to disable |
| `scaleColor` | `'#dfe0e0'` | Scale line color, or `false` to disable |
| `scaleLength` | `5` | Length of the scale lines in px (reduces the radius) |
| `scaleCount` | `24` | Number of scale lines |
| `lineCap` | `'round'` | `'butt'`, `'round'` or `'square'` |
| `lineWidth` | `3` | Width of the bar in px |
| `trackWidth` | `lineWidth` | Width of the track in px |
| `size` | `110` | Size of the chart in px (always square) |
| `rotate` | `0` | Rotation of the whole chart in degrees |
| `animate` | `{ duration: 1000, enabled: true }` | Also accepts a number (duration) or `false` |
| `easing` | quadratic ease-in-out | `(t, b, c, d) => number` |
| `onStart` | — | `(from, to) => void` |
| `onStep` | — | `(from, to, currentValue) => void` |
| `onStop` | — | `(from, to) => void` |
| `renderer` | `CanvasRenderer` | Custom renderer implementing `IRenderer` |

Values may be negative — the bar is then drawn counter-clockwise.

Function options (`barColor`, `easing`, `onStart`, `onStep`, `onStop`) are bound
to the chart instance, so `this.el` inside them is the host element. Arrow
functions keep their own `this`, as usual.

## Gradients

`barColor` receives the current percent and returns any valid canvas stroke
style — including a gradient built from the renderer's own context:

```js
const chart = new EasyPieChart(el, {
  barColor() {
    const ctx = this.renderer.getCtx();
    const { size } = this.options;
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#0ea5e9');
    return gradient;
  },
});
```

The canvas is translated so `0,0` is its centre and rotated so 0% starts at 12
o'clock — take that into account when positioning gradient stops. Use
`this.renderer.getCanvas()` if you need the element itself.

## API

| Method | Description |
| --- | --- |
| `update(value)` | Animate (or jump) to a new value. Non-numeric values are ignored. |
| `setOptions(options)` | Apply new options and redraw at the current value. |
| `stop()` | Stop a running animation at the current frame. |
| `enableAnimation()` / `disableAnimation()` | Toggle animated updates. |
| `destroy()` | Cancel animations and remove the canvas. |
| `value` | Getter for the current value. |
| `options` | The resolved options object. |
| `renderer` | The active renderer. `getCtx()` / `getCanvas()` on the canvas renderer. |
| `el` | The host element. |

All methods except `destroy()` and `value` return the instance for chaining.

## Examples

Run `npm run build`, then open `examples/index.html` in a browser.

## Migrating from 2.x

- Distributed as ESM (`dist/easypiechart.mjs`), CommonJS (`dist/easypiechart.cjs`)
  and a minified UMD bundle for script tags (`dist/easypiechart.min.js`). The
  UMD global is still `EasyPieChart`. TypeScript types are correct under
  `node16`, `nodenext` and `bundler` resolution.
- The AngularJS 1.x directive was removed. AngularJS has been end-of-life since
  January 2022.
- Bower and Meteor packaging were removed. Install from npm.
- The `easing` signature dropped its leading instance argument:
  `(t, b, c, d)` instead of `(chart, t, b, c, d)`. Named jQuery easing strings
  are no longer resolved — pass a function.
- A 0% bar no longer renders a dot when `lineCap` is `'round'`.
- `update()` ignores `NaN` instead of leaving the chart stuck.
- New: `setOptions()`, `stop()`, `destroy()`, `scaleCount`, `data-*` options on
  the vanilla constructor, and TypeScript types.

## License

MIT

# Changelog

## Version 3.1.2

Compatibility fixes. 3.0/3.1 broke three things that worked in 2.1.7; all are
restored here. If you are on 3.0.x or 3.1.x, upgrade.

### Fixed
* `easing` given as a string threw `options.easing is not a function` on every
  animation frame, so the chart never animated. 2.x resolved the name against
  `jQuery.easing` and fell back to the default for anything unknown; that
  behaviour is back, and unknown names fall back instead of throwing.
* `easing` given as a 2.x-style `(chart, t, b, c, d)` function — which is also
  jQuery UI's signature — was called with the modern four arguments and
  produced nonsense. Both signatures are now detected and supported.
* `data-*` attributes no longer lose to the options object. 2.x's jQuery plugin
  did `$.extend({}, options, $(this).data())`, so per-element attributes won;
  3.0 reversed it, which silently broke "shared JS defaults, per-element
  overrides" and re-introduced the problem reported in #146.
* `dist/easypiechart.js` and `dist/jquery.easypiechart.js` exist again. 3.0
  renamed them to `.cjs`, 404ing every unpkg/jsDelivr URL and `<script src>`
  pointing at the 2.x paths. The legacy paths are also mapped in `exports`, so
  `require('easy-pie-chart/dist/easypiechart.js')` resolves as it did in 2.x.

## Version 3.1.1

### Fixed
* Function options are now typed as bound to the chart, so `this.el`,
  `this.options`, `this.renderer` and `this.value` resolve inside `barColor`,
  `onStart`, `onStep` and `onStop`. 3.0.1 bound them at runtime but never said
  so in the types, which meant TypeScript inferred `this` as the options object
  and the documented gradient example did not compile.
* `getCanvas()` / `getCtx()` are required on `IRenderer` rather than optional,
  so reaching the context no longer needs a non-null assertion.

### Internal
* `npm run typecheck` now covers `test/` via `tsconfig.check.json`, including a
  compile-time test file that pins the public type surface. Declarations for
  tests are kept out of `dist/`.

## Version 3.1.0

Clears the long-standing feature backlog. All additions are opt-in — a chart
with no options renders exactly as it did in 3.0.1.

### Added
* `max` — the value that fills the bar, so charts can show units other than
  percentages. Callbacks and `barColor` still receive your raw value. (#180, #76)
* `arcLength` — how far the ring sweeps, in degrees. With `rotate` this gives
  semi-circular gauges. (#110)
* `responsive` — follow the host element's size via `ResizeObserver`. (#56)
* `fillColor` — fill the disc inside the ring. (#127)
* `trackBorderColor` / `trackBorderWidth` — a hairline along both edges of the
  track, for backgrounds that differ from the track color. (#90)
* `canvasClass` — set the class on the generated canvas, for BEM and similar
  naming schemes. (#152, #149)
* `animate.duration` may be a `(from, to) => ms` function, so the animation can
  be paced by how far the value moved. (#103)

## Version 3.0.1

### Fixed
* Function options are bound to the chart instance again, so `this.el` works
  inside `onStart`/`onStep`/`onStop`/`barColor`/`easing`. 2.x documented this
  and 3.0.0 dropped it silently, breaking label callbacks on upgrade. (#169)
* The ring no longer overflows the canvas. The radius is derived from the wider
  of `lineWidth`/`trackWidth` and reserves a pixel for the antialiased edge, so
  a `trackWidth` greater than `lineWidth` is no longer clipped and edges are no
  longer shaved. Charts render ~1px smaller as a result. (#162, #156)
* `chart.renderer` is public and `IRenderer` declares `getCanvas()`/`getCtx()`,
  so the documented gradient technique works again. `barColor` may now return a
  `CanvasGradient`/`CanvasPattern` as well as a string. (#123, #198, #200)

## Version 3.0.0

Rewritten in TypeScript; built with Vite, tested with Vitest. The old
Grunt/Karma/Bower/Meteor toolchain and all of its transitive vulnerabilities
are gone.

### Breaking
* Removed the AngularJS 1.x directive (EOL since January 2022).
* Removed Bower (`bower.json`) and Meteor (`package.js`) packaging.
* Removed the IE7/8 excanvas (`G_vmlCanvasManager`) code path.
* `easing` is now `(t, b, c, d)` — the leading instance argument is gone, and
  jQuery easing names are no longer resolved to functions.
* `dist/angular.easypiechart.js` is gone. The package is now `"type": "module"`:
  ESM builds are `*.mjs`, the CommonJS/UMD build for `require()` is `*.cjs`, and
  the minified UMD bundle for script tags stays `*.min.js`.

### Added
* TypeScript types shipped with the package.
* `setOptions()`, `stop()`, `destroy()` and a `value` getter.
* `scaleCount` option to control the number of scale lines.
* `data-*` options are read by the vanilla constructor, not just the jQuery
  plugin.
* `$('…').easyPieChart('destroy')` and `registerJQueryPlugin($)`.

### Fixed
* A 0% bar rendered as a dot with `lineCap: 'round'`.
* `update(NaN)` permanently wedged the chart.
* Animations now land exactly on the target value and cancel the previous
  animation instead of racing it.

## Version 2.1.7 - May 8, 2015
* Check type of G_vmlCanvasManager. #138

## Version 2.1.6 - Dec 15, 2014
* Added option for track width

## Version 2.1.5 - Feb 28, 2014
* Fixed build error for minified vanilla version

## Version 2.1.4 - Feb 1, 2014
* Various updates and pull requests

## Version 2.1.3 - Dec 1, 2013
* Allow negative percent values with a reversed pie chart

## Version 2.1.2 - Dec 1, 2013
* Allow override of default options with data attributes in JQuery plugin

## Version 2.1.1 - Nov 19, 2013
* Fixed AMD support for jQuery version

## Version 2.1.0 - Oct 28, 2013
* Added UMD (Universal Module Definition) wrapper for AMD and requireJS support
* Angular module: Move options into single attribute and provide it as JSON
* Allow decimal numbers for percent values

## Version 2.0.5 – Oct 12, 2013
* (Angular) Fixed timer bug

## Version 2.0.4 - Oct 10, 2013
* Use the internal timing function of angular
* Added the ability to create two instances of the chart on one main scope
* Removed unnecessary stuff from the angular example to provide the minimal setup
* Added more conventional way to create controller in angular

## Version 2.0.3 - Sep 29, 2013
* Fixed render bug on retina displays
* Auto detect and load renderer (in preparation of a svg renderer)

## Version 2.0.2 - Sep 26, 2013
* Improved render performance by approx. 300%

## Version 2.0.1 - Sep 22, 2013
* Support for Internet Explorer 7 and 8 with excanvas

## Version 2.0.0 - Sep 22, 2013
* Added vanilla JS version
* Added angular directive
* Dropped coffeescript version
* Dropped support for delayed animations
* Moved canvas render methods in own module

## Version 1.2.5 - Aug 05, 2013
* Added default option value for delay

## Version 1.2.4 - Aug 05, 2013
* bug fix for incomplete animations
* support for delayed animations

## Version 1.2.3 - Jul 17, 2013
* Date.now fix for IE < IE9

## Version 1.2.2 - Jul 15, 2013
* Add `currentValue` and `to` to the onStop callback

## Version 1.2.1 - Jun 19, 2013
* Allow overriding of options with HTML data attributes where provided

## Version 1.2.0 - Jun 19, 2013
* Added `rotate` option to rotate the complete chart

## Version 1.1.0 - Jun 10, 2013
* Added missing `onStop` method
* cast `percent` to float to avoid breaking chart if a string is passed to the update method

## Version 1.0.2 - Jun 07, 2013
* Use requestAnimationFrame for smooth animations
* Added `onStep` option to get the current value during animations

## Version 1.0.1 - Feb 07, 2013
* Added retina support

## Version 1.0.0 - Aug 02, 2012
* Initial version

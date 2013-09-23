# easy pie chart

easy pie chart is a leightweight plugin to draw simple, animated pie charts for single values.

It shipps in three different versions:

* Vanilla JS *(no dependencies)* (~730 bytes)
* jQuery plugin (~750 bytes)
* Angular Module **!new!** (~900 bytes)

The plugin is:

* highly customizable,
* very easy to implement,
* resolution independent (retina optimized),
* uses requestAnimationFrame for smooth animations on modern devices and
* works in all modern browsers and even in IE7+ with excanvas.

![](https://github.com/rendro/easy-pie-chart/raw/master/demo/img/easy-pie-chart.png)

## Get started

### jQuery

To use the easy pie chart plugin you need to load the current version of jQuery (tested with 1.6.4) and the source of the plugin.

You can also use [bower](http://bower.io) to install the component:

```
$ bower install jquery.easy-pie-chart
```

**How to use the plugin:**

```html
<div class="chart" data-percent="73">73%</div>

<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="/path/to/jquery.easy-pie-chart.js"></script>
```

Finally you have to initialize the plugin with your desired configuration:

```javascript
$(function() {
    $('.chart').easyPieChart({
        //your configuration goes here
    });
});
```

### Vanilla JS

If you don't want to use jQuery, implement the vanilla JS version without any dependencies:

```html
<div class="chart" data-percent="73">73%</div>

<script type="text/javascript" src="/path/to/easy-pie-chart.js"></script>
<script type="text/javascript">
var element = document.querySelector('.chart');
new EasyPieChart(element, {
	// your configuration goes here
});
</script>
```

### Angular Module

Brand new in version 2.0.0 is the angular module for the easy pie chart plugin

```html
<div class="angular" ng-controller="PieChart">
	<span class="chart" easypiechart="your:options;go:here" ng-percent="percent"></span>
	<input type="range" min="0" max="100" step="1" ng-model="percent" />
</div>

<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
<script src="../dist/angular.easypiechart.min.js"></script>
<script>
	var app = angular.module('app',['easypiechart']);
	function PieChart($scope) {
		$scope.percent = 65;
	}
</script>
```

## Configuration parameter

You can pass these options to the initialize function to set a custom look and feel for the plugin.

<table>
    <tr>
        <th>Property (Type)</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><strong>barColor</strong></td>
        <td>#ef1e25</td>
        <td>The color of the curcular bar. You can either pass a valid css color string, or a function that takes the current percentage as a value and returns a valid css color string.</td>
    </tr>
    <tr>
        <td><strong>trackColor</strong></td>
        <td>#f2f2f2</td>
        <td>The color of the track, or false to disable rendering.</td>
    </tr>
    <tr>
        <td><strong>scaleColor</strong></td>
        <td>#dfe0e0</td>
        <td>The color of the scale lines, false to disable rendering.</td>
    </tr>
    <tr>
        <td><strong>scaleLength</strong></td>
        <td>5</td>
        <td>Length of the scale lines (reduces the radius of the chart).</td>
    </tr>
    <tr>
        <td><strong>lineCap</strong></td>
        <td>round</td>
        <td>Defines how the ending of the bar line looks like. Possible values are: <code>butt</code>, <code>round</code> and <code>square</code>.</td>
    </tr>
    <tr>
        <td><strong>lineWidth</strong></td>
        <td>3</td>
        <td>Width of the chart line in px.</td>
    </tr>
    <tr>
        <td><strong>size</strong></td>
        <td>110</td>
        <td>Size of the pie chart in px. It will always be a square.</td>
    </tr>
        <tr>
        <td><strong>rotate</strong></td>
        <td>0</td>
        <td>Rotation of the complete chart in degrees.</td>
    </tr>
    <tr>
        <td><strong>animate</strong></td>
        <td>false</td>
        <td>Time in milliseconds for an animation of the bar growing, or false to deactivate animations.</td>
    </tr>
</table>

### Callbacks

All callbacks will only be called if `animate` is not `false`.

<table>
	<tr>
        <th>Callback(parameter, …)</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><strong>onStart(from, to)</strong></td>
        <td>Is called at the start of any animation.</td>
    </tr>
    <tr>
        <td><strong>onStep(from, to, currentValue)</strong></td>
        <td>Is called during animations providing the current value (the method is scoped to the context of th eplugin, so you can access the DOM element via <code>this.el</code>).</td>
    </tr>
    <tr>
        <td><strong>onStop(from, to)</strong></td>
        <td>Is called at the end of any animation.</td>
    </tr>
</table>


## Plugin API

If you want to update the current percentage of the a pie chart, you can call the `update` method.

### jQuery implementation

```javascript
$(function() {
	// instantiate the plugin
	...

	// update
	$('.chart').data('easyPieChart').update(40);
});
```

### vanilla JS

```javascript
// instantiate the plugin
var chart = new EasyPieChart(element, options);

// update
chart.update(40);
```

### Angular

For a value binding in angular you need to add the `ng-percent` attribute and bind it to your angular controller:

```html
<span class="chart" easypiechart ng-percent="percent">
```

## Browser support

Native support:

* Chrome
* Safari
* FireFox
* Opera
* Internet Explorer 9+

With [excanvas](https://code.google.com/p/explorercanvas/wiki/Instructions) polyfill:

* Internet Explorer 7, 8

## Credits

Thanks to [Rafal Bromirski](http://www.paranoida.com/) for designing [this dribble shot](http://drbl.in/ezuc) which inspired me building this plugin.


## Changlog

### Version 2.0.1 - Sep 22, 2013
* Support for Internet Explorer 7 and 8 with excanvas

### Version 2.0.0 - Sep 22, 2013
* Added vanilla JS version
* Added angular directive
* Dropped coffeescript version
* Dropped support for delayed animations
* Moved canvas render methods in own module

### Version 1.2.5 - Aug 05, 2013
* Added default option value for delay

### Version 1.2.4 - Aug 05, 2013
* bug fix for incomplete animations
* support for delayed animations

### Version 1.2.3 - Jul 17, 2013
* Date.now fix for IE < IE9

### Version 1.2.2 - Jul 15, 2013
* Add `currentValue` and `to` to the onStop callback

### Version 1.2.1 - Jun 19, 2013
* Allow overriding of options with HTML data attributes where provided

### Version 1.2.0 - Jun 19, 2013
* Added `rotate` option to rotate the complete chart

### Version 1.1.0 - Jun 10, 2013
* Added missing `onStop` method
* cast `percent` to float to avoid breaking chart if a string is passed to the update method

### Version 1.0.2 - Jun 07, 2013
* Use requestAnimationFrame for smooth animations
* Added `onStep` option to get the current value during animations

### Version 1.0.1 - Feb 07, 2013
* Added retina support

### Version 1.0.0 - Aug 02, 2012
* Initial version

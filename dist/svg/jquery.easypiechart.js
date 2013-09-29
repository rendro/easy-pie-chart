/**!
 * easyPieChart
 * Lightweight plugin to render simple, animated and retina optimized pie charts with canvas or SVG
 *
 * @license Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * @author Robert Fleischmann <rendro87@gmail.com> (http://robert-fleischmann.de)
 * @version 2.0.3
 **/

(function($) {
/**
 * Renderer to render the chart as an svg graphics
 * @param {DOMElement} el      DOM element to host the canvas (root of the plugin)
 * @param {object}     options options object of the plugin
 */
var SVGRenderer = function(el, options) {
	var svgNS = 'http://www.w3.org/2000/svg';
	var hasScale = (options.scaleColor && options.scaleLength);
	var radius = (options.size - options.lineWidth) / 2;

	if (hasScale) {
		radius -= options.scaleLength + 2; // 2 is the distance between scale and bar
	}

	/**
	 * Create an element of the SVG namespace
	 * @param  {string} type       Type of the element (tag name)
	 * @param  {object} attributes Attribute list of the element
	 * @return {element}           Created element
	 */
	var createElement = function(type, attributes) {
		var el = document.createElementNS(svgNS, type);

		if (attributes) {
			for (var i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					el.setAttribute(i, attributes[i]);
				}
			}
		}
		return el;
	};

	// create svg element
	var svg = createElement('svg', {
		version: 1.1,
		width: options.size,
		height: options.size
	})

	// create track if necessary
	if (!!options.trackColor) {
		svg.appendChild(createElement('circle', {
			cx: options.size / 2,
			cy: options.size / 2,
			r: radius,
			stroke: options.trackColor,
			'stroke-width': options.lineWidth,
			fill: 'none'
		}));
	}

	// create scale if necessary
	if (hasScale) {
		var g = createElement('g', {
			transform: 'translate(55, 55)'
		});
		for (var i = 0; i<24; ++i) {
			var length = options.scaleLength;
			if (i%6 !== 0) {
				length *= .6;
			}
			var deg = 360 * i / 24 + options.rotate;

			g.appendChild(createElement('path', {
				d: ['M', 0, 0, 'l', 0, length].join(' '),
				stroke: options.scaleColor,
				'stroke-width': 1,
				fill: 'none',
				transform: ['rotate(' + deg + ') translate(0,', options.size/2 - options.scaleLength, ')'].join('')
			}));
		}
		svg.appendChild(g);
	}

	// create arc (actual chart)
	var arc = createElement('path', {
		stroke: typeof(options.barColor) === 'function' ? options.barColor(0) : options.barColor,
		'stroke-width': options.lineWidth,
		'stroke-linecap': options.lineCap,
		fill: 'none'
	});
	if (options.rotate) {
		arc.setAttribute('transform', ['rotate(', options.rotate, ',', options.size/2, ',', options.size/2, ')'].join(''));
	}
	svg.appendChild(arc);

	// add svg to the element
	el.appendChild(svg);

	/**
	 * Request animation frame wrapper with polyfill
	 * @return {function} Request animation frame method or timeout fallback
	 */
	var reqAnimationFrame = (function() {
		return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
	}());

	/**
	 * Set the chart
	 * @param  {number} percent Percent shown by the chart between 0 and 100
	 */
	this.draw = function(percent) {
		var deg = 3.6 * percent;
		var rad = deg * Math.PI / 180;
		var x = options.size / 2 + radius * Math.sin(rad);
		var y = options.size / 2 - radius * Math.cos(rad);
		var offsetTop = options.lineWidth / 2;
		if (hasScale) {
			offsetTop += options.scaleLength + 2;
		}

		var path = [
			'M',
			options.size / 2,
			offsetTop,
			'A',
			radius,
			radius,
			0,
			+(deg > 180),
			1,
			x,
			y
		];
		arc.setAttribute('d', path.join(' '));

		if (typeof(options.barColor) === 'function') {
			arc.setAttribute('stroke', options.barColor(percent));
		}
	}.bind(this);

	/**
	 * Animate from some percent to some other percentage
	 * @param  {number} from Starting percentage
	 * @param  {number} to   Final percentage
	 */
	this.animate = function(from, to) {
		var startTime = Date.now();
		options.onStart(from, to);
		var animation = function() {
			var process = Math.min(Date.now() - startTime, options.animate);
			var currentValue = options.easing(this, process, from, to - from, options.animate);
			this.draw(currentValue);
			options.onStep(from, to, currentValue);
			if (process >= options.animate) {
				options.onStop(from, to);
			} else {
				reqAnimationFrame(animation);
			}
		}.bind(this);

		reqAnimationFrame(animation);
	}.bind(this);
};

var EasyPieChart = function(el, opts) {
	var defaultOptions = {
		barColor: '#ef1e25',
		trackColor: '#f9f9f9',
		scaleColor: '#dfe0e0',
		scaleLength: 5,
		lineCap: 'round',
		lineWidth: 3,
		size: 110,
		rotate: 0,
		animate: 1000,
		easing: function (x, t, b, c, d) { // more can be found here: http://gsgd.co.uk/sandbox/jquery/easing/
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		onStart: function(from, to) {
			return;
		},
		onStep: function(from, to, currentValue) {
			return;
		},
		onStop: function(from, to) {
			return;
		}
	};

	// detect present renderer
	if (typeof(CanvasRenderer) !== 'undefined') {
		defaultOptions.renderer = CanvasRenderer;
	} else if (typeof(SVGRenderer) !== 'undefined') {
		defaultOptions.renderer = SVGRenderer;
	} else {
		throw new Error('Please load either the SVG- or the CanvasRenderer');
	}

	var options = {};
	var currentValue = 0;

	/**
	 * Initialize the plugin by creating the options object and initialize rendering
	 */
	var init = function() {
		this.el = el;
		this.options = options;

		// merge user options into default options
		for (var i in defaultOptions) {
			if (defaultOptions.hasOwnProperty(i)) {
				options[i] = opts && typeof(opts[i]) !== 'undefined' ? opts[i] : defaultOptions[i];
				if (typeof(options[i]) === 'function') {
					options[i] = options[i].bind(this);
				}
			}
		}

		// check for jQuery easing
		if (typeof(options.easing) === 'string' && typeof(jQuery) !== 'undefined' && jQuery.isFunction(jQuery.easing[options.easing])) {
			options.easing = jQuery.easing[options.easing];
		} else {
			options.easing = defaultOptions.easing;
		}

		// create renderer
		this.renderer = new options.renderer(el, options);

		// initial draw
		this.renderer.draw(currentValue);

		// initial update
		if (el.dataset && el.dataset.percent) {
			this.update(parseInt(el.dataset.percent, 10));
		}
	}.bind(this);

	/**
	 * Update the value of the chart
	 * @param  {number} newValue Number between 0 and 100
	 * @return {object}          Instance of the plugin for method chaining
	 */
	this.update = function(newValue) {
		newValue = parseInt(newValue, 10);
		if (options.animate) {
			this.renderer.animate(currentValue, newValue);
		} else {
			this.renderer.draw(newValue);
		}
		currentValue = newValue;
		return this;
	}.bind(this);

	init();
};

$.fn.easyPieChart = function(options) {
	return this.each(function() {
		if (!$.data(this, 'easyPieChart')) {
			$.data(this, 'easyPieChart', new EasyPieChart(this, options));
		}
	});
};

}(jQuery));
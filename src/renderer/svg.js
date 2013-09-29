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

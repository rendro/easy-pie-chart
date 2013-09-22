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
		renderer: CanvasRenderer,
		easing: function (x, t, b, c, d) { // more can be found here: http://gsgd.co.uk/sandbox/jquery/easing/
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		onStart: function() {
			return;
		},
		onStep: function() {
			return;
		},
		onStop: function() {
			return;
		}
	};

	var options = {};
	var renderer;
	var currentValue = 0;

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
		renderer = new options.renderer(el, options);

		// initial draw
		renderer.draw(currentValue);

		// initial update
		if (el.dataset.percent) {
			this.update(parseInt(el.dataset.percent, 10));
		}

	}.bind(this);

	this.update = function(newValue) {
		newValue = parseInt(newValue, 10);
		if (options.animate) {
			renderer.animate(currentValue, newValue);
		} else {
			renderer.draw(newValue);
		}
		currentValue = newValue;
		return this;
	}.bind(this);

	init();
};

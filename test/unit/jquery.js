describe('Unit testing jQuery version of easy pie chart', function() {
	var $el;

	var options = {
		size: 200
	};

	beforeEach(function(){
		$el = $('<span class="chart"></span>');
		$('body').append($el);

		$el.easyPieChart(options);
	});

	it('inserts a canvas element', function() {
		expect($el.html()).toContain('canvas');
	});

	describe('takes size option and', function() {
		var $canvas;

		beforeEach(function() {
			$canvas = $el.find('canvas');
		});

		it('set correct width', function() {
			expect($canvas.width()).toBe(options.size);
		});

		it('set correct height', function() {
			expect($canvas.height()).toBe(options.size);
		});
	});

});

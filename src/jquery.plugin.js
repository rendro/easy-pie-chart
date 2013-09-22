$.fn.easyPieChart = function(options) {
	return this.each(function() {
		if (!$.data(this, 'easyPieChart')) {
			$.data(this, 'easyPieChart', new EasyPieChart(this, options));
		}
	});
};

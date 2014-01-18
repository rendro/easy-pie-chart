if (
	typeof angular === 'object' &&
	typeof angular.version === 'object'
) {
	angular.module('easypiechart', [])
		.directive('easypiechart', [function() {
			return {
				restrict: 'A',
				require: '?ngModel',
				scope: {
					percent: '=',
					options: '='
				},
				link: function (scope, element, attrs) {

					/**
					 * default easy pie chart options
					 * @type {Object}
					 */
					var options = {
						barColor: '#ef1e25',
						trackColor: '#f9f9f9',
						scaleColor: '#dfe0e0',
						scaleLength: 5,
						lineCap: 'round',
						lineWidth: 3,
						size: 110,
						rotate: 0,
						animate: {
							duration: 1000,
							enabled: true
						}
					};
					angular.extend(options, scope.options);

					scope.pieChart = new EasyPieChart(element[0], options);

					scope.$watch('percent', function(newVal, oldVal) {
						scope.pieChart.update(newVal);
					});
				}
			};
		}]);
} else {
	console.log('angular not detected.');
}

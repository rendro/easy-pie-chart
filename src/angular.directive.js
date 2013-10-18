// Angular directives for easyPieChart
if ((typeof(angular) === 'object') && (typeof(angular.version) === 'object')) {
	angular.module('easypiechart',[])
	.directive('easypiechart', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			require: '?ngModel',
			scope: {
				percent: '=',
				options: '='
			},
			link: function (scope, element, attrs) {
				var options = {
					barColor: '#ef1e25',
					trackColor: '#f9f9f9',
					scaleColor: '#dfe0e0',
					scaleLength: 5,
					lineCap: 'round',
					lineWidth: 3,
					size: 110,
					rotate: 0,
					animate: 1000
				};
				angular.extend(options, scope.options);

				var pieChart = new EasyPieChart(element[0], options);

				// initial pie rendering
				if (scope.percent) {
					pieChart.update(scope.percent);
				}

				// on change of value
				var timer = null;
				scope.$watch('percent', function(oldVal, newVal) {
					pieChart.update(newVal);

					// this is needed or the last value won't be updated
					if(timer) {
						$timeout.cancel(timer);
					}
					timer = $timeout(function() {
						pieChart.update(scope.percent);
					}, 1000 / 60);
				});
			}
		};
	}]);
} else{
	console.log('Angular not detected.');
}

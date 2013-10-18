// Angular directives for easyPieChart
if ( (typeof(angular) === 'object') && (typeof(angular.version) === 'object')){
	angular.module('easypiechart',[])
	.directive('easypiechart', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			require: '?ngModel',
			scope: {
				percent: '=percent',
				options: '=options'
			},
			link: function (scope, element, attrs) {
				var pieChart = new EasyPieChart(element[0], scope.options);

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
		}
	}]);
} else{
	console.log('Angular not detected.');
}


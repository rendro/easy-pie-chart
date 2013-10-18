// Angular directives for easyPieChart
if ( (typeof(angular) === 'object') && (typeof(angular.version) === 'object')){
	angular.module('easypiechart',[])
	.directive('easypiechart', ['$timeout', function($timeout) {
		return {
			restrict: 'A',
			require: '?ngModel',
			scope: {
				percent: '=ngPercent'
			},
			link: function (scope, element, attrs) {
				var options = {};
				var fx = attrs.easypiechart;
				if (fx.length > 0) {
					fx = fx.split(';'); // CSS like syntax
					var REkey = new RegExp('[a-z]+', 'i');
					var REvalue = new RegExp(':.+');
					// Parse Effects
					for (var i in fx) {
						var value = fx[i].match(REkey);
						var key = fx[i].match(REvalue);
						value = value[0];
						key = key[0].substring(1);
						if (!isNaN(parseInt(key, 10))) {
							options[value] = parseFloat(key);
						} else{
							switch (key) {
								case 'true':
									options[value] = true;
									break;
								case 'false':
									options[value] = false;
									break;
								default:
									options[value] = key;
							}
						}
					}
				}
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


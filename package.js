Package.describe({
	name: 'rendro:easy-pie-chart',
	version: '2.2.0',
	summary: 'Meteor package for jQuery easyPieChart plugin!',
	git: 'https://github.com/dotansimha/easy-pie-chart.git',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('METEOR@0.9.0.1');
    api.use('jquery', 'client');

	api.add_files(['dist/jquery.easypiechart.js'], 'client');
});

Package.onTest(function (api) {
	api.use('tinytest');
	api.use('rendro:easy-pie-chart');
});

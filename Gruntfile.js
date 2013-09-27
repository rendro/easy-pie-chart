module.exports = function(grunt) {

	var srcDir      = 'src/';
	var destDir     = 'dist/';
	var tmpDir      = 'tmp/';
	var vanillaName = 'easypiechart.js';
	var jqueryName  = 'jquery.' + vanillaName;
	var angularName = 'angular.' + vanillaName;

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		clean: {
			all: [destDir, tmpDir],
			tmp: [tmpDir]
		},

		concat: {
			vanillaCanvas: {
				src: [
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName
				],
				dest: tmpDir + 'canvas/' + vanillaName
			},
			jqueryCanvas: {
				src: [
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName,
					srcDir + 'jquery.plugin.js'
				],
				dest: tmpDir + 'canvas/' + jqueryName
			},
			angularCanvas: {
				src: [
					srcDir + 'angular.directive.js',
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName
				],
				dest: tmpDir + 'canvas/' + angularName
			},
			vanillaSVG: {
				src: [
					srcDir + 'renderer/svg.js',
					srcDir + vanillaName
				],
				dest: tmpDir + 'svg/' + vanillaName
			},
			jquerySVG: {
				src: [
					srcDir + 'renderer/svg.js',
					srcDir + vanillaName,
					srcDir + 'jquery.plugin.js'
				],
				dest: tmpDir + 'svg/' + jqueryName
			},
			angularSVG: {
				src: [
					srcDir + 'angular.svg.js',
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName
				],
				dest: tmpDir + 'svg/' + angularName
			}
		},

		wrap: {
			vanillaCanvas: {
				options: {
					wrapper: [
						'(function() {',
						'window.EasyPieChart = EasyPieChart;}());'
					]
				},
				src: [tmpDir + 'canvas/' + vanillaName],
				dest: destDir + 'canvas/' + vanillaName
			},
			jqueryCanvas: {
				options: {
					wrapper: [
						'(function($) {',
						'}(jQuery));'
					]
				},
				src: [tmpDir + 'canvas/' + jqueryName],
				dest: destDir + 'canvas/' + jqueryName
			},
			angularCanvas: {
				options: {
					wrapper: [
						'(function() {',
						'}());'
					]
				},
				src: [tmpDir + 'canvas/' + angularName],
				dest: destDir + 'canvas/' + angularName
			},
			vanillaSVG: {
				options: {
					wrapper: [
						'(function() {',
						'window.EasyPieChart = EasyPieChart;}());'
					]
				},
				src: [tmpDir + 'svg/' + vanillaName],
				dest: destDir + 'svg/' + vanillaName
			},
			jquerySVG: {
				options: {
					wrapper: [
						'(function($) {',
						'}(jQuery));'
					]
				},
				src: [tmpDir + 'svg/' + jqueryName],
				dest: destDir + 'svg/' + jqueryName
			},
			angularSVG: {
				options: {
					wrapper: [
						'(function() {',
						'}());'
					]
				},
				src: [tmpDir + 'svg/' + angularName],
				dest: destDir + 'svg/' + angularName
			}
		},

		usebanner: {
			options: {
				position: 'top',
				banner: '/**!\n' +
						' * <%= pkg.name %>\n' +
						' * <%= pkg.description %>\n' +
						' *\n' +
						' * @license <%= pkg.license %>\n'+
						' * @author <%= pkg.author.name %> <<%= pkg.author.email %>> (<%= pkg.author.url %>)\n' +
						' * @version <%= pkg.version %>\n' +
						' **/\n'
			},
			files: {
				src: [
					destDir + 'canvas/' + vanillaName,
					destDir + 'canvas/' + jqueryName,
					destDir + 'canvas/' + angularName,
					destDir + 'svg/' + vanillaName,
					destDir + 'svg/' + jqueryName,
					destDir + 'svg/' + angularName
				]
			}
		},

		uglify: {
			dist: {
				options: {
					report: 'gzip',
					preserveComments: 'some'
				},
				files: {
					'dist/canvas/easypiechart.min.js': ['dist/canvas/easypiechart.js'],
					'dist/canvas/jquery.easypiechart.min.js': ['dist/canvas/jquery.easypiechart.js'],
					'dist/canvas/angular.easypiechart.min.js': ['dist/canvas/angular.easypiechart.js'],
					'dist/svg/easypiechart.min.js': ['dist/svg/easypiechart.js'],
					'dist/svg/jquery.easypiechart.min.js': ['dist/svg/jquery.easypiechart.js'],
					'dist/svg/angular.easypiechart.min.js': ['dist/svg/angular.easypiechart.js']
				}
			}
		},

		watch: {
			allthethings: {
				files: [
					srcDir  + '**/*.js',
					'package.json'
				],
				tasks: ['default'],
				options: {
					debounceDelay: 250
				}
			},
			less: {
				files: 'demo/*.less',
				tasks: ['style'],
				options: {
					debounceDelay: 250
				}
			}
		},

		less: {
			demo: {
				files: {
					'demo/style.css': ['demo/style.less']
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Default task(s).
	grunt.registerTask('default', [
		'clean:all',
		'concat',
		'wrap',
		'usebanner',
		'uglify',
		'clean:tmp'
	]);

	grunt.registerTask('style', ['less']);

	grunt.registerTask('all', ['default', 'style']);

};

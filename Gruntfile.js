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
			vanilla: {
				src: [
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName
				],
				dest: tmpDir + vanillaName
			},
			jquery: {
				src: [
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName,
					srcDir + 'jquery.plugin.js'
				],
				dest: tmpDir + jqueryName
			},
			angular: {
				src: [
					srcDir + 'angular.directive.js',
					srcDir + 'renderer/canvas.js',
					srcDir + vanillaName
				],
				dest: tmpDir + angularName
			}
		},

		wrap: {
			vanilla: {
				options: {
					wrapper: [
						'(function() {',
						'window.EasyPieChart = EasyPieChart;}());'
					]
				},
				src: [tmpDir + vanillaName],
				dest: destDir + vanillaName
			},
			jquery: {
				options: {
					wrapper: [
						'(function($) {',
						'}(jQuery));'
					]
				},
				src: [tmpDir + jqueryName],
				dest: destDir + jqueryName
			},
			angular: {
				options: {
					wrapper: [
						'(function() {',
						'}());'
					]
				},
				src: [tmpDir + angularName],
				dest: destDir + angularName
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
					destDir + vanillaName,
					destDir + jqueryName,
					destDir + angularName
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
					'dist/easypiechart.min.js': ['dist/easypiechart.js'],
					'dist/jquery.easypiechart.min.js': ['dist/jquery.easypiechart.js'],
					'dist/angular.easypiechart.min.js': ['dist/angular.easypiechart.js']
				}
			}
		},

		watch: {
			allthethings: {
				files: srcDir  + '**/*.js',
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

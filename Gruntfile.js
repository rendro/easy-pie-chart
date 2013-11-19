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

		jshint: {
			files: ['src/*.js', 'test/**/*.js'],
			options: {}
		},

		karma: {
			unit: {
				configFile: 'karma.conf.coffee'
			},
			ci: {
				configFile: 'karma.conf.coffee',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		},

		less: {
			demo: {
				files: {
					'demo/style.css': ['demo/style.less']
				}
			}
		},

		umd: {
			vanilla: {
				src: tmpDir + vanillaName,
				dest: destDir + vanillaName,
				objectToExport: 'EasyPieChart',
				amdModuleId: 'EasyPieChart',
				globalAlias: 'EasyPieChart'
			},
			jquery: {
				src: tmpDir + jqueryName,
				dest: destDir + jqueryName,
				amdModuleId: 'EasyPieChart',
				deps: {
					'default': ['$'],
					amd: ['jquery'],
					cjs: ['jquery'],
					global: ['jQuery']
				}
			},
			anuglar: {
				src: tmpDir + angularName,
				dest: destDir + angularName,
				amdModuleId: 'EasyPieChart',
				deps: {
					'default': ['anuglar'],
					amd: ['anuglar'],
					cjs: ['anuglar'],
					global: ['anuglar']
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-umd');

	// Default task(s).
	grunt.registerTask('default', [
		'clean:all',
		'jshint',
		'concat',
		'umd',
		'usebanner',
		'uglify',
		'clean:tmp'
	]);

	grunt.registerTask('style', ['less']);

	grunt.registerTask('all', ['default', 'style']);

};

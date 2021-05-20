// Grab our gulp packages
var gulp = require( 'gulp' ),
	gutil = require( 'gulp-util' ),
	sass = require( 'gulp-sass' ),
	cssnano = require( 'gulp-cssnano' ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	jshint = require( 'gulp-jshint' ),
	uglify = require( 'gulp-uglify' ),
	concat = require( 'gulp-concat' ),
	rename = require( 'gulp-rename' ),
	plumber = require( 'gulp-plumber' ),
	svgSprite = require('gulp-svg-sprite'),
	browserSync = require( 'browser-sync' ).create();

// Compile Sass, Autoprefix and minify
gulp.task( 'styles', function () {
	return gulp.src( './assets/scss/**/*.scss' )
		.pipe( plumber( function ( error ) {
			gutil.log( gutil.colors.red( error.message ) );
			this.emit( 'end' );
		} ) )
		.pipe( sourcemaps.init() ) // Start Sourcemaps
		.pipe( sass() )
		.pipe( autoprefixer( {
			browsers: ['last 2 versions'],
			cascade: false
		} ) )
		.pipe( gulp.dest( './assets/css/' ) )
		.pipe( rename( {suffix: '.min'} ) )
		.pipe( cssnano() )
		.pipe( sourcemaps.write( '.' ) ) // Creates sourcemaps for minified styles
		.pipe( gulp.dest( './assets/css/' ) )
} );

// JSHint, concat, and minify JavaScript
gulp.task( 'site-js', function () {
	return gulp.src( [

		// Grab your custom scripts
		'./assets/js/scripts/*.js'

	] )
		.pipe( plumber() )
		.pipe( sourcemaps.init() )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( concat( 'scripts.js' ) )
		.pipe( gulp.dest( './assets/js' ) )
		.pipe( rename( {suffix: '.min'} ) )
		.pipe( uglify() )
		.pipe( sourcemaps.write( '.' ) ) // Creates sourcemap for minified JS
		.pipe( gulp.dest( './assets/js' ) )
} );


gulp.task( 'svgSprite', function() {

	var config = {
		mode: {
			symbol: { // symbol mode to build the SVG
				render: {
					css: false, // CSS output option for icon sizing
					scss: true // SCSS output option for icon sizing
				},
				dest: 'output', // destination folder
				prefix: '.icon-%s', // BEM-style prefix if styles rendered
				sprite: 'icons.svg', //generated sprite name
				example: true, // Build a sample page, please!
				svg:{
					xmlDeclaration: false,
				}
			}
		}
	};

	return gulp.src('assets/svg/originals/*.svg')

		.pipe(svgSprite(config))
		.pipe(gulp.dest('assets/svg'));

});

// Browser-Sync watch files and inject changes
gulp.task( 'browsersync', function () {
	// Watch files
	var files = [
		'./assets/css/*.css',
		'./assets/js/*.js',
		'**/*.php',
		'assets/images/**/*.{png,jpg,gif,svg,webp}',
	];

	browserSync.init( files, {
		// Replace with URL of your local site
		proxy: "http://refyne.local",
	} );

	gulp.watch( './assets/scss/**/*.scss',  gulp.series( 'styles' ) );
	gulp.watch( './assets/js/scripts/*.js',  gulp.series( 'site-js' ) ).on( 'change', browserSync.reload );

} );

// Watch files for changes (without Browser-Sync)
gulp.task( 'watch', function () {

	// Watch .scss files
	gulp.watch( './assets/scss/**/*.scss',  gulp.series( 'styles' ) );

	// Watch svg files
	gulp.watch( './assets/svg/originals/*.svg',  gulp.series( 'svgSprite' ) );

	// Watch site-js files
	gulp.watch( './assets/js/scripts/*.js',  gulp.series( 'site-js' ) );

	gulp.parallel( 'browsersync' );

} );

// Run styles, site-js and foundation-js
gulp.task( 'default', function () {
	gulp.parallel( 'styles', 'site-js', 'svgSprite' );
} );

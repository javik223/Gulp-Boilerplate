'use strict';
 
// Dependencies
const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
const sourcemaps    = require('gulp-sourcemaps');
const babel         = require('gulp-babel');
const sass          = require('gulp-sass');
const kit           = require('gulp-kit');
const uglify        = require('gulp-uglify-cli');
const browserify    = require('browserify');
const source        = require('vinyl-source-stream');
const buffer        = require('vinyl-buffer');
const autoprefixer = require('gulp-autoprefixer');


// Settings
const settings = {
    sass_folder    :   "assets/sass",
    js_folder      :   "assets/js",
    css_folder     :   "assets/css",
    image_folder   :   "assets/img",
    kit_folder     :   "src/kit",
    compass_config_file : "./config.rb"
};

// Sass options
const sassOptions = {
    errLogToConsole : true,
    outputStyle: 'expanded' // Change to compress or compact for production
}


// Static Server + watching scss/html files
gulp.task('serve', ['sass','babelify', 'kit'], function() {

    browserSync.init({
        server: "./"
    });

    // Watch changes in Sass files and apply transformation
    gulp.watch(settings.sass_folder+"/**/*.scss", ['sass']);

    // Watch changes in javascript files and apply Babel, and Browserify transpilation to ES5
    gulp.watch(settings.js_folder+"/src/**/*.js", ['babelify']);

    // Reload browser when a change is observed on javascript files in the javascript distribution folder
    gulp.watch(settings.js_folder+"/dist/**/*.js").on('change', browserSync.reload);

    // Watch changes in Kit files and apply transformation to html
    gulp.watch(settings.kit_folder+"/**/*.kit", ['kit']);

    // Reload browser when a change is observed on html files
    gulp.watch("*.html").on('change', browserSync.reload);
});


// Compile sass into CSS files
gulp.task('sass', function() {
    return gulp.src(settings.sass_folder+'/**/*.scss')
            .pipe(sourcemaps.init())
            .pipe(sass(sassOptions))
            .on('error', sass.logError)
            .pipe(sourcemaps.write())
            .pipe(autoprefixer())
            .pipe(gulp.dest(settings.css_folder));
});

// Transpile ES6 files and concat ES6 require files
gulp.task('babelify', function() {
    return browserify({entries: settings.js_folder+'/src/app.js', debug: true})
            .transform('babelify', {presets: ["es2015"], sourceMapsAbsolute: true})
            // Minify output
            .plugin('minifyify', {map: 'app.min.js.map', output: settings.js_folder+'/dist/app.min.js.map'})
            .bundle()
            .on('error', function(err) {
                console.error(err);
            })
            .pipe(source('app.min.js'))
            .pipe(buffer())
            .pipe(gulp.dest(settings.js_folder+'/dist/'));
});

// Kit Gulp Task
gulp.task('kit', function() {
    return gulp.src(settings.kit_folder+'/**/*.kit')
    .pipe(kit())
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['serve']);
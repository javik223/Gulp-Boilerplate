'use strict';

// Load common modules
// Browser Sync, Sass, Webpack
// Requirements: 
// gulp, babel-core, babel-loader, browser-sync, babel-preset-es2015, gulp-babel
// 
const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
var compass         = require('gulp-compass');
var webpack         = require('webpack-stream');
var kit             = require('gulp-kit');


// Static Server + watching scss/html files
gulp.task('serve', ['sass','babel','kit'], function() {

    browserSync.init({
        server: "./"
    });

    // Watch changes in Sass files and apply transformation
    gulp.watch("assets/sass/**/*.scss", ['sass']);

    // Watch changes in javascript files and apply transpilation to ES5
    gulp.watch("assets/js/src/**/*.js", ['babel']);

    // Reload browser when a change is observed on javascript files
    gulp.watch("assets/js/dist/**/*.js").on('change', browserSync.reload);

    // Watch changes in Kit files and apply transformation to html
    gulp.watch("src/kit/**/*.kit", ['kit']);

    // Reload browser when a change is observed on html files
    gulp.watch("*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("assets/sass/**/*.scss")
        .pipe(compass({
            config_file: './config.rb',
            css: 'assets/css',
            sass: 'assets/sass',
            image: 'assets/img'
        }).on('error', function(error) {
              // Would like to catch the error here 
              console.log(error);
              this.emit('end');
            }))
        .pipe(gulp.dest("assets/css"))
        .pipe(browserSync.stream());
});

// Use webpack to process ES6 source codes
gulp.task('babel', function() {
    return gulp.src('assets/js/src/**/*.js')
        .pipe(webpack({
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                          exclude: /(node_modules|bower_components)/,
                          loader: 'babel',
                          query: {
                            presets: ['es2015']
                          }
                      }
                ]
            },
            output: {
                filename: "app.js"
            },
            devtool: "inline-source-map"
        }).on('error', function(error){
            // Would like to catch the error here 
            console.log(error);
            this.emit('end');
        }))
        .pipe(gulp.dest('assets/js/dist/'));
});

// Kit
gulp.task('kit', function() {
    return gulp.src('src/kit/**/*.kit')
    .pipe(kit())
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['serve']);
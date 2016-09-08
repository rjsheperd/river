// TODO: Add linting
// TODO: JavaScript build
// TODO: Clean NPM and test NPM install

// Required Plugins
var gulp         = require('gulp');
var styleguide   = require('sc5-styleguide');
var sass         = require('gulp-sass');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var notify       = require('gulp-notify');
var cleanCSS     = require('gulp-clean-css');
var del          = require('del');
var rename       = require('gulp-rename');
var imagemin     = require('gulp-imagemin');
var svgSprite    = require('gulp-svg-sprite');
var plumber      = require('gulp-plumber');
var browserSync  = require('browser-sync').create();

// Variables
var src             = './src'
var dest            = './dest'
var sourceScss      = src + '/scss/*.scss'
var destCss         = dest + '/css'
var destStyleguide  = './styleguide'
var sourceImages    = src + '/images'
var destImages      = dest + '/images'
var sourceSvg       = src + '/svg'
var destSvg         = dest + '/svg'
var svgGlob         = '**/*.svg'

// Static Server + watching scss/html files
gulp.task('serve', ['devSass', 'moveImages', 'moveHtml', 'svgSprite'], function() {

    browserSync.init({
        server: dest
    });

    gulp.watch( sourceScss, ['devSass']).on('change', browserSync.reload);
    gulp.watch(sourceSvg + "/*", ['svgSprite']).on('change', browserSync.reload);
    gulp.watch(src + '/*.html', ['moveHtml']).on('change', browserSync.reload);
    gulp.watch(src + "/*", ['moveImages']).on('change', browserSync.reload);
});

// Static Server + watching scss/html files
gulp.task('serveStyleguide', ['compressImages', 'moveHtml', 'compileStyleguide'], function() {

    browserSync.init({
        server: destStyleguide
    });

    gulp.watch( sourceScss, ['compileStyleguide']).on('change', browserSync.reload);
    gulp.watch(src + '/*.html', ['moveHtml']).on('change', browserSync.reload);
    gulp.watch(src + "/*", ['compressImages']).on('change', browserSync.reload);
});

// Compile and autoprefixe Sass
// Sass: https://www.npmjs.com/package/gulp-sass
// Autoprefixer: https://github.com/postcss/autoprefixer
// Gulp Notify: https://github.com/mikaelbr/gulp-notify
gulp.task('devSass', ['clean:src'], function(){
  var stream = gulp.src(sourceScss)
    .pipe(sourcemaps.init())
    .pipe(sass({
      errLogToConsole: false,
    }))
    .on('error', function(err) {
       notify().write(err);
       this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(gulp.dest(destCss))
    .pipe(notify({ message: 'Styles task complete' }));
  return stream; // return the stream as the completion hint
});

// Compile, autoprefix and minify Sass
// Sass: https://www.npmjs.com/package/gulp-sass
// Autoprefixer: https://github.com/postcss/autoprefixer
// Gulp Notify: https://github.com/mikaelbr/gulp-notify
gulp.task('buildSass', ['clean:src'], function(cb){
  var stream = gulp.src(sourceScss)
    .pipe(sass({ errLogToConsole: false, }))
    .on('error', function(err) {
       notify().write(err);
       this.emit('end');
    })
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(cleanCSS({debug: true}, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize);
        console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(gulp.dest(destCss))
    .pipe(notify({ message: 'Styles task complete' }));
  return stream; // return the stream as the completion hint
});

// Renames files into min for dev
// https://github.com/hparra/gulp-rename
gulp.task('rename', function(){
  gulp.src(dest + '/css/app.css' )
  .pipe(rename(dest + '/css/app.min.css'))
  .pipe(gulp.dest(dest + '/css'));
});

// This moves HTML from /dev into /dest
// Depending on project this might not be needed
gulp.task('moveHtml', function() {
  gulp.src(src + '/*.html')
  .pipe(gulp.dest(dest));
});

// This moves Images from /dev into /dest
gulp.task('moveImages', function() {
  gulp.src(sourceImages + '/*')
  .pipe(gulp.dest(destImages));
});

// Compresses images and moves them to them to /dest
// https://github.com/sindresorhus/gulp-imagemin
gulp.task('compressImages', function () {
    return gulp.src(sourceImages + '/*')
        .pipe(imagemin())
        .pipe(gulp.dest(destImages))
        .pipe(notify({ message: 'Images Compressed' }));
});

// Create SVG Sprite
// https://github.com/jkphl/gulp-svg-sprite
gulp.task('svgSprite', function() {

    config       = {
        "svg": {
          "namespaceClassnames": false
        },
        "shape": {
            "dest": "."
        },
        "mode": {
            "symbol": {
                "dest": ".",
                "sprite": "sprite.svg"
                // "inline": true,
                // "example": true
            }
        }
    };

    return gulp.src(svgGlob, {cwd: sourceSvg})
        .pipe(plumber())
        .pipe(svgSprite(config)).on('error', function(error){ console.log(error); })
        .pipe(gulp.dest(destSvg))
        .pipe(notify({ message: 'SVG task complete' }));
});

// Clean out Source folder before compiling
// https://github.com/peter-vilja/gulp-clean
gulp.task('clean:src', function () {
  var stream = del([
    destImages,
    destCss,
    destSvg,
    ]);
  return stream; // return the stream as the completion hint
});

// All unprocessed styles containing the KSS markup and style
// variables. This will process the KSS markup and collects variable information.
// https://github.com/SC5/sc5-styleguide
gulp.task('styleguide:generate', function(){
  return gulp.src(sourceScss)
    .pipe(styleguide.generate({
      title: 'My styleguide',
      server: true,
      rootPath: destStyleguide,
      port: 3002,
      overviewPath: 'README.md'
    }))
    .pipe(gulp.dest(destStyleguide));
});

// Preprocessed/compiled stylesheets. This will create necessary pseudo styles
// and create the actual stylesheet to be used in the styleguide.
// https://github.com/SC5/sc5-styleguide
gulp.task('styleguide:applystyles', function() {
  return gulp.src(sourceScss + '/app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(destStyleguide));
});

// Combine tasks to create styleguide
// https://github.com/SC5/sc5-styleguide
gulp.task('compileStyleguide', ['styleguide:generate', 'styleguide:applystyles']);

// Final Tasks
gulp.task('styleguide', ['compileStyleguide', 'serveStyleguide']);
gulp.task('build', ['clean:src', 'compressImages', 'moveHtml', 'buildSass']);
gulp.task('dev', ['clean:src', 'serve']);

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var server = require('browser-sync').create();
var del = require('del');
// var htmlmin = require('gulp-htmlmin');
var rigger = require('gulp-rigger');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var newer = require('gulp-newer');

var ghPages = require('gh-pages');
var path = require('path');

gulp.task('clean', function () {
  return del('build');
});

gulp.task('css', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('js', function () {
  return gulp.src([
    'source/js/libs/*.js',
    'source/js/*.js',
  ])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.extname = '.min.js';
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('sprite', function () {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(newer('build/img'))
    .pipe(svgmin({
      plugins: [{
        removeViewBox: false,
      }]
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(rigger())
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build/"));
});

gulp.task('images', function () {
  return gulp.src(['source/img/**/*.{png,jpg,jpeg,svg}', '!source/img/sprite/*.svg'])
    .pipe(newer('build/img'))
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 0
      }),
      imageminJpegRecompress({
        progressive: true,
        max: 90,
        min: 80,
      }),
     imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{jpg,jpeg,png}', {since: gulp.lastRun('webp')})
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css', 'refresh'));
  gulp.watch('source/img/**/*.{png,jpg,jpeg,svg}', gulp.series('images', 'refresh'));
  gulp.watch('source/img/**/*.{jpg,jpeg}', gulp.series('webp', 'refresh'));
  gulp.watch('source/img/sprite/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch('source/templates/**/*.html', gulp.series('html', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
  gulp.watch('source/js/*.js', gulp.series('js', 'refresh'));
});


gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2,otf,ttf}',
    'source/video/**/*.*',
    ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('build', gulp.series('clean', 'sprite',
    gulp.parallel(
        'images',
        'webp',
        'copy',
        'css',
        'html',
        'js'
    )
));

gulp.task('start', gulp.series('build', 'server'));

gulp.task('deploy', function () {
  ghPages.publish(path.join(process.cwd(), './build'));
});

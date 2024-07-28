import gulp from 'gulp';
import { deleteAsync } from 'del';
import pug from 'gulp-pug';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import tinypng from 'gulp-tinypng-compress';
import gulpIf from 'gulp-if';
import fs from 'fs';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';

const browser = browserSync.create();
const sass = gulpSass(dartSass);

// Copy assets
function copyAsset() {
  return gulp.src(['app/assets/**/*'])
    .pipe(gulp.dest('./template/assets'))
    .pipe(browser.stream());
}
function copyJs() {
  return gulp.src(['app/js/**/*'])
    .pipe(gulp.dest('./template/js'))
    .pipe(browser.stream());
}
function copyGetfile() {
  return gulp.src(['app/views/getfile.php'])
    .pipe(gulp.dest('./template/'))
    .pipe(browser.stream());
}

// Clean source directory
function cleanSource() {
  return deleteAsync(['template/**', '!template']);
}

// Compile SCSS into CSS
function style() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./template/css'))
    .pipe(browser.stream());
}

// Compile Pug into HTML
function html() {
  return gulp.src(['app/views/**/*.pug', '!app/views/layout/*.pug', '!app/views/blocks/*.pug'])
    .pipe(pug({
      doctype: 'html',
      pretty: true
    }))
    .pipe(gulp.dest('./template'))
    .pipe(browser.stream());
}

// Optimize Images
function optimizeImages() {
  const sizeLimit = 1024 * 1024;

  return gulp.src('app/assets/images/**/*.{png,jpg,jpeg}')
    .pipe(plumber())
    .pipe(gulpIf(file => {
      const stats = fs.statSync(file.path);
      return stats.size > sizeLimit;
    }, tinypng({
      key: '3fNcnsRXNMBdhXX9hCtMbwv0QQ1XP8JS',
      sigFile: 'images/.tinypng-sigs',
      log: true
    })))
    .pipe(gulp.dest('app/assets/images'));
}

// Watch for file changes and reload
function watch() {
  browser.init({
    server: {
      baseDir: "./template"
    },
    port: 4000
  });
  gulp.watch('app/assets/**/*', copyAsset);
  gulp.watch('app/js/**/*', copyJs);
  gulp.watch('app/scss/**/*.scss', style);
  gulp.watch('app/views/**/*.pug', html);
  gulp.watch('app/views/**/*.pug').on('change', browser.reload);
}

export default gulp.series(cleanSource, copyJs, copyGetfile, gulp.parallel(copyAsset, style, html), watch, optimizeImages);

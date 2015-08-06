var gulp = require('gulp'),
  concat = require('gulp-concat');
clean = require('gulp-clean');
uglify = require('gulp-uglify');
rename = require('gulp-rename');
ts = require('gulp-typescript');
copy = require('gulp-copy');
flatten = require('gulp-flatten');
watch = require('gulp-watch');

var dist = './dist/'
var build = './build/'
var tsProject = ts.createProject('./src/tsconfig.json');

gulp.task('cleanDist', function() {
  return gulp.src(dist, {
      force: true
    })
    .pipe(clean());
});

gulp.task('cleanBuild', function() {
  return gulp.src(build, {
      force: true
    })
    .pipe(clean());
});

gulp.task('compileTs', ['cleanBuild'], function() {
  var tsResult = tsProject.src()
    .pipe(ts({
      module: 'commonjs'
    }));
  return tsResult.js
    .pipe(flatten())
    .pipe(gulp.dest(build));
});

gulp.task('bundle', ['compileTs', 'cleanDist', 'copyDecl'], function() {
  return gulp.src([
      'build/uploadCore.js',
      'build/uploadQueue.js',
      'build/uploadArea.js',
      'build/uploader.js'
    ])
    .pipe(concat('pureupload.js'))
    .pipe(gulp.dest(dist));
});

gulp.task('copyDecl', function() {
  return gulp.src('./src/**/*.d.ts')
    .pipe(flatten())
    .pipe(concat('pureupload.d.ts'))
    .pipe(gulp.dest(dist));
});

gulp.task('uglify', ['bundle'], function() {
  return gulp.src('./dist/pureupload.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('release', ['uglify'], function() {});

gulp.task('debug', ['uglify'], function() {
  return gulp;
});

gulp.task('dw', function() {
  gulp.start('debug');
  watch('./src/**/*.ts', function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return gulp.start('debug');
  });
});

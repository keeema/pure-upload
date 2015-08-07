var gulp =      require('gulp'),
  concat =      require('gulp-concat');
  clean =       require('gulp-clean');
  uglify =      require('gulp-uglify');
  rename =      require('gulp-rename');
  ts =          require('gulp-typescript');
  copy =        require('gulp-copy');
  flatten =     require('gulp-flatten');
  watch =       require('gulp-watch');
  karma =       require('gulp-karma');
  gulpFilter =  require('gulp-filter');

var dist = './dist/'
var build = './build/'
var specs = './specs/'

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

gulp.task('cleanSpecs', function() {
  return gulp.src(specs, {
      force: true
    })
    .pipe(clean());
});

gulp.task('compileTs', ['cleanBuild'], function() {
  var tsResult = tsProject.src()
    .pipe(ts({ module: 'commonjs' }));
  return tsResult.js
    .pipe(flatten())
    .pipe(gulpFilter(['*','!*.spec.js']))
    .pipe(gulp.dest(build));
});

gulp.task('compileSpecsTs', ['cleanSpecs'], function() {
  var tsResult = tsProject.src()
    .pipe(ts({ module: 'commonjs' }));
  return tsResult.js
    .pipe(flatten())
    .pipe(gulpFilter(['*.spec.js']))
    .pipe(gulp.dest(specs));
});

gulp.task('bundle', ['compileTs', 'cleanDist', 'copyDecl'], function() {
  return gulp.src([
      'build/uploadStatus.js',
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

gulp.task('uglify', ['test'], function() {
  return gulp.src('./dist/pureupload.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('test', ['bundle','compileSpecsTs'], function() {
  // Be sure to return the stream
  return gulp.src([
      './dist/pureupload.js',
      './specs/*.spec.js'
    ])
    .pipe(karma({
      configFile: './karma.conf.js',
      action: 'run'
    }));
});

gulp.task('default', ['uglify'], function() {});

gulp.task('dw', function() {
  gulp.start('default');
  watch('./src/**/*.ts', function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return gulp.start('default');
  });
});

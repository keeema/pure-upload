var gulp     = require('gulp'),
  concat     = require('gulp-concat');
  clean      = require('gulp-clean');
  uglify     = require('gulp-uglify');
  rename     = require('gulp-rename');
  ts         = require('gulp-typescript');
  copy       = require('gulp-copy');
  flatten    = require('gulp-flatten');
  watch      = require('gulp-watch');
  karma      = require('gulp-karma');
  gulpFilter = require('gulp-filter');
  foreach    = require('gulp-foreach');
  insert     = require('gulp-insert');
  merge      = require('merge2');
  replace     = require('gulp-replace');

var dist = './dist/'
var build = './build/'
var specs = './specs/'
var pkg = './package/'
var bundle = './bundle'

var tsProject = ts.createProject({
  module: 'commonjs',
  declarationFiles: true
});

gulp.task('cleanBuild', function() {
  return gulp.src(build, {
      force: true
    })
    .pipe(clean());
});

gulp.task('cleanDist', function() {
  return gulp.src(dist, {
      force: true
    })
    .pipe(clean());
});

gulp.task('copyTsToBuild', ['cleanBuild'], function() {
  return gulp.src(['./src/**/*.ts', '!./src/**/*.d.ts', '!./src/**/*.spec.ts'])
    .pipe(flatten())
    .pipe(gulp.dest(build));
});

gulp.task('addExports', ['copyTsToBuild'], function() {
  return gulp.src('build/*.ts')
    .pipe(foreach(function(stream, file) {
      return stream
        .pipe(insert.prepend('export '))
    }))
    .pipe(gulp.dest(build));
});

gulp.task('bundleTs', ['addExports'], function() {
  return gulp.src(['./build/*.ts', '!./build/*.spec.ts'])
    .pipe(concat('pureupload.ts'))
    .pipe(gulp.dest(build));
});

gulp.task('removeCompileSources',['bundleTs'], function() {
  return gulp.src(['./build/*.ts','!./build/pureupload.ts', '!./build/*.spec.ts'], {
      force: true
    })
    .pipe(clean());
});

gulp.task('addModule', ['removeCompileSources'], function() {
  return gulp.src('build/pureupload.ts')
    .pipe(foreach(function(stream, file) {
      return stream
        .pipe(insert.prepend('module pu {'))
        .pipe(insert.append('}'))
    }))
    .pipe(gulp.dest(build));
});
gulp.task('compileTs', ['addModule', 'cleanDist'], function() {
  var tsResult = gulp.src(['./build/*.ts'])
    .pipe(ts(tsProject));

  return merge([
    tsResult.dts.pipe(gulp.dest(dist)),
    tsResult.js.pipe(gulp.dest(dist))
  ]);
});

gulp.task('uglify', ['compileTs'], function() {
  return gulp.src('./dist/pureupload.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('default', ['uglify'], function() {});

///////////////////////////////
gulp.task('cleanSpecs', function() {
  return gulp.src(specs, {
      force: true
    })
    .pipe(clean());
});

gulp.task('copyTsToSpecs', ['cleanSpecs'], function() {
  return gulp.src(['./src/**/*.ts', '!./src/**/*.d.ts'])
    .pipe(flatten())
    .pipe(gulp.dest(specs));
});

gulp.task('bundleTsSpec', ['copyTsToSpecs'], function() {
  return gulp.src(['./specs/*.ts', '!./specs/*.spec.ts'])
    .pipe(concat('pureupload.ts'))
    .pipe(gulp.dest(specs));
});

gulp.task('removeCompileSourcesSpecs', ['bundleTsSpec'], function() {
  return gulp.src(['./specs/*.ts','!./specs/pureupload.ts', '!./specs/*.spec.ts'], {
      force: true
    })
    .pipe(clean());
});

gulp.task('compileSpecsTs', ['removeCompileSourcesSpecs'], function() {
  var tsResult = gulp.src([
    './specs/*.ts',
    './decl/jasmine/**/*.d.ts'
    ])
    .pipe(ts(tsProject));

  return merge([
    tsResult.dts.pipe(gulp.dest(specs)),
    tsResult.js.pipe(gulp.dest(specs))
  ]);
});

gulp.task('removeSpecsTs', ['compileSpecsTs'], function() {
  return gulp.src(['./specs/*.ts'], {
      force: true
    })
    .pipe(clean());
});

gulp.task('test', ['removeSpecsTs'], function() {
  // Be sure to return the stream
  return gulp.src([
      './specs/pureupload.js',
      './specs/*.spec.js'
    ])
    .pipe(karma({
      configFile: './karma.conf.js',
      action: 'run'
    }));
});

///////////////////////////////
gulp.task('cleanPkg', function() {
  return gulp.src(['./package/*.*', '!./package/package.json'], {
      force: true
    })
    .pipe(clean());
});

gulp.task('copyTsToPkg', ['cleanPkg'], function() {
  return gulp.src(['./src/**/*.ts', '!./src/**/*.d.ts', '!./src/**/*.spec.ts'])
    .pipe(flatten())
    .pipe(gulp.dest(pkg));
});

gulp.task('addExportsPkg', ['copyTsToPkg'], function() {
  return gulp.src('package/*.ts')
    .pipe(foreach(function(stream, file) {
      return stream
        .pipe(insert.prepend('export '))
    }))
    .pipe(gulp.dest(pkg));
});

gulp.task('bundlePackgageParts', ['addExportsPkg'], function() {
  return gulp.src('package/*.ts')
    .pipe(concat('index.ts'))
    .pipe(gulp.dest(pkg));
});
gulp.task('removeBundledParts', ['bundlePackgageParts'], function() {
  return gulp.src(['package/*.ts', '!package/index.ts'], {
      force: true
    })
    .pipe(clean());
});

gulp.task('compilePkgTs', ['removeBundledParts'], function() {
  var tsResult = gulp.src('./package/*.ts')
      .pipe(ts(tsProject));

  return merge([
    tsResult.dts.pipe(gulp.dest(pkg)),
    tsResult.js.pipe(gulp.dest(pkg))
  ]);
});

gulp.task('createPkgModuleDefinition', ['compilePkgTs'], function(){
  return gulp.src(['./package/index.d.ts'])
    .pipe(replace('declare ', ''))
    .pipe(insert.prepend('declare module "pureupload" {\n'))
    .pipe(insert.append('}'))
    .pipe(gulp.dest(pkg));
});

gulp.task('renamePkgDefinition', ['createPkgModuleDefinition'], function(){
  return gulp.src('./package/index.d.ts')
    .pipe(rename('pureupload.d.ts'))
    .pipe(gulp.dest(pkg));
});

gulp.task('removeOriginalDefinition', ['renamePkgDefinition'], function() {
  return gulp.src('./package/index.d.ts', {
      force: true
    })
    .pipe(clean());
});


gulp.task('package', ['removeOriginalDefinition'], function() {});

gulp.task('dw', function() {
  gulp.start('test');
  watch('./src/**/*.ts', function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return gulp.start('test');
  });
});

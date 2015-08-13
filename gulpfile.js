var gulp      = require('gulp'),
  concat      = require('gulp-concat');
  clean       = require('gulp-clean');
  uglify      = require('gulp-uglify');
  rename      = require('gulp-rename');
  ts          = require('gulp-typescript');
  copy        = require('gulp-copy');
  flatten     = require('gulp-flatten');
  watch       = require('gulp-watch');
  karma       = require('gulp-karma');
  gulpFilter  = require('gulp-filter');
  foreach     = require('gulp-foreach');
  insert      = require('gulp-insert');
  merge       = require('merge2');
  replace     = require('gulp-replace');
  runSequence = require('run-sequence');

var dist = './dist/';
var build = './build/';
var specs = './specs/';
var pkg = './package/';
var bundle = './bundle';
var examplePublic = './example/public/';

var tsProject = ts.createProject({
  module: 'commonjs',
  declarationFiles: true
});

var tsProjectExample = ts.createProject({
  module: 'commonjs'
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

gulp.task('dist', ['uglify'], function() {});

gulp.task('default', ['test', 'dist', 'package', 'example'], function() {});

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

  return tsResult.js.pipe(gulp.dest(specs))

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
    .pipe(insert.prepend('declare module "pure-upload" {\n'))
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

/////////////////////////////
gulp.task('cleanExamplePublic', function() {
  return gulp.src('./example/public/*.*', {
      force: true
    })
    .pipe(clean());
});

gulp.task('cleanExampleBackend',['cleanExamplePublic'], function() {
  return gulp.src('./example.js', {
      force: true
    })
    .pipe(clean());
});

gulp.task('copyHtmlExample', ['cleanExampleBackend'], function() {
  return gulp.src(['./example/src/*.html','./example/src/*.css'])
    .pipe(flatten())
    .pipe(gulp.dest(examplePublic));
});

gulp.task('copyDistLib', ['copyHtmlExample'], function() {
  return gulp.src(['./dist/pureupload.js'])
    .pipe(flatten())
    .pipe(gulp.dest(examplePublic));
});

gulp.task('compileExampleTs', ['copyDistLib'], function() {
  var tsResult = gulp.src([
      "./dist/**/*.d.ts",
      "./example/src/**/*.ts"
      ])
      .pipe(flatten())
      .pipe(ts(tsProjectExample));

  return tsResult.js.pipe(gulp.dest(examplePublic));
});

gulp.task('compileExampleBackendTs', ['compileExampleTs'], function() {
  var tsResult =
      gulp.src(['./example.ts','./decl/**/*.d.ts'])
      .pipe(ts(tsProjectExample));

  return tsResult.js.pipe(gulp.dest('./'));
});

gulp.task('example', ['compileExampleBackendTs'], function() {});

/////

gulp.task('dwd', function() {
  runSequence('dist','test')
  watch('./src/**/*.ts', function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return runSequence('dist','test');
  });
});

gulp.task('dwp', function() {
  runSequence('package','test')
  watch('./src/**/*.ts', function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return runSequence('package','test');
  });
});

gulp.task('dwe', function() {
  runSequence('dist', 'test', 'example');
  watch(['./src/**/*.ts', './example/src/**/*.ts', './example.ts'], function() {
    console.log('Build started', (new Date(Date.now())).toString());
    return runSequence('dist', 'test', 'example');
  });
});

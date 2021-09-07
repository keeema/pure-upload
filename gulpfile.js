var gulp = require("gulp"),
    concat = require("gulp-concat"),
    clean = require("gulp-clean"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    ts = require("gulp-typescript"),
    flatten = require("gulp-flatten"),
    karma = require("karma"),
    tap = require("gulp-tap"),
    insert = require("gulp-insert"),
    merge = require("merge2"),
    replace = require("gulp-replace"),
    runSequence = require("gulp4-run-sequence");

var watch = gulp.watch;
var dist = "./dist/";
var build = "./build/";
var specs = "./specs/";
var pkg = "./package/";
var examplePublic = "./example/public/";

var tsProject = ts.createProject("./src/tsconfig.json");
var specTsProject = ts.createProject("./src/tsconfig.json");
var examplePageTsProject = ts.createProject("./src/tsconfig.json");
var exampleServerTsProject = ts.createProject("./src/tsconfig.json");
var packageTsProject = ts.createProject("./src/tsconfig.json");

// var tsProjectExample = ts.createProject({
//     target: "es5",
//     module: "commonjs",
//     strict: true,
//     noUnusedLocals: true,
//     noUnusedParameters: true,
//     noImplicitReturns: true,
//     noFallthroughCasesInSwitch: true,
//     skipLibCheck: true,
// });

gulp.task("cleanBuild", function () {
    return gulp
        .src(build, {
            force: true,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task("cleanDist", function () {
    return gulp
        .src(dist, {
            force: true,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task(
    "copyTsToBuild",
    gulp.series("cleanBuild", function () {
        return gulp.src(["./src/**/*.ts", "!./src/**/*.d.ts", "!./src/**/*.spec.ts"]).pipe(flatten()).pipe(gulp.dest(build));
    })
);

gulp.task(
    "addExports",
    gulp.series("copyTsToBuild", function () {
        return gulp
            .src("build/*.ts")
            .pipe(
                tap(function (file) {
                    file.contents = Buffer.concat([Buffer.from("export "), file.contents]);
                    return file;
                })
            )
            .pipe(gulp.dest(build));
    })
);

gulp.task(
    "bundleTs",
    gulp.series("addExports", function () {
        return gulp.src(["./build/*.ts", "!./build/*.spec.ts"]).pipe(concat("pureupload.ts")).pipe(gulp.dest(build));
    })
);

gulp.task(
    "removeCompileSources",
    gulp.series("bundleTs", function () {
        return gulp
            .src(["./build/*.ts", "!./build/pureupload.ts", "!./build/*.spec.ts"], {
                force: true,
            })
            .pipe(clean());
    })
);

gulp.task(
    "addModule",
    gulp.series("removeCompileSources", function () {
        return gulp
            .src("build/pureupload.ts")
            .pipe(
                tap(function (file) {
                    file.contents = Buffer.concat([Buffer.from("module pu {"), file.contents]);
                    return file;
                })
            )
            .pipe(
                tap(function (file) {
                    file.contents = Buffer.concat([file.contents, Buffer.from("}")]);
                    return file;
                })
            )

            .pipe(gulp.dest(build));
    })
);

gulp.task(
    "compileTs",
    gulp.series("addModule", "cleanDist", function () {
        var tsResult = gulp.src(["./build/*.ts"], { allowEmpty: true }).pipe(tsProject());

        return merge([tsResult.dts.pipe(gulp.dest(dist)), tsResult.js.pipe(gulp.dest(dist))]);
    })
);

gulp.task(
    "uglify",
    gulp.series("compileTs", function () {
        return gulp
            .src("./dist/pureupload.js")
            .pipe(
                rename({
                    suffix: ".min",
                })
            )
            .pipe(uglify())
            .pipe(gulp.dest(dist));
    })
);

gulp.task("dist", gulp.series("uglify"));

///////////////////////////////
gulp.task("cleanSpecs", function () {
    return gulp
        .src(specs, {
            force: true,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task(
    "copyTsToSpecs",
    gulp.series("cleanSpecs", function () {
        return gulp.src(["./src/**/*.ts", "!./src/**/*.d.ts"], { allowEmpty: true }).pipe(flatten()).pipe(gulp.dest(specs));
    })
);

gulp.task(
    "bundleTsSpec",
    gulp.series("copyTsToSpecs", function () {
        return gulp.src(["./specs/*.ts", "!./specs/*.spec.ts"]).pipe(concat("pureupload.ts")).pipe(gulp.dest(specs));
    })
);

gulp.task(
    "removeCompileSourcesSpecs",
    gulp.series("bundleTsSpec", function () {
        return gulp
            .src(["./specs/*.ts", "!./specs/pureupload.ts", "!./specs/*.spec.ts"], {
                force: true,
            })
            .pipe(clean());
    })
);

gulp.task(
    "compileSpecsTs",
    gulp.series("removeCompileSourcesSpecs", function () {
        var tsResult = gulp.src(["./specs/*.ts"]).pipe(specTsProject());

        return tsResult.js.pipe(gulp.dest(specs));
    })
);

gulp.task(
    "removeSpecsTs",
    gulp.series("compileSpecsTs", function () {
        return gulp
            .src(["./specs/*.ts"], {
                force: true,
            })
            .pipe(clean());
    })
);

gulp.task(
    "test",
    gulp.series("removeSpecsTs", function (done) {
        new karma.Server(karma.config.parseConfig(__dirname + "/karma.conf.js"), done).start();
    })
);

///////////////////////////////
gulp.task("cleanPkg", function () {
    return gulp
        .src(["./package/*.*"], {
            force: true,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task(
    "copyTsToPkg",
    gulp.series("cleanPkg", function () {
        return gulp
            .src(["./src/**/*.ts", "!./src/**/*.d.ts", "!./src/**/*.spec.ts", "./package.json", "./README.md", "./CHANGELOG.md"], {
                allowEmpty: true,
            })
            .pipe(flatten())
            .pipe(gulp.dest(pkg));
    })
);

gulp.task(
    "addExportsPkg",
    gulp.series("copyTsToPkg", function () {
        return gulp
            .src("package/*.ts")
            .pipe(
                tap(function (file) {
                    file.contents = Buffer.concat([Buffer.from("export "), file.contents]);
                    return file;
                })
            )
            .pipe(gulp.dest(pkg));
    })
);

gulp.task(
    "bundlePackageParts",
    gulp.series("addExportsPkg", function () {
        return gulp.src("package/*.ts").pipe(concat("index.ts")).pipe(gulp.dest(pkg));
    })
);

gulp.task(
    "removeBundledParts",
    gulp.series("bundlePackageParts", function () {
        return gulp
            .src(["package/*.ts", "!package/index.ts"], {
                force: true,
            })
            .pipe(clean());
    })
);

gulp.task(
    "compilePkgTs",
    gulp.series("removeBundledParts", function () {
        var tsResult = gulp.src("./package/*.ts").pipe(packageTsProject());

        return merge([tsResult.dts.pipe(gulp.dest(pkg)), tsResult.js.pipe(gulp.dest(pkg))]);
    })
);

gulp.task(
    "createPkgModuleDefinition",
    gulp.series("compilePkgTs", function () {
        return gulp
            .src(["./package/index.d.ts"])
            .pipe(replace("declare ", ""))
            .pipe(insert.prepend('declare module "pure-upload" {\n'))
            .pipe(insert.append("}"))
            .pipe(gulp.dest(pkg));
    })
);

gulp.task(
    "renamePkgDefinition",
    gulp.series("createPkgModuleDefinition", function () {
        return gulp.src("./package/index.d.ts").pipe(rename("pureupload.d.ts")).pipe(gulp.dest(pkg));
    })
);

gulp.task(
    "removeOriginalDefinition",
    gulp.series("renamePkgDefinition", function () {
        return gulp
            .src("./package/index.d.ts", {
                force: true,
            })
            .pipe(clean());
    })
);

gulp.task("package", gulp.series("removeOriginalDefinition"));

/////////////////////////////
gulp.task("cleanExamplePublic", function () {
    return gulp
        .src("./example/public/*.*", {
            force: true,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task(
    "cleanExampleBackend",
    gulp.series("cleanExamplePublic", function () {
        return gulp
            .src("./example.js", {
                force: true,
                allowEmpty: true,
            })
            .pipe(clean());
    })
);

gulp.task(
    "copyHtmlExample",
    gulp.series("cleanExampleBackend", function () {
        return gulp
            .src(["./example/src/*.html", "./example/src/*.css"], { allowEmpty: true })
            .pipe(flatten())
            .pipe(gulp.dest(examplePublic));
    })
);

gulp.task(
    "copyDistLib",
    gulp.series("copyHtmlExample", function () {
        return gulp.src(["./dist/pureupload.js"]).pipe(flatten()).pipe(gulp.dest(examplePublic));
    })
);

gulp.task(
    "compileExampleTs",
    gulp.series("copyDistLib", function () {
        var tsResult = gulp.src(["./dist/**/*.d.ts", "./example/src/**/*.ts"]).pipe(flatten()).pipe(examplePageTsProject());

        return tsResult.js.pipe(gulp.dest(examplePublic));
    })
);

gulp.task(
    "compileExampleBackendTs",
    gulp.series("compileExampleTs", function () {
        var tsResult = gulp.src(["./example.ts", "./decl/**/*.d.ts"]).pipe(exampleServerTsProject());

        return tsResult.js.pipe(gulp.dest("./"));
    })
);

gulp.task("example", gulp.series("compileExampleBackendTs"));

/////

gulp.task("dwd", function () {
    runSequence("dist", "test");
    watch("./src/**/*.ts", function () {
        console.log("Build started", new Date(Date.now()).toString());
        return runSequence("dist", "test");
    });
});

gulp.task("dwp", function () {
    runSequence("package", "test");
    watch("./src/**/*.ts", function () {
        console.log("Build started", new Date(Date.now()).toString());
        return runSequence("package", "test");
    });
});

gulp.task("dwe", function () {
    runSequence("dist", "test", "example");
    watch(["./src/**/*.ts", "./example/src/**/*.ts", "./example.ts"], function () {
        console.log("Build started", new Date(Date.now()).toString());
        return runSequence("dist", "test", "example");
    });
});

gulp.task("default", gulp.series("test", "dist", "package", "example"));

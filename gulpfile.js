"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

var gulp        = require("gulp"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    runSequence = require("run-sequence"),
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer");

//******************************************************************************
//* LINT ALL
//******************************************************************************
gulp.task("lint", function() {
    
    var config =  { formatter: "verbose", emitError: (process.env.CI) ? true : false };
    
    return gulp.src([
        "src/**/**.ts",
        "test/**/**.test.ts"
    ])
    .pipe(tslint(config))
    .pipe(tslint.report());

});

//******************************************************************************
//* BUILD SOURCE
//******************************************************************************
var tsLibProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build", function() {
    return gulp.src([
        "./src/**/**.ts",
        "./src/**/**.tsx"
    ])
    .pipe(tsLibProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("temp/"));
});

//******************************************************************************
//* BUNDLE SOURCE
//******************************************************************************
gulp.task("bundle", function() {

  var mainFilePath = "temp/main.js";
  var outputFolder   = "bundle";
  var outputFileName = "app.js";

  var bundler = browserify({
    debug: true
  });

  // TS compiler options are in tsconfig.json file
  return bundler.add(mainFilePath)
                .bundle()
                .pipe(source(outputFileName))
                .pipe(buffer())
                .pipe(gulp.dest(outputFolder));
});

//******************************************************************************
//* TASK GROUPS
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence(
    "lint",
    "build",
    "bundle",
    cb);
});

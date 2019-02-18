/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulpfile.js/tasks. Any files in that directory get
  automatically required below.
*/

const gulp = require("gulp");
const os = require("os");
const fs = require("fs");
const del = require("del");
const path = require("path");
const projectPath = require("./lib/projectPath");
const getEnabledTasks = require("./lib/getEnabledTasks");

// Globally expose config objects
global.PATH_CONFIG = require("./lib/get-path-config");
global.TASK_CONFIG = require("./lib/get-task-config");

require("./tasks/browserSync");
require("./tasks/clean");
require("./tasks/fonts");
require("./tasks/html");
require("./tasks/images");
require("./tasks/init");
require("./tasks/init-config");
require("./tasks/replace-files");
require("./tasks/sizereport");
require("./tasks/static");
require("./tasks/stylesheets");
require("./tasks/svgSprite");
require("./tasks/watch");
require("./tasks/webpackProduction");
require("./tasks/rev");

// Initialize any additional user-provided tasks
const init = TASK_CONFIG.additionalTasks.initialize || function() {};
init(gulp, PATH_CONFIG, TASK_CONFIG);

const noop = cb => {
  cb();
};

gulp.task("build", function(done) {
  global.production = true;

  // Build to a temporary directory, then move compiled files as a last step
  PATH_CONFIG.finalDest = PATH_CONFIG.dest;
  PATH_CONFIG.dest = PATH_CONFIG.temp
    ? projectPath(PATH_CONFIG.temp)
    : path.join(os.tmpdir(), "blendid");

  // Make sure the temp directory exists and is empty
  del.sync(PATH_CONFIG.dest, { force: true });
  fs.mkdirSync(PATH_CONFIG.dest);

  const tasks = getEnabledTasks("production");
  const rev = TASK_CONFIG.production.rev ? "rev" : noop;
  const staticFiles = TASK_CONFIG.static ? "static" : noop;
  const { prebuild, postbuild } = TASK_CONFIG.additionalTasks.production;

  const runTasks = gulp.series(
    prebuild || noop,
    tasks.assetTasks || noop,
    tasks.codeTasks || noop,
    rev,
    "size-report",
    staticFiles,
    postbuild || noop,
    "replaceFiles"
  );
  runTasks();
  done();
});

gulp.task("default", function(done) {
  const tasks = getEnabledTasks("watch");
  const staticFiles = TASK_CONFIG.static ? "static" : noop;
  const { prebuild, postbuild } = TASK_CONFIG.additionalTasks.development;

  const runTasks = gulp.series(
    "clean",
    prebuild || noop,
    tasks.assetTasks || noop,
    tasks.codeTasks || noop,
    staticFiles,
    postbuild || noop,
    "watch"
  );
  runTasks();
  done();
});

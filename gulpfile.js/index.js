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

const areIntlLocalesSupported = require("intl-locales-supported").default;
const localesMyAppSupports = TASK_CONFIG.locales || ["cs", "en"];

if (global.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and patch the constructors we need with the polyfill's.
    const IntlPolyfill = require("intl");
    Intl.NumberFormat = IntlPolyfill.NumberFormat;
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
  }
} else {
  // No `Intl`, so use and load the polyfill.
  global.Intl = require("intl");
}

require("./tasks/browserSync");
require("./tasks/clean");
require("./tasks/cloudinary");
require("./tasks/fonts");
require("./tasks/html");
require("./tasks/images");
require("./tasks/init");
require("./tasks/init-config");
require("./tasks/javascripts");
require("./tasks/sizereport");
require("./tasks/static");
require("./tasks/stylesheets");
require("./tasks/watch");
require("./tasks/rev");
require("./tasks/workboxBuild");

// Initialize any additional user-provided tasks
const init = TASK_CONFIG.additionalTasks.initialize || function() {};
init(gulp, PATH_CONFIG, TASK_CONFIG);

const devTasks = function() {
  const { assetTasks, codeTasks }  = getEnabledTasks("watch");
  const staticFiles = TASK_CONFIG.static ? "static" : null;
  const workboxBuild = TASK_CONFIG.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild } = TASK_CONFIG.additionalTasks.development;

  return [
    "clean",
    prebuild,
    assetTasks && gulp.parallel(assetTasks),
    codeTasks && gulp.parallel(codeTasks),
    staticFiles,
    postbuild,
    workboxBuild,
    "watch"
  ].filter(Boolean);
};

const prodTasks = function() {
  global.production = true;

  const { assetTasks, codeTasks } = getEnabledTasks("production");
  const rev = TASK_CONFIG.production.rev ? "rev" : null;
  const staticFiles = TASK_CONFIG.static ? "static" : null;
  const workboxBuild = TASK_CONFIG.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild } = TASK_CONFIG.additionalTasks.production;

  return [
    "clean",
    prebuild,
    assetTasks && gulp.parallel(assetTasks),
    codeTasks && gulp.parallel(codeTasks),
    rev,
    staticFiles,
    postbuild,
    workboxBuild,
    "size-report"
  ].filter(Boolean);
};

exports.build = gulp.series(prodTasks());
exports.default = gulp.series(devTasks());

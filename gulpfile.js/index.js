/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulpfile.js/tasks. Any files in that directory get
  automatically required below.
*/

const gulp = require("gulp");
const logger = require("gulplog");
const getEnabledTasks = require("./lib/getEnabledTasks");

// TODO: stop polluting global scope, inject config via registries
// Globally expose config objects
global.PATH_CONFIG = require("./lib/get-path-config");
global.TASK_CONFIG = require("./lib/get-task-config");

// TODO: rework this to REGISTRIES https://gulpjs.com/docs/en/advanced/creating-custom-registries
require("./tasks/browserSync");
require("./tasks/clean");
require("./tasks/cloudinary");
require("./tasks/fonts");
require("./tasks/generate");
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

logger.info("Building sources", PATH_CONFIG.src);

if (Array.isArray(TASK_CONFIG.registries)) {
  for (const registry of TASK_CONFIG.registries) {
    gulp.registry(registry);
  }
}

// TODO: remove additionalTasks in favour of registries
// Initialize any additional user-provided tasks
const init = TASK_CONFIG.additionalTasks.initialize;
if (typeof init === "function") {
  logger.warn(
    "Additional tasks feature is deprecated. Please, transition to registries"
  );
  init(gulp, PATH_CONFIG, TASK_CONFIG);
}

function devTasks() {
  const { assetTasks, codeTasks } = getEnabledTasks("watch");
  const generate = TASK_CONFIG.generate ? "generate" : null;
  const staticFiles = TASK_CONFIG.static ? "static" : null;
  const workboxBuild = TASK_CONFIG.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild, code, assets } =
    TASK_CONFIG.additionalTasks.development;

  if (assets) assetTasks.push(...assets);
  if (code) codeTasks.push(...code);

  return [
    "clean",
    prebuild,
    generate,
    assetTasks && gulp.parallel(assetTasks),
    codeTasks && gulp.parallel(codeTasks),
    "html",
    staticFiles,
    postbuild,
    workboxBuild,
    "watch",
  ].filter(Boolean);
}

function prodTasks() {
  global.production = true;

  const { assetTasks, codeTasks } = getEnabledTasks("production");
  const rev = TASK_CONFIG.production.rev ? "rev" : null;
  const generate = TASK_CONFIG.generate ? "generate" : null;
  const staticFiles = TASK_CONFIG.static ? "static" : null;
  const workboxBuild = TASK_CONFIG.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild, code, assets } =
    TASK_CONFIG.additionalTasks.production;

  if (assets) assetTasks.push(...assets);
  if (code) codeTasks.push(...code);

  return [
    "clean",
    prebuild,
    generate,
    assetTasks && gulp.parallel(assetTasks),
    codeTasks && gulp.parallel(codeTasks),
    "html",
    rev,
    staticFiles,
    postbuild,
    workboxBuild,
    "size-report",
  ].filter(Boolean);
}

exports.build = gulp.series(prodTasks());
exports.default = gulp.series(devTasks());

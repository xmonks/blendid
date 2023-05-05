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
const getEnabledTasks = require("./lib/getEnabledTasks.js");
const pathConfig = require("./lib/get-path-config.js");
const taskConfig = require("./lib/get-task-config.js");

const BrowserSyncRegistry = require("./tasks/browserSync.js");
const WatchRegistry = require("./tasks/watch.js");
const CleanRegistry = require("./tasks/clean.js");
const CloudinaryRegistry = require("./tasks/cloudinary.js");
const ESBuildRegistry = require("./tasks/esbuild.js");
const FontsRegistry = require("./tasks/fonts.js");
const GenerateRegistry = require("./tasks/generate.js");
const HtmlRegistry = require("./tasks/html.js");
const ImagesRegistry = require("./tasks/images.js");
const InitRegistry = require("./tasks/init.js");
const InitConfigRegistry = require("./tasks/init-config.js");
const JavaScriptsRegistry = require("./tasks/javascripts.js");
const SizeReportRegistry = require("./tasks/sizereport.js");
const StaticRegistry = require("./tasks/static.js");
const StyleSheetsRegistry = require("./tasks/stylesheets.js");
const WorkboxBuildRegistry = require("./tasks/workboxBuild.js");
const RevRegistry = require("./tasks/rev.js");

logger.info("Building sources", pathConfig.src);

gulp.registry(new CleanRegistry(taskConfig.clean, pathConfig));
gulp.registry(new CloudinaryRegistry(taskConfig.cloudinary, pathConfig));
gulp.registry(new ESBuildRegistry(taskConfig.esbuild, pathConfig));
gulp.registry(new FontsRegistry(taskConfig.fonts, pathConfig));
gulp.registry(new GenerateRegistry(taskConfig, pathConfig));
gulp.registry(new HtmlRegistry(taskConfig, pathConfig));
gulp.registry(new ImagesRegistry(taskConfig.images, pathConfig));
gulp.registry(new InitRegistry(taskConfig, pathConfig));
gulp.registry(new InitConfigRegistry(taskConfig, pathConfig));
gulp.registry(new JavaScriptsRegistry(taskConfig.javascripts, pathConfig));
gulp.registry(new StaticRegistry(taskConfig.static, pathConfig));
gulp.registry(new StyleSheetsRegistry(taskConfig.stylesheets, pathConfig));
gulp.registry(new WorkboxBuildRegistry(taskConfig.workboxBuild, pathConfig));

if (Array.isArray(taskConfig.registries)) {
  for (const registry of taskConfig.registries) {
    gulp.registry(registry);
  }
}

// TODO: stop polluting global scope, inject config via registries
// Globally expose config objects
/** @deprecated */
global.PATH_CONFIG = pathConfig;
/** @deprecated */
global.TASK_CONFIG = taskConfig;

// TODO: remove additionalTasks.initialize in favour of registries
// Initialize any additional user-provided tasks
const init = taskConfig.additionalTasks?.initialize;
if (typeof init === "function") {
  logger.warn(
    "Initialize additional tasks feature is deprecated. Please, transition to registries."
  );
  init(gulp, pathConfig, taskConfig);
}

function devTasks() {
  gulp.registry(new BrowserSyncRegistry(taskConfig.browserSync, pathConfig));
  gulp.registry(new WatchRegistry(taskConfig, pathConfig));

  const { assetTasks, codeTasks } = getEnabledTasks(taskConfig);
  const generate = taskConfig.generate ? "generate" : null;
  const staticFiles = taskConfig.static ? "static" : null;
  const workboxBuild = taskConfig.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild, code, assets } =
    taskConfig.additionalTasks.development;

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
  gulp.registry(new SizeReportRegistry(taskConfig.sizeReport, pathConfig));
  gulp.registry(new RevRegistry(taskConfig, pathConfig));

  const { assetTasks, codeTasks } = getEnabledTasks(taskConfig);
  const rev = taskConfig.production.rev ? "rev" : null;
  const generate = taskConfig.generate ? "generate" : null;
  const staticFiles = taskConfig.static ? "static" : null;
  const workboxBuild = taskConfig.workboxBuild ? "workboxBuild" : null;
  const { prebuild, postbuild, code, assets } =
    taskConfig.additionalTasks.production;

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

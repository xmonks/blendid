/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulpfile.js/tasks. Any files in that directory get
  automatically required below.
*/

import gulp from "gulp";
import logger from "fancy-log";
import getEnabledTasks from "./lib/getEnabledTasks.mjs";
import pathConfig from "./lib/getPathConfig.mjs";
import { getTaskConfig } from "./lib/getTaskConfig.mjs";
import { BrowserSyncRegistry } from "./tasks/browserSync.mjs";
import { CleanRegistry } from "./tasks/clean.mjs";
import { CloudinaryRegistry } from "./tasks/cloudinary.mjs";
import { ESBuildRegistry } from "./tasks/esbuild.mjs";
import { FontsRegistry } from "./tasks/fonts.mjs";
import { GenerateRegistry } from "./tasks/generate.mjs";
import { HtmlRegistry } from "./tasks/html.mjs";
import { ImagesRegistry } from "./tasks/images.mjs";
import { InitRegistry } from "./tasks/init.mjs";
import { InitConfigRegistry } from "./tasks/init-config.mjs";
import { JavaScriptsRegistry } from "./tasks/javascripts.mjs";
import { SizeReportRegistry } from "./tasks/sizereport.mjs";
import { StaticRegistry } from "./tasks/static.mjs";
import { StyleSheetsRegistry } from "./tasks/stylesheets.mjs";
import { ViteRegistry } from "./tasks/vite.mjs";
import { WatchRegistry } from "./tasks/watch.mjs";
import { WorkboxBuildRegistry } from "./tasks/workboxBuild.mjs";
import { RevRegistry } from "./tasks/rev.mjs";
import projectPath from "./lib/projectPath.mjs";

logger.info("Building sources", projectPath(pathConfig.src));

const taskConfig = await getTaskConfig();

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
  gulp.registry(new ViteRegistry(taskConfig.vite, pathConfig));
  gulp.registry(new WatchRegistry(taskConfig, pathConfig));

  const { assetTasks, codeTasks } = getEnabledTasks(taskConfig);
  const html = taskConfig.html ? "html" : null;
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
    html,
    staticFiles,
    postbuild,
    workboxBuild,
    "watch",
  ].filter(Boolean);
}

function prodTasks() {
  process.env.NODE_ENV = "production";
  gulp.registry(new SizeReportRegistry(taskConfig.sizeReport, pathConfig));
  gulp.registry(new RevRegistry(taskConfig, pathConfig));

  const { assetTasks, codeTasks } = getEnabledTasks(taskConfig);
  const rev = taskConfig.production.rev ? "rev" : null;
  const html = taskConfig.html ? "html" : null;
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
    html,
    rev,
    staticFiles,
    postbuild,
    workboxBuild,
    "size-report",
  ].filter(Boolean);
}

export const build = gulp.series(prodTasks());
export const dev = gulp.series(devTasks());
export default dev;

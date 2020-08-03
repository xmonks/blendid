if (global.production) return;

const browserSync = require("browser-sync").create("blendid");
const gulp = require("gulp");
const projectPath = require("../lib/projectPath");

const browserSyncTask = function(cb) {
  const config = TASK_CONFIG.browserSync;
  if (typeof config.proxy === "string") {
    config.proxy = {
      target: config.proxy
    };
  }

  // Resolve path from project
  if (config.server && config.server.baseDir) {
    config.server.baseDir = projectPath(config.server.baseDir);
  }

  // Resolve files from project
  if (config.files) {
    config.files = config.files.map(glob => projectPath(glob));
  }

  const server = config.proxy || config.server;
  server.middleware = server.middleware || server.extraMiddlewares || [];

  browserSync.init(config);

  const output = projectPath(PATH_CONFIG.dest, "**/*");
  browserSync.watch(output).on("change", browserSync.reload);
  cb();
};

gulp.task("browserSync", browserSyncTask);
module.exports = browserSyncTask;

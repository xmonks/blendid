if (global.production) return;

const browserSync = require("browser-sync").create("blendid");
const { watch, task } = require("gulp");
const projectPath = require("../lib/projectPath");

function browsersyncReload(cb) {
  browserSync.reload();
  cb();
}
browsersyncReload.displayName = "browsersync-reload";

const browserSyncTask = function (cb) {
  const config = TASK_CONFIG.browserSync;
  if (typeof config.proxy === "string") {
    config.proxy = {
      target: config.proxy,
    };
  }

  const exclude = config.excludeFolders
    ? `!${projectPath(
        PATH_CONFIG.dest,
        `**/{${config.excludeFolders.join(",")}}/**`
      )}`
    : null;
  delete config.excludeFolders;

  const excludeFiles =
    config.excludeFiles?.map(
      (glob) => `!${projectPath(PATH_CONFIG.dest, glob)}`
    ) ?? [];
  delete config.excludeFiles;

  // Resolve path from project
  if (config.server && config.server.baseDir) {
    config.server.baseDir = projectPath(config.server.baseDir);
  }

  // Resolve files from project
  if (config.files) {
    config.files = config.files.map((glob) => projectPath(glob));
  }

  const server = config.proxy ?? config.server;
  server.middleware = server.middleware ?? server.extraMiddlewares ?? [];

  browserSync.init(config);

  const assets = projectPath(PATH_CONFIG.dest, "**/*.{html,js,css}");
  const assetsGlob = [assets, exclude].concat(excludeFiles).filter(Boolean);
  watch(assetsGlob, { events: "all" }, browsersyncReload);

  cb();
};

task("browserSync", browserSyncTask);
module.exports = browserSyncTask;

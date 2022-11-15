if (global.production) return;

const browserSync = require("browser-sync").create("blendid");
const htmlInjector = require("@silvenon/bs-html-injector");
const { watch, task } = require("gulp");
const projectPath = require("../lib/projectPath");

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

  const htmlFiles = projectPath(PATH_CONFIG.dest, "**/*.html");
  browserSync.use(htmlInjector, {
    files: htmlFiles,
  });

  browserSync.init(config);

  watch(
    [htmlFiles, exclude].concat(excludeFiles).filter(Boolean),
    { events: "all" },
    (cb) => {
      console.log("Inject HTML");
      htmlInjector();
      cb();
    }
  );

  const assets = projectPath(PATH_CONFIG.dest, "**/*.{js,css}");
  watch(
    [assets, exclude].concat(excludeFiles).filter(Boolean),
    { events: "all" },
    (cb) => {
      console.log("Inject Assets");
      htmlInjector();
      cb();

      browserSync.reload();
      cb();
    }
  );
  cb();
};

task("browserSync", browserSyncTask);
module.exports = browserSyncTask;

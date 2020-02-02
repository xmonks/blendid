const { task, series, watch } = require("gulp");
const path = require("path");
const browserSync = require("browser-sync");
const projectPath = require("../lib/projectPath");

const watchTask = function(done) {
  const watchableTasks = [
    "fonts",
    "iconFont",
    "images",
    "cloudinary",
    "svgSprite",
    "html",
    "stylesheets",
    "static"
  ];

  function getTaskPathFor(taskName) {
    switch (taskName) {
      case "iconFont":
        return PATH_CONFIG.icons;
      case "svgSprite":
        return PATH_CONFIG.icons;
      default:
        return PATH_CONFIG[taskName];
    }
  }

  watchableTasks.forEach(function(taskName) {
    const taskConfig = TASK_CONFIG[taskName];
    const taskPath = getTaskPathFor(taskName);

    if (taskConfig) {
      const srcPath = projectPath(PATH_CONFIG.src, taskPath.src);
      const globPattern =
        "**/*" +
        (taskConfig.extensions
          ? ".{" + taskConfig.extensions.join(",") + "}"
          : "");
      watch(path.join(srcPath, globPattern), series(taskName));
    }
  });
  watch(projectPath(PATH_CONFIG.dest, "**/*")).on("change", browserSync.reload);
  done();
};

task("watch", series("browserSync", watchTask));
module.exports = watchTask;

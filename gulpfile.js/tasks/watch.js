const { task, series, watch } = require("gulp");
const projectPath = require("../lib/projectPath");

const watchTask = function (done) {
  const watchableTasks = [
    "fonts",
    "iconFont",
    "images",
    "cloudinary",
    "svgSprite",
    "generate",
    "html",
    "stylesheets",
    "javascripts",
    "static",
    ...TASK_CONFIG.watch.tasks,
  ];

  function getTaskPathFor(taskName) {
    switch (taskName) {
      case "iconFont":
        return PATH_CONFIG.icons;
      case "svgSprite":
        return PATH_CONFIG.icons;
      case "generate":
        return PATH_CONFIG.data;
      default:
        return PATH_CONFIG[taskName];
    }
  }

  watchableTasks.forEach((taskName) => {
    const taskConfig = TASK_CONFIG[taskName];
    const taskPath = getTaskPathFor(taskName);

    if (taskConfig) {
      const srcPath = projectPath(PATH_CONFIG.src, taskPath.src);
      const globPattern = `**/*${
        taskConfig.extensions ? `.{${taskConfig.extensions.join(",")}}` : ""
      }`;
      const exclude = `!{${taskConfig.exclude.join(",")}}`;
      watch([globPattern, exclude], { cwd: srcPath }, task(taskName));
    }
  });
  done();
};

task("watch", series("browserSync", watchTask));
module.exports = watchTask;

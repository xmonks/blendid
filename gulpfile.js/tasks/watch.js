const DefaultRegistry = require("undertaker-registry");
const projectPath = require("../lib/projectPath");

function getTaskPathFor(taskName, pathConfig) {
  switch (taskName) {
    case "iconFont":
      return pathConfig.icons;
    case "svgSprite":
      return pathConfig.icons;
    case "generate":
      return pathConfig.data;
    default:
      return pathConfig[taskName];
  }
}

class WatchRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, series, watch }) {
    task(
      "watch",
      // TODO: make BrowserSync optional
      series("browserSync", (done) => {
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
          "esbuild",
          "static",
        ].concat(this.config.watch?.tasks);

        watchableTasks.forEach((taskName) => {
          const taskConfig = this.config[taskName];
          const taskPath = getTaskPathFor(taskName, this.pathConfig);

          if (taskConfig && taskPath) {
            const srcPath = projectPath(this.pathConfig.src, taskPath.src);
            const globPattern = `**/*${
              taskConfig.extensions ? `.{${taskConfig.extensions}}` : ""
            }`;
            const exclude = taskConfig.exclude
              ? `!{${taskConfig.exclude}}`
              : "";
            const extraWatch = taskConfig.watch ?? "";
            watch(
              [globPattern, exclude, extraWatch],
              { cwd: srcPath },
              task(taskName)
            );
          }
        });
        done();
      })
    );
  }
}

module.exports = WatchRegistry;

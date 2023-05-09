import DefaultRegistry from "undertaker-registry";
import projectPath from "../lib/projectPath.mjs";

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

export class WatchRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, series, watch }) {
    const server = this.config.vite ? "vite" : "browserSync";
    task(
      "watch",
      series(server, (done) => {
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
        watch(
          ["**/*.{json,mjs}"],
          { cwd: projectPath(this.pathConfig.src, this.pathConfig.data.src) },
          task("html")
        );
        done();
      })
    );
  }
}

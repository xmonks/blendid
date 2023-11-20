import DefaultRegistry from "undertaker-registry";
import log from "fancy-log";
import chalk from "chalk";
import projectPath from "../lib/projectPath.mjs";

export class InitConfigRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("init-config", () => {
      const configStream = src([
        "gulpfile.js/path-config.json",
        "gulpfile.js/task-config.js"
      ]).pipe(dest(projectPath("config")));

      log(
        chalk.green(
          "Adding default path-config.json and task-config.js files to ./config/"
        )
      );

      return configStream;
    });
  }
}

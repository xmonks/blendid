import DefaultRegistry from "undertaker-registry";
import logger from "gulplog";
import { styleText } from "node:util";
import projectPath from "../lib/projectPath.mjs";

/** @typedef {import("@types/gulp")} Undertaker */

export class InitConfigRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    task("init-config", () => {
      const configStream = src([
        "gulpfile.js/path-config.json",
        "gulpfile.js/task-config.js"
      ]).pipe(dest(projectPath("config")));

      logger.info(
        styleText(
          "green",
          "Adding default path-config.json and task-config.js files to ./config/"
        )
      );

      return configStream;
    });
  }
}

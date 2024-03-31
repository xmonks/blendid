import DefaultRegistry from "undertaker-registry";
import { deleteAsync } from "del";
import projectPath from "../lib/projectPath.mjs";

/** @typedef {import("@types/gulp")} Undertaker */

export class CleanRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task }) {
    task("clean", () => {
      const patterns = this.config?.patterns
        ? this.config.patterns
        : projectPath(this.pathConfig.dest);
      return deleteAsync(patterns, { force: true });
    });
  }
}

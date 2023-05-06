import DefaultRegistry from "undertaker-registry";
import del from "del";
import projectPath from "../lib/projectPath.mjs";

export class CleanRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task }) {
    task("clean", () => {
      const patterns = this.config?.patterns
        ? this.config.patterns
        : projectPath(this.pathConfig.dest);
      return del(patterns, { force: true });
    });
  }
}

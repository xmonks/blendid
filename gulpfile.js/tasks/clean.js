const DefaultRegistry = require("undertaker-registry");
const del = require("del");
const projectPath = require("../lib/projectPath");

class CleanRegistry extends DefaultRegistry {
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

module.exports = CleanRegistry;

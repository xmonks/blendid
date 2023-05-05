const DefaultRegistry = require("undertaker-registry");
const log = require("fancy-log");
const colors = require("ansi-colors");
const projectPath = require("../lib/projectPath");

class InitConfigRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("init-config", () => {
      const configStream = src([
        "gulpfile.js/path-config.json",
        "gulpfile.js/task-config.js",
      ]).pipe(dest(projectPath("config")));

      log(
        colors.green(
          "Adding default path-config.json and task-config.js files to ./config/"
        )
      );

      return configStream;
    });
  }
}

module.exports = InitConfigRegistry;

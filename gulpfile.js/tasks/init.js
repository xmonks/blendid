const DefaultRegistry = require("undertaker-registry");
const log = require("fancy-log");
const colors = require("ansi-colors");
const merge = require("merge-stream");
const projectPath = require("../lib/projectPath");

class InitRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("init", function () {
      const rootStream = src("root/*").pipe(dest(projectPath()));

      const configStream = src([
        "gulpfile.js/path-config.json",
        "gulpfile.js/task-config.js",
      ]).pipe(dest(projectPath("config")));

      const srcStream = src(["src/**/*", "src/**/.gitkeep"])
        .pipe(dest(projectPath(this.pathConfig.src)));

      log(colors.green("Generating default Blendid project files"));
      log(
        colors.yellow(`
To start the dev server:
`),
        colors.magenta(`
yarn blendid
`)
      );

      return merge(rootStream, configStream, srcStream);
    });
  }
}

module.exports = InitRegistry;

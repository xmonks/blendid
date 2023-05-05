const DefaultRegistry = require("undertaker-registry");
const sizereport = require("gulp-sizereport");
const projectPath = require("../lib/projectPath");

class SizeReportRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src }) {
    task("size-report", () =>
      src([
        projectPath(this.pathConfig.dest, "**/*"),
        "*!rev-manifest.json",
      ]).pipe(sizereport(this.config))
    );
  }
}
module.exports = SizeReportRegistry;

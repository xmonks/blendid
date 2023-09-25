import DefaultRegistry from "undertaker-registry";
import sizereport from "gulp-sizereport";
import projectPath from "../lib/projectPath.mjs";

export class SizeReportRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src }) {
    task("size-report", () =>
      src([
        projectPath(this.pathConfig.dest, "**", "*"),
        "*!rev-manifest.json"
      ]).pipe(sizereport(this.config))
    );
  }
}

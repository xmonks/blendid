import DefaultRegistry from "undertaker-registry";
import changed from "gulp-changed";
import projectPath from "../lib/projectPath.mjs";

export class FontsRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.fonts?.src ?? "",
        "**",
        `*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.fonts?.dest ?? ""),
    };
  }
  init({ task, src, dest }) {
    if (!this.config) return;

    task("fonts", () =>
      src([this.paths.src, "*!README.md"])
        .pipe(changed(this.paths.dest))
        .pipe(dest(this.paths.dest))
    );
  }
}

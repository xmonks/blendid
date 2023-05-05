const DefaultRegistry = require("undertaker-registry");
const changed = require("gulp-changed");
const projectPath = require("../lib/projectPath");

class StaticRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(pathConfig.src, pathConfig.static?.src ?? "", "**", "*"),
      dest: projectPath(pathConfig.dest, pathConfig.static?.dest ?? ""),
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;

    task("static", () =>
      src(
        this.paths.src,
        Object.assign({ dot: true }, this.config.srcOptions || {})
      )
        .pipe(changed(this.paths.dest))
        .pipe(dest(this.paths.dest))
    );
  }
}

module.exports = StaticRegistry;

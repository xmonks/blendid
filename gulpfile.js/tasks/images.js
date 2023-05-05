const DefaultRegistry = require("undertaker-registry");
const changed = require("gulp-changed");
const projectPath = require("../lib/projectPath");

class ImagesRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.images?.src,
        "**",
        `*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.images?.dest),
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;

    task("images", () =>
      src([this.paths.src, "*!README.md"])
        .pipe(changed(this.paths.dest))
        .pipe(dest(this.paths.dest))
    );
  }
}

module.exports = ImagesRegistry;

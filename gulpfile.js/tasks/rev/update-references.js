const fs = require("fs");
const DefaultRegistry = require("undertaker-registry");
const revReplace = require("gulp-rev-rewrite");
const projectPath = require("../../lib/projectPath");

// 2) Update asset references with reved filenames in compiled css + js

class RevUpdateReferencesRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("rev-update-references",  () => {
      const manifestPath = projectPath(this.pathConfig.dest, "rev-manifest.json");
      const manifest = fs.existsSync(manifestPath)
        ? fs.readFileSync(manifestPath)
        : null;
      const options =
        typeof this.config.production?.rev === "object"
          ? this.config.production.rev
          : {};

      return src(projectPath(this.pathConfig.dest, "**/**.{css,js,mjs,map}"))
        .pipe(revReplace(Object.assign(options, { manifest })))
        .pipe(dest(projectPath(this.pathConfig.dest)));
    });
  }
}

module.exports = RevUpdateReferencesRegistry;

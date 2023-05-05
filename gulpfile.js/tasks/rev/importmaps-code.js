const DefaultRegistry = require("undertaker-registry");
const revdel = require("gulp-rev-delete-original");
const rev = require("../../packages/gulp-rev");
const projectPath = require("../../lib/projectPath");

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well

class RevImportmapsCodeRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("rev-importmaps-code", () =>
      src([projectPath(this.pathConfig.dest, "**/*.{js,mjs}")])
        .pipe(rev())
        .pipe(dest(projectPath(this.pathConfig.dest)))
        .pipe(revdel())
        .pipe(
          rev.manifest(projectPath(this.pathConfig.dest, "rev-manifest.json"), {
            merge: true,
            importmap: this.config.production?.rev?.importmap,
          })
        )
        .pipe(dest("."))
    );
  }
}

module.exports = RevImportmapsCodeRegistry;

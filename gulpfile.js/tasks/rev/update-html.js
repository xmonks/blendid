const fs = require("fs");
const DefaultRegistry = require("undertaker-registry");
const when = require("gulp-if");
const revReplace = require("gulp-rev-rewrite");
const inject = require("gulp-inject");
const projectPath = require("../../lib/projectPath");

// 4) Update asset references in HTML

class RevUpdateHtmlRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    if (!this.config.html) return;
    task("update-html", () => {
      const manifestPath = projectPath(
        this.pathConfig.dest,
        "rev-manifest.json"
      );
      const manifest = fs.existsSync(manifestPath)
        ? fs.readFileSync(manifestPath)
        : null;
      const importmap = src(
        projectPath(this.pathConfig.dest, "import-map.importmap"),
        { allowEmpty: true }
      );
      return src(
        projectPath(
          this.pathConfig.dest,
          this.pathConfig.html.dest,
          "**",
          "*.html"
        )
      )
        .pipe(revReplace({ manifest }))
        .pipe(
          when(
            this.config.production?.rev?.importmap,
            inject(importmap, {
              quiet: true,
              removeTags: true,
              transform: (_, file) => file.contents.toString(),
            })
          )
        )
        .pipe(
          dest(projectPath(this.pathConfig.dest, this.pathConfig.html.dest))
        );
    });
  }
}

module.exports = RevUpdateHtmlRegistry;

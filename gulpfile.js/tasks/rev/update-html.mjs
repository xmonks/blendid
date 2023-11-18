import fs from "node:fs";
import DefaultRegistry from "undertaker-registry";
import when from "gulp-if";
import revReplace from "../../packages/gulp-rev-rewrite/index.js";
import inject from "gulp-inject";
import projectPath from "../../lib/projectPath.mjs";

// 4) Update asset references in HTML

export class RevUpdateHtmlRegistry extends DefaultRegistry {
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
              transform: (_, file) => file.contents.toString()
            })
          )
        )
        .pipe(
          dest(projectPath(this.pathConfig.dest, this.pathConfig.html.dest))
        );
    });
  }
}

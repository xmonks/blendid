import DefaultRegistry from "undertaker-registry";
import revdel from "gulp-rev-delete-original";
import rev from "../../packages/gulp-rev/index.js";
import projectPath from "../../lib/projectPath.mjs";

export class RevAssetsRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    // 1) Add md5 hashes to assets referenced by CSS and JS files
    task("rev-assets", () => {
      // Ignore files that may reference assets. We'll rev them next.
      const ignoreThese = `!${projectPath(
        this.pathConfig.dest,
        "**",
        "*.{css,js,mjs,map,json,html,txt}"
      )}`;

      return src([projectPath(this.pathConfig.dest, "**", "*"), ignoreThese])
        .pipe(rev())
        .pipe(dest(projectPath(this.pathConfig.dest)))
        .pipe(revdel())
        .pipe(
          rev.manifest(projectPath(this.pathConfig.dest, "rev-manifest.json"), {
            merge: true,
          })
        )
        .pipe(dest("."));
    });
  }
}

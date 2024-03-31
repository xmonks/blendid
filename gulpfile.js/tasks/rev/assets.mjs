import DefaultRegistry from "undertaker-registry";
import revdel from "gulp-rev-delete-original";
import rev from "../../packages/gulp-rev/index.mjs";
import projectPath from "../../lib/projectPath.mjs";
import debug from "gulp-debug";
import logger from "gulplog";

/** @typedef {import("@types/gulp")} Undertaker */

export class RevAssetsRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    // 1) Add md5 hashes to assets referenced by CSS and JS files
    task("rev-assets", () => {
      // Ignore files that may reference assets. We'll rev them next.
      const ignore = `${projectPath(
        this.pathConfig.dest,
        "**",
        "*.{css,js,mjs,map,json,html,txt}"
      )}`;

      return src(projectPath(this.pathConfig.dest, "**", "*"), { ignore })
        .pipe(debug({ title: "rev-assets:", logger: logger.debug }))
        .pipe(rev())
        .pipe(dest(projectPath(this.pathConfig.dest)))
        .pipe(revdel())
        .pipe(
          rev.manifest(projectPath(this.pathConfig.dest, "rev-manifest.json"), {
            merge: true
          })
        )
        .pipe(dest("."));
    });
  }
}

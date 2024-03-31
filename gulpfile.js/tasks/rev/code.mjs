import DefaultRegistry from "undertaker-registry";
import revdel from "gulp-rev-delete-original";
import rev from "../../packages/gulp-rev/index.mjs";
import projectPath from "../../lib/projectPath.mjs";
import debug from "gulp-debug";
import logger from "gulplog";

/** @typedef {import("@types/gulp")} Undertaker */

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well

export class RevCodeRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    task("rev-code", () =>
      src(projectPath(this.pathConfig.dest, "**", "*.css"))
        .pipe(debug({ title: "rev-code:", logger: logger.debug }))
        .pipe(rev())
        .pipe(dest(projectPath(this.pathConfig.dest)))
        .pipe(revdel())
        .pipe(
          rev.manifest(projectPath(this.pathConfig.dest, "rev-manifest.json"), {
            merge: true
          })
        )
        .pipe(dest("."))
    );
  }
}

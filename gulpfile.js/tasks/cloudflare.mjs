import projectPath from "../lib/projectPath.mjs";
import logger from "gulplog";
import debug from "gulp-debug";
import DefaultRegistry from "undertaker-registry";

/** @typedef {import("@types/nunjucks").Environment} Environment */

export class CloudflareRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.cloudflare?.src ?? "",
        "**",
        "*"
      ),
      dest: projectPath(pathConfig.dest, pathConfig.cloudflare?.dest ?? "")
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;
    task("cloudflare-pages", () =>
      src(
        this.paths.src,
        Object.assign({ dot: true, encoding: false }, this.config.srcOptions)
      )
        .pipe(debug({ title: "static:", logger: logger.debug }))
        .pipe(dest(this.paths.dest))
    );
  }
}

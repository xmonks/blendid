import DefaultRegistry from "undertaker-registry";
import { createGulpEsbuild } from "gulp-esbuild";
import gulp_mode from "gulp-mode";
import projectPath from "../lib/projectPath.mjs";
import handleErrors from "../lib/handleErrors.mjs";
import debug from "gulp-debug";
import logger from "gulplog";

/** @typedef {import("@types/gulp")} Undertaker */

const mode = gulp_mode();

export class ESBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    const modulePathConfig = pathConfig.esm ?? pathConfig.esbuild;
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        modulePathConfig?.src ?? "",
        config.extensions.length > 1 ? `*.{${config.extensions}}` : `*.${config.extensions}`
      ),
      dest: projectPath(pathConfig.dest, modulePathConfig?.dest ?? "")
    };
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    if (!this.config) return;

    const esbuild = createGulpEsbuild();
    const esbuildInc = createGulpEsbuild({ incremental: true });
    task("esbuild", () =>
      src(this.paths.src)
        .pipe(debug({ title: "esbuild:", logger: logger.debug }))
        .pipe(mode.production(esbuild(this.config.options)))
        .on("error", handleErrors)
        .pipe(mode.development(esbuildInc(this.config.options)))
        .on("error", handleErrors)
        .pipe(dest(this.paths.dest))
    );
  }
}

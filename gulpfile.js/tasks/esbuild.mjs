import DefaultRegistry from "undertaker-registry";
import { createGulpEsbuild } from "gulp-esbuild";
import projectPath from "../lib/projectPath.mjs";
import debug from "gulp-debug";
import logger from "gulplog";

/** @typedef {import("@types/gulp")} Undertaker */
export class ESBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig, mode) {
    super();
    const modulePathConfig = pathConfig.esm ?? pathConfig.esbuild;
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        modulePathConfig?.src ?? "",
        config.extensions.length > 1
          ? `*.{${config.extensions}}`
          : `*.${config.extensions}`
      ),
      dest: projectPath(pathConfig.dest, modulePathConfig?.dest ?? "")
    };
    this.mode = mode;
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
        .pipe(
          this.mode.production()
            ? esbuild(this.config.options)
            : esbuildInc(this.config.options)
        )
        .pipe(dest(this.paths.dest))
    );
  }
}

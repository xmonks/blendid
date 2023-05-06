import DefaultRegistry from "undertaker-registry";
import { createGulpEsbuild } from "gulp-esbuild";
import gulp_mode from "gulp-mode";
import projectPath from "../lib/projectPath.mjs";

const mode = gulp_mode();

export class ESBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.esbuild?.src ?? "",
        `*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.esbuild?.dest ?? ""),
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;

    const esbuild = createGulpEsbuild();
    const esbuildInc = createGulpEsbuild({ incremental: true });
    task("esbuild", () =>
      src(this.paths.src)
        .pipe(mode.production(esbuild(this.config.options)))
        .pipe(mode.development(esbuildInc(this.config.options)))
        .pipe(dest(this.paths.dest))
    );
  }
}

const DefaultRegistry = require("undertaker-registry");
const esbuild = require("gulp-esbuild");
const mode = require("gulp-mode")();
const projectPath = require("../lib/projectPath");

class ESBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.esbuild.src,
        `*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.esbuild.dest),
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;

    const esbuildInc = esbuild.createGulpEsbuild({ incremental: true });
    task("esbuild", () =>
      src(this.paths.src)
        .pipe(mode.production(esbuild(this.config.options)))
        .pipe(mode.development(esbuildInc(this.config.options)))
        .pipe(dest(this.paths.dest))
    );
  }
}

module.exports = ESBuildRegistry;

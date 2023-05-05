const DefaultRegistry = require("undertaker-registry");
const gulp = require("gulp");
const mode = require("gulp-mode")();
const changed = require("gulp-changed");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("../packages/gulp-sass-embedded");
const projectPath = require("../lib/projectPath");
const getPostCSSPlugins = require("../lib/postCSS");

class StyleSheetsRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    this.paths = {
      src: projectPath(
        pathConfig.src,
        pathConfig.stylesheets?.src ?? "",
        "**",
        `[!_]*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.stylesheets?.dest ?? ""),
    };
  }

  init({ task, src, dest }) {
    if (!this.config) return;

    const postcssTask = (done) => {
      if (this.config.sass?.includePaths) {
        this.config.sass.includePaths = this.config.sass.includePaths
          .filter(Boolean)
          .map((includePath) => projectPath(includePath));
      }

      const plugins = getPostCSSPlugins(this.config);
      return src(this.paths.src)
        .pipe(changed(this.paths.dest, { extension: ".css" }))
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass(this.config.sass).on("error", done))
        .pipe(postcss(plugins, this.config.postcss).on("error", done))
        .pipe(rename({ extname: ".css" }))
        .pipe(mode.development(sourcemaps.write()))
        .pipe(dest(this.paths.dest))
        .on("end", done);
    };

    const { alternateTask = () => postcssTask } = this.config;
    const stylesheetsTask = alternateTask(gulp, this.pathConfig, this.config);

    task("stylesheets", stylesheetsTask);
  }
}
module.exports = StyleSheetsRegistry;

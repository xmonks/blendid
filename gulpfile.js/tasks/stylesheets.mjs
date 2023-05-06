import DefaultRegistry from "undertaker-registry";
import gulp from "gulp";
import changed from "gulp-changed";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import sass from "../packages/gulp-sass-embedded/index.js";
import projectPath from "../lib/projectPath.mjs";
import getPostCSSPlugins from "../lib/postCSS.mjs";

export class StyleSheetsRegistry extends DefaultRegistry {
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
        .pipe(sass(this.config.sass).on("error", done))
        .pipe(postcss(plugins, this.config.postcss).on("error", done))
        .pipe(rename({ extname: ".css" }))
        .pipe(dest(this.paths.dest))
        .on("end", done);
    };

    const { alternateTask = () => postcssTask } = this.config;
    const stylesheetsTask = alternateTask(gulp, this.pathConfig, this.config);

    task("stylesheets", stylesheetsTask);
  }
}

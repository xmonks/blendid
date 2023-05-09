import DefaultRegistry from "undertaker-registry";
import gulp from "gulp";
import changed from "gulp-changed";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import sass from "../packages/gulp-sass-embedded/index.mjs";
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

    const config = this.config;
    const paths = this.paths;

    const postcssTask = (done) => {
      if (config.sass?.includePaths) {
        config.sass.includePaths = config.sass.includePaths
          .filter(Boolean)
          .map((includePath) => projectPath(includePath));
      }
      const { plugins: userPlugins, ...postCssConfig } = config.postcss ?? {};
      const plugins = getPostCSSPlugins(config, userPlugins);
      return src(paths.src)
        .pipe(changed(paths.dest, { extension: ".css" }))
        .pipe(sass(config.sass).on("error", done))
        .pipe(postcss(plugins, postCssConfig).on("error", done))
        .pipe(rename({ extname: ".css" }))
        .pipe(dest(paths.dest))
        .on("end", done);
    };

    const { alternateTask = () => postcssTask } = config;
    const stylesheetsTask = alternateTask(gulp, this.pathConfig, config);

    task("stylesheets", stylesheetsTask);
  }
}

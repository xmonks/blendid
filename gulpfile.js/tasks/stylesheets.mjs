import DefaultRegistry from "undertaker-registry";
import gulp from "gulp";
import debug from "gulp-debug";
import logger from "gulplog";
import postcss from "gulp-postcss";
import sass from "../packages/gulp-sass/index.mjs";
import projectPath from "../lib/projectPath.mjs";
import getPostCSSPlugins from "../lib/postCSS.mjs";
import handleErrors from "../lib/handleErrors.mjs";

/** @typedef {import("@types/gulp")} Undertaker */

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
        `!(_)*.{${config.extensions}}`
      ),
      dest: projectPath(pathConfig.dest, pathConfig.stylesheets?.dest ?? "")
    };
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    if (!this.config) return;

    const config = this.config;
    const paths = this.paths;

    const postcssTask = () => {
      if (config.sass?.includePaths) {
        config.sass.includePaths = config.sass.includePaths
          .filter(Boolean)
          .map((includePath) => projectPath(includePath));
      }
      const { plugins: userPlugins, ...postCssConfig } = config.postcss ?? {};
      const plugins = getPostCSSPlugins(config, userPlugins);
      return src(paths.src)
        .pipe(debug({ title: "stylesheets:", logger: logger.debug }))
        .pipe(sass(config.sass))
        .on("error", handleErrors)
        .pipe(debug({ title: "sass:", logger: logger.debug }))
        .pipe(postcss(plugins, postCssConfig))
        .on("error", handleErrors)
        .pipe(debug({ title: "postcss:", logger: logger.debug }))
        .pipe(dest(paths.dest));
    };

    const { alternateTask = () => postcssTask } = config;
    const stylesheetsTask = alternateTask(gulp, this.pathConfig, config);

    task("stylesheets", stylesheetsTask);
  }
}

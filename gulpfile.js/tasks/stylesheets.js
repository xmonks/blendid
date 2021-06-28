if (!TASK_CONFIG.stylesheets) return;

const stream = require("stream");
const util = require("util");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const changed = require("gulp-changed");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-dart-sass");
const projectPath = require("../lib/projectPath");
const getPostCSSPlugins = require("../lib/postCSS");

const pipeline = util.promisify(stream.pipeline);
const { src, dest, task } = gulp;

const postcssTask = function () {
  const config = TASK_CONFIG.stylesheets;
  const paths = {
    src: projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.stylesheets.src,
      "**/[!_]*.{" + config.extensions + "}"
    ),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.stylesheets.dest),
  };

  if (config.sass && config.sass.includePaths) {
    config.sass.includePaths = config.sass.includePaths
      .filter(Boolean)
      .map((includePath) => projectPath(includePath));
  }

  if (config.sass && !config.sass.importer) {
    config.sass.importer(url) {
      try {
        // try to resolve with node resolution (yarn pnp support)
        return { file: require.resolve(`${url}.scss`) };
      } catch (err) {
        return null;
      }
    };
  }

  const plugins = getPostCSSPlugins(config);
  return pipeline(
    src(paths.src),
    changed(paths.dest, { extension: ".css" }),
    gulpif(!global.production, sourcemaps.init()),
    sass(config.sass).on("error", sass.logError),
    postcss(plugins, config.postcss),
    rename({ extname: ".css" }),
    gulpif(!global.production, sourcemaps.write()),
    dest(paths.dest)
  );
};

const { alternateTask = () => null } = TASK_CONFIG.stylesheets;
const stylesheetsTask = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);

task("stylesheets", stylesheetsTask || postcssTask);
module.exports = stylesheetsTask || postcssTask;

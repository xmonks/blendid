if (!TASK_CONFIG.stylesheets) return;

const gulp = require("gulp");
const gulpif = require("gulp-if");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const easyImport = require("postcss-easy-import");
const sass = require("postcss-node-sass");
const projectPath = require("../lib/projectPath");

const postcssTask = function() {
  const paths = {
    src: projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.stylesheets.src,
      "**/*.{" + TASK_CONFIG.stylesheets.extensions + "}"
    ),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.stylesheets.dest)
  };

  if (TASK_CONFIG.stylesheets.sass) {
    if (TASK_CONFIG.stylesheets.sass.includePaths) {
      TASK_CONFIG.stylesheets.sass.includePaths = TASK_CONFIG.stylesheets.sass.includePaths.map(
        includePath => projectPath(includePath)
      );
    }
  }

  const plugins = [
    easyImport({
      prefix: "_",
      extensions: Array.from(
        TASK_CONFIG.stylesheets.extensions || [],
        x => `.${x}`
      )
    }),
    sass(TASK_CONFIG.stylesheets.sass),
    autoprefixer(TASK_CONFIG.stylesheets.autoprefixer)
  ];
  if (
    TASK_CONFIG.stylesheets.postcss &&
    TASK_CONFIG.stylesheets.postcss.plugins
  ) {
    plugins.concat(TASK_CONFIG.stylesheets.postcss.plugins);
    delete TASK_CONFIG.stylesheets.postcss.plugins;
  }
  if (global.production) {
    plugins.push(cssnano(TASK_CONFIG.stylesheets.cssnano));
  }

  return gulp
    .src(paths.src)
    .pipe(gulpif(!global.production, sourcemaps.init()))
    .pipe(postcss(plugins, TASK_CONFIG.stylesheets.postcss))
    .pipe(gulpif(!global.production, sourcemaps.write()))
    .pipe(gulp.dest(paths.dest));
};

const { alternateTask = () => postcssTask } = TASK_CONFIG.stylesheets;
const stylesheetsTask = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);

gulp.task("stylesheets", stylesheetsTask);
module.exports = stylesheetsTask;

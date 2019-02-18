if (!TASK_CONFIG.stylesheets) return;

const gulp = require("gulp");
const gulpif = require("gulp-if");
const postcss = require("gulp-postcss");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const handleErrors = require("../lib/handleErrors");
const projectPath = require("../lib/projectPath");

const sassTask = function() {
  const paths = {
    src: projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.stylesheets.src,
      "**/*.{" + TASK_CONFIG.stylesheets.extensions + "}"
    ),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.stylesheets.dest)
  };

  if (
    TASK_CONFIG.stylesheets.sass &&
    TASK_CONFIG.stylesheets.sass.includePaths
  ) {
    TASK_CONFIG.stylesheets.sass.includePaths = TASK_CONFIG.stylesheets.sass.includePaths.map(
      function(includePath) {
        return projectPath(includePath);
      }
    );
  }

  const plugins = [autoprefixer(TASK_CONFIG.stylesheets.autoprefixer)];
  if (global.production) {
    plugins.push(cssnano(TASK_CONFIG.stylesheets.cssnano));
  }

  return gulp
    .src(paths.src)
    .pipe(gulpif(!global.production, sourcemaps.init()))
    .pipe(sass(TASK_CONFIG.stylesheets.sass))
    .on("error", handleErrors)
    .pipe(postcss(plugins))
    .pipe(gulpif(!global.production, sourcemaps.write()))
    .pipe(gulp.dest(paths.dest));
};

const { alternateTask = () => sassTask } = TASK_CONFIG.stylesheets;
const stylesheetsTask = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);

gulp.task("stylesheets", stylesheetsTask);
module.exports = stylesheetsTask;

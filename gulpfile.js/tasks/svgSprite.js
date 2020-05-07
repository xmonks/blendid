if (!TASK_CONFIG.svgSprite) return;

const gulp = require("gulp");
const path = require("path");
const debug = require("gulp-debug");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const projectPath = require("../lib/projectPath");
const html = require("./html");

const svgSpriteTask = function() {
  const settings = {
    src: projectPath(PATH_CONFIG.src, PATH_CONFIG.icons.src, "*.svg"),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest)
  };

  const svgs = gulp
    .src(settings.src)
    .pipe(
      svgmin(file => {
        const prefix = path.basename(
          file.relative,
          path.extname(file.relative)
        );
        return {
          plugins: [
            { removeXMLNS: true },
            { prefixIDs: { prefix } },
            {
              cleanupIDs: {
                prefix: prefix + "-",
                minify: true,
                force: true
              }
            }
          ]
        };
      })
    )
    .pipe(svgstore(TASK_CONFIG.svgSprite.svgstore));
  const paths = html.getPaths();
  return gulp
    .src(path.join(paths.dest, "**/*.{" + TASK_CONFIG.html.extensions + "}"))
    .pipe(
      inject(svgs, {
        transform: (_, file) => file.contents.toString()
      })
    )
    .pipe(gulp.dest(settings.dest));
};

const { alternateTask = () => svgSpriteTask } = TASK_CONFIG.svgSprite;
const task = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);
gulp.task("svgSprite", task);
module.exports = task;

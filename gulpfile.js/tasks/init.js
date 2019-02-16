const gulp = require("gulp");
const log = require("fancy-log");
const colors = require("ansi-colors");
const projectPath = require("../lib/projectPath");
const merge = require("merge-stream");

gulp.task("init", function() {
  const defaultStream = gulp
    .src(["extras/default/**/*", "extras/default/**/.*"])
    .pipe(gulp.dest(projectPath()));

  const configStream = gulp
    .src(["gulpfile.js/path-config.json", "gulpfile.js/task-config.js"])
    .pipe(gulp.dest(projectPath("config")));

  const srcStream = gulp
    .src(["src/**/*", "src/**/.gitkeep"])
    .pipe(gulp.dest(projectPath(PATH_CONFIG.src)));

  log(colors.green("Generating default Blendid project files"));
  log(
    colors.yellow(`
To start the dev server:
`),
    colors.magenta(`
yarn run blendid
`)
  );

  return merge(defaultStream, configStream, srcStream);
});

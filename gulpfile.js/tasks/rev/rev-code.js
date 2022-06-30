const { task, src, dest } = require("gulp");
const revdel = require("gulp-rev-delete-original");
const rev = require("../../packages/gulp-rev");
const projectPath = require("../../lib/projectPath");

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well
task("rev-code", () =>
  src([projectPath(PATH_CONFIG.dest, "**/*.{css,map}")])
    .pipe(rev())
    .pipe(dest(projectPath(PATH_CONFIG.dest)))
    .pipe(revdel())
    .pipe(
      rev.manifest(projectPath(PATH_CONFIG.dest, "rev-manifest.json"), {
        merge: true,
      })
    )
    .pipe(dest("."))
);

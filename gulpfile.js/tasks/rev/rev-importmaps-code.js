const { task, src, dest } = require("gulp");
const rev = require("../../packages/gulp-rev");
const revdel = require("gulp-rev-delete-original");
const projectPath = require("../../lib/projectPath");

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well
task("rev-importmaps-code", () =>
  src([projectPath(PATH_CONFIG.dest, "**/*.{js,mjs}")])
    .pipe(rev())
    .pipe(dest(projectPath(PATH_CONFIG.dest)))
    .pipe(revdel())
    .pipe(
      rev.importmap(projectPath(PATH_CONFIG.dest, "import-map.importmap"), {
        merge: true,
      })
    )
    .pipe(dest("."))
);

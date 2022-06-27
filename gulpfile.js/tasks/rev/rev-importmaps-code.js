const { task, src, dest } = require("gulp");
const rev = require("../../packages/gulp-rev");
const revdel = require("gulp-rev-delete-original");
const gulpMerge = require("gulp-merge");
const projectPath = require("../../lib/projectPath");

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well
task("rev-importmaps-code", () => {
  const revcode = src([projectPath(PATH_CONFIG.dest, "**/*.{js,mjs}")])
    .pipe(rev())
    .pipe(dest(projectPath(PATH_CONFIG.dest)))
    .pipe(revdel());
  return gulpMerge(
    revcode.pipe(
      rev.importmap(projectPath(PATH_CONFIG.dest, "import-map.importmap"), {
        merge: true,
      })
    ),
    revcode.pipe(
      rev.manifest(projectPath(PATH_CONFIG.dest, "rev-manifest.json"), {
        merge: true,
      })
    )
  ).pipe(dest("."));
  }
);

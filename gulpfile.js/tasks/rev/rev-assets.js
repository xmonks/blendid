const { task, src, dest } = require("gulp");
const rev = require("../../packages/gulp-rev");
const revdel = require("gulp-rev-delete-original");
const projectPath = require("../../lib/projectPath");

// 1) Add md5 hashes to assets referenced by CSS and JS files
task("rev-assets", function () {
  // Ignore files that may reference assets. We'll rev them next.
  const ignoreThese =
    "!" + projectPath(PATH_CONFIG.dest, "**/*+(css|js|mjs|map|json|html)");

  return src([projectPath(PATH_CONFIG.dest, "**/*"), ignoreThese])
    .pipe(rev())
    .pipe(dest(projectPath(PATH_CONFIG.dest)))
    .pipe(revdel())
    .pipe(
      rev.manifest(projectPath(PATH_CONFIG.dest, "rev-manifest.json"), {
        merge: true,
      })
    )
    .pipe(dest("."));
});

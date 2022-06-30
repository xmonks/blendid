const fs = require("fs");
const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-rewrite");
const projectPath = require("../../lib/projectPath");

// 2) Update asset references with reved filenames in compiled css + js
task("rev-update-references", function () {
  const manifestPath = projectPath(PATH_CONFIG.dest, "rev-manifest.json");
  const manifest = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath)
    : null;

  return src(projectPath(PATH_CONFIG.dest, "**/**.{css,js,mjs,map}"))
    .pipe(revReplace({ manifest }))
    .pipe(dest(projectPath(PATH_CONFIG.dest)));
});

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

// 2) Update asset references with reved filenames in compiled css + js
task("rev-update-references", function () {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"), {
    allowEmpty: true,
  });

  return src(projectPath(PATH_CONFIG.dest, "**/**.{css,js,mjs,map}"))
    .pipe(revReplace({ manifest: manifest }))
    .pipe(dest(projectPath(PATH_CONFIG.dest)));
});

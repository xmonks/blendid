if (!TASK_CONFIG.html) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

// 4) Update asset references in HTML
task("update-html", function () {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  return src(projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest, "**/*.html"))
    .pipe(revReplace({ manifest }))
    .pipe(dest(projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest)));
});

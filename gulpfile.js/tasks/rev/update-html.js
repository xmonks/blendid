if (!TASK_CONFIG.html) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-rewrite");
const inject = require("gulp-inject");
const projectPath = require("../../lib/projectPath");

// 4) Update asset references in HTML
task("update-html", function () {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  const importmap = src(projectPath(PATH_CONFIG.dest, "import-map.importmap"));
  return src(projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest, "**/*.html"))
    .pipe(revReplace({ manifest }))
    .pipe(
      inject(importmap, {
        removeTags: true,
        transform: (_, file) => file.contents.toString(),
      })
    )
    .pipe(dest(projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest)));
});

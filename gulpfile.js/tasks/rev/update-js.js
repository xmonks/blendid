if (!TASK_CONFIG.javascripts) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

task("update-js", function() {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  return src(projectPath(PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest, "**/*.js"))
    .pipe(revReplace({ manifest: manifest }))
    .pipe(dest(projectPath(PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest)));
});

if (!TASK_CONFIG.javascripts) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

const paths = {
  src: projectPath(PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest, "**/*.js"),
  dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest)
};

const relativePath = s => s.replace(PATH_CONFIG.javascripts.dest, ".");

task("update-js", function() {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  return src(paths.src)
    .pipe(
      revReplace({
        manifest,
        modifyUnreved: relativePath,
        modifyReved: relativePath
      })
    )
    .pipe(dest(paths.dest));
});

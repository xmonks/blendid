if (!(TASK_CONFIG.javascripts || TASK_CONFIG.esbuild)) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

const destDir = (PATH_CONFIG.javascripts || PATH_CONFIG.esbuild).dest;

const paths = {
  src: projectPath(PATH_CONFIG.dest, destDir, "**/*.js"),
  dest: projectPath(PATH_CONFIG.dest, destDir),
};

const relativePath = (s) => s.replace(destDir, ".");

task("update-js", function () {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  return src(paths.src)
    .pipe(
      revReplace({
        manifest,
        modifyUnreved: relativePath,
        modifyReved: relativePath,
      })
    )
    .pipe(dest(paths.dest));
});

if (!(TASK_CONFIG.javascripts || TASK_CONFIG.esbuild)) return false;

const { task, src, dest } = require("gulp");
const revReplace = require("gulp-rev-replace");
const projectPath = require("../../lib/projectPath");

const codeDir = (PATH_CONFIG.javascripts || PATH_CONFIG.esbuild).dest;
const paths = {
  src: projectPath(PATH_CONFIG.dest, codeDir, "**/*.js"),
  dest: projectPath(PATH_CONFIG.dest, codeDir),
};

const relativePath = (s) => s.replace(codeDir, ".");

task("update-js", function () {
  const manifest = src(projectPath(PATH_CONFIG.dest, "rev-manifest.json"));
  return src(paths.src)
    .pipe(
      revReplace({
        manifest,
        modifyUnreved: relativePath,
        modifyReved: relativePath,
        replaceInExtensions: [".js", ".mjs", ".css", ".html", ".hbs"],
      })
    )
    .pipe(dest(paths.dest));
});

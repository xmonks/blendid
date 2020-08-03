if (!TASK_CONFIG.fonts) return;

const stream = require("stream");
const util = require("util");
const changed = require("gulp-changed");
const { src, dest, task } = require("gulp");
const projectPath = require("../lib/projectPath");

const pipeline = util.promisify(stream.pipeline);

const fontsTask = function() {
  const config = TASK_CONFIG.fonts;
  const paths = {
    src: projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.fonts.src,
      "**/*.{" + config.extensions + "}"
    ),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.fonts.dest)
  };

  return pipeline(
    src([paths.src, "*!README.md"]),
    changed(paths.dest), // Ignore unchanged files
    dest(paths.dest)
  );
};

task("fonts", fontsTask);
module.exports = fontsTask;

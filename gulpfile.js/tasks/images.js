if (!TASK_CONFIG.images) return;

const stream = require("stream");
const util = require("util");
const { src, dest, task } = require("gulp");
const changed = require("gulp-changed");
const projectPath = require("../lib/projectPath");

const pipeline = util.promisify(stream.pipeline);

const imagesTask = function () {
  const paths = {
    src: projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.images.src,
      "**/*.{" + TASK_CONFIG.images.extensions + "}"
    ),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.images.dest),
  };

  return pipeline(
    src([paths.src, "*!README.md"]),
    changed(paths.dest), // Ignore unchanged files
    dest(paths.dest)
  );
};

task("images", imagesTask);
module.exports = imagesTask;

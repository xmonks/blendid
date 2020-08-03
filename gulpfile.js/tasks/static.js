if (!TASK_CONFIG.static) return;

const stream = require("stream");
const util = require("util");
const { src, dest, task } = require("gulp");
const changed = require("gulp-changed");
const path = require("path");
const projectPath = require("../lib/projectPath");

const pipeline = util.promisify(stream.pipeline);

const staticTask = function() {
  const srcPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.static.src);
  const defaultSrcOptions = { dot: true };
  const options = Object.assign(
    defaultSrcOptions,
    TASK_CONFIG.static.srcOptions || {}
  );

  const paths = {
    src: path.join(srcPath, "**/*"),
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.static.dest)
  };

  return pipeline(
    src(paths.src, options),
    changed(paths.dest),
    dest(paths.dest)
  );
};

task("static", staticTask);
module.exports = staticTask;

const gulp = require("gulp");
const gulpSequence = require("gulp-sequence");
const getEnabledTasks = require("../lib/getEnabledTasks");

const defaultTask = function (cb) {
  const tasks = getEnabledTasks("watch");
  const staticFiles = TASK_CONFIG.static ? "static" : false;
  const { prebuild, postbuild } = TASK_CONFIG.additionalTasks.development;
  gulpSequence(
    "clean",
    prebuild,
    tasks.assetTasks,
    tasks.codeTasks,
    staticFiles,
    postbuild,
    "watch",
    cb
  );
};

gulp.task("default", defaultTask);
module.exports = defaultTask;

const compact = require("lodash/compact");
const isEmpty = require("lodash/isEmpty");

// Grouped by what can run in parallel
const assetTasks = ["cloudinary", "fonts", "iconFont", "images"];
const codeTasks = ["stylesheets", "javascripts"];

module.exports = function (env) {
  function matchFilter(task) {
    if (TASK_CONFIG[task]) {
      return task;
    }
  }

  function findExistingTasks(candidates) {
    const tasks = compact(candidates.map(matchFilter).filter(Boolean));
    return isEmpty(tasks) ? null : tasks;
  }

  return {
    assetTasks: findExistingTasks(assetTasks),
    codeTasks: findExistingTasks(codeTasks),
  };
};

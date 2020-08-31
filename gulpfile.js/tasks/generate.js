if (!TASK_CONFIG.generate) return;

const { task, series } = require("gulp");

const genTasks = [];
if (TASK_CONFIG.generate.json) {
  genTasks.push(require("./generate/json"));
}

task("generate", series(genTasks));

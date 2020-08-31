if (!TASK_CONFIG.generate) return;

const { task, series } = require("gulp");

const genTasks = [];
if (TASK_CONFIG.generate.json) {
  genTasks.push(require("./generate/json"));
}
if (TASK_CONFIG.generate.html) {
  genTasks.push(require("./generate/html"));
}

let noop = (done) => {
  done();
};

task("generate", genTasks.length ? series(genTasks) : noop);

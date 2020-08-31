if (!TASK_CONFIG.generate) return;

const { task, series } = require("gulp");

const genTasks = [];
if (TASK_CONFIG.generate.json) {
  genTasks.push(require("./generate/json"));
}

let noop = (done) => {
  done();
};

task("generate", genTasks.length ? series(genTasks) : noop);

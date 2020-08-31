if (!TASK_CONFIG.generate.json) return;

const gulp = require("gulp");
const marked = require("marked");
const stream = require("stream");
const utils = require("util");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const projectPath = require("../../lib/projectPath");

const pipeline = utils.promisify(stream.pipeline);
const { src, dest, task, parallel } = gulp;

function generateJson(sourcePath, destPath, { collection, mergeOptions }) {
  return () =>
    pipeline([
      src(sourcePath),
      markdownToJSON(marked),
      merge({
        fileName: `${collection}.json`,
        ...mergeOptions,
      }),
      dest(destPath),
    ]);
}

function* createTasks() {
  const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
  const collections = TASK_CONFIG.generate.json;
  for (let col of collections) {
    yield generateJson(projectPath(dataPath, col.srcGlob), dataPath, col);
  }
}

task("generate-json", parallel(createTasks()));
module.exports = "generate-json";

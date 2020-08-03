const stream = require("stream");
const util = require("util");
const { src, task } = require("gulp");
const sizereport = require("gulp-sizereport");
const projectPath = require("../lib/projectPath");

const pipeline = util.promisify(stream.pipeline);

task("size-report", function() {
  return pipeline(
    src([projectPath(PATH_CONFIG.dest, "**/*"), "*!rev-manifest.json"]),
    sizereport({ gzip: true })
  );
});

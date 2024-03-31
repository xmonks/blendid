#!/usr/bin/env node
const path = require("path");

const blendidEntryDir = path.resolve(__dirname, "../gulpfile.js/index.mjs");
const gulpModulePath = path.dirname(require.resolve("gulp"));
const gulpBinaryFile = path.join(gulpModulePath, "/bin/gulp");

require("child_process").fork(gulpBinaryFile, [
  "--cwd",
  process.cwd(),
  "--gulpfile",
  blendidEntryDir,
  ...process.argv.slice(2)
]);

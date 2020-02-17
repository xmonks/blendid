if (!TASK_CONFIG.production.rev) return;

const { task, series } = require("gulp");

require("./rev-assets");
require("./rev-css");
require("./rev-update-references");
require("./update-html");
require("./update-js");

const updateHtml = TASK_CONFIG.html ? "update-html" : false;
const updateJs = TASK_CONFIG.javascripts ? "update-js" : false;
const revTasks = [
  // 1) Add md5 hashes to assets referenced by CSS and JS files
  "rev-assets",
  // 2) Update asset references (images, fonts, etc) with reved filenames in compiled css + js
  "rev-update-references",
  // 3) Rev and compress CSS and JS files
  // (this is done after assets, so that if a referenced asset hash changes,
  // the parent hash will change as well
  "rev-css",
  // 4) Update asset references in JS
  updateJs,
  // 5) Update asset references in HTML
  updateHtml
].filter(Boolean);
const revTask = series(revTasks);

task("rev", revTask);
module.exports = revTask;

const { task, src, dest } = require("gulp");
const revdel = require("gulp-rev-delete-original");
const stream = require("stream");
const rev = require("../../packages/gulp-rev");
const projectPath = require("../../lib/projectPath");
const util = require("util");

const pipeline = util.promisify(stream.pipeline);

// 3) Rev and compress CSS and JS files (this is done after assets, so that if a
//    referenced asset hash changes, the parent hash will change as well
task("rev-importmaps-code", () =>
  pipeline(
    src([projectPath(PATH_CONFIG.dest, "**/*.{js,mjs}")]),
    rev(),
    dest(projectPath(PATH_CONFIG.dest)),
    revdel(),
    rev.manifest(projectPath(PATH_CONFIG.dest, "rev-manifest.json"), {
      merge: true,
      importmap: true,
    }),
    dest(".")
  )
);

if (!TASK_CONFIG.html) return;

const stream = require("stream");
const util = require("util");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-html-minifier-terser");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const nunjucksRender = require("gulp-nunjucks-render");
const projectPath = require("../lib/projectPath");

const { src, dest, task } = gulp;
const pipeline = util.promisify(stream.pipeline);

const dataFile = (pathConfig, name) =>
  projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
const jsonData = (pathConfig) => (name) =>
  fs.promises
    .readFile(dataFile(pathConfig, name), "utf8")
    .then((f) => JSON.parse(f))
    .catch(() => {});

const getPaths = (exclude) => ({
  src: [
    projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.html.src,
      "**/*.{" + TASK_CONFIG.html.extensions + "}"
    ),
    exclude,
  ].filter(Boolean),
  spritesSrc: projectPath(PATH_CONFIG.src, PATH_CONFIG.icons.src, "*.svg"),
  dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest),
});

const htmlTask = function () {
  const config = TASK_CONFIG.html;
  const exclude =
    "!" +
    projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.html.src,
      "**/{" + config.excludeFolders.join(",") + "}/**"
    );

  const paths = getPaths(exclude);

  const collectionsDataFunction =
    PATH_CONFIG.data &&
    config.collections &&
    (() => {
      const cols = config.collections;
      return Promise.all(cols.map(jsonData(PATH_CONFIG))).then((xs) =>
        cols.reduce((acc, x, i) => Object.assign(acc, { [x]: xs[i] }), {})
      );
    });

  const dataFunction =
    collectionsDataFunction ||
    config.dataFunction ||
    function () {
      const dataPath = projectPath(
        PATH_CONFIG.src,
        PATH_CONFIG.html.src,
        config.dataFile
      );
      return fs.promises.readFile(dataPath, "utf-8").then((x) => JSON.parse(x));
    };

  const nunjucksRenderPath = [
    projectPath(PATH_CONFIG.src, PATH_CONFIG.html.src),
  ];
  config.nunjucksRender.path = config.nunjucksRender.path || nunjucksRenderPath;

  const filters = config.nunjucksRender.filters;
  if (filters) {
    const origFn = config.nunjucksRender.manageEnv;
    config.nunjucksRender.manageEnv = (env) => {
      for (let filter of Object.keys(filters)) {
        env.addFilter(filter, filters[filter]);
      }
      if (typeof origFn === "function") {
        origFn(env);
      }
    };
    delete config.nunjucksRender.filters;
  }
  const svgs = src(paths.spritesSrc)
    .pipe(
      svgmin((file) => {
        const prefix = path.basename(
          file.relative,
          path.extname(file.relative)
        );
        return {
          plugins: [
            { removeXMLNS: true },
            { prefixIDs: { prefix } },
            {
              cleanupIDs: {
                prefix: prefix + "-",
                minify: true,
                force: true,
              },
            },
          ],
        };
      })
    )
    .pipe(svgstore(TASK_CONFIG.svgSprite.svgstore));

  return pipeline(
    src(paths.src),
    data(dataFunction),
    nunjucksRender(config.nunjucksRender),
    gulpif(
      TASK_CONFIG.svgSprite,
      inject(svgs, {
        transform: (_, file) => file.contents.toString(),
      })
    ),
    gulpif(global.production, htmlmin(config.htmlmin)),
    dest(paths.dest)
  );
};

const { alternateTask = () => htmlTask } = TASK_CONFIG.html;
const finalTask = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);
task("html", finalTask);
module.exports = finalTask;
module.exports.getPaths = getPaths;

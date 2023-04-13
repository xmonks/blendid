if (!TASK_CONFIG.html) return;

const stream = require("stream");
const util = require("util");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-htmlmin-next");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const nunjucksRender = require("gulp-nunjucks-render");
const nunjucksMarkdown = require("nunjucks-markdown");
const marked = require("marked");
const cloneDeep = require("lodash.clonedeep");
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
      `**/*.{${TASK_CONFIG.html.extensions}}`
    ),
    exclude,
  ].filter(Boolean),
  spritesSrc: projectPath(PATH_CONFIG.src, PATH_CONFIG.icons.src, "*.svg"),
  dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest),
});

const htmlTask = function () {
  const config = cloneDeep(TASK_CONFIG.html);
  const exclude = `!${projectPath(
    PATH_CONFIG.src,
    PATH_CONFIG.html.src,
    `**/{${config.excludeFolders.join(",")}}/**`
  )}`;

  const paths = getPaths(exclude);

  const collectionsDataFunction =
    PATH_CONFIG.data && Array.isArray(config.collections)
      ? () => {
          const cols = config.collections;
          const dataPath = projectPath(
            PATH_CONFIG.src,
            PATH_CONFIG.data.src,
            config.dataFile
          );
          const data = fs.existsSync(dataPath)
            ? JSON.parse(fs.readFileSync(dataPath, "utf-8"))
            : {};
          return Promise.all(cols.map(jsonData(PATH_CONFIG))).then((xs) =>
            cols.reduce((acc, x, i) => Object.assign(acc, { [x]: xs[i] }), data)
          );
        }
      : null;

  const dataFunction =
    config.dataFunction ??
    collectionsDataFunction ??
    function () {
      const dataPath = projectPath(
        PATH_CONFIG.src,
        PATH_CONFIG.data.src,
        config.dataFile
      );
      return fs.promises.readFile(dataPath, "utf-8").then((x) => JSON.parse(x));
    };

  const nunjucksRenderPath = [
    projectPath(PATH_CONFIG.src, PATH_CONFIG.html.src),
  ];
  config.nunjucksRender.path = config.nunjucksRender.path || nunjucksRenderPath;

  const origFn = config.nunjucksRender.manageEnv;
  config.nunjucksRender.manageEnv = (env) => {
    nunjucksMarkdown.register(env, marked);
    const filters = config.nunjucksRender.filters;
    if (filters) {
      for (let filter of Object.keys(filters)) {
        env.addFilter(filter, filters[filter]);
      }
      delete config.nunjucksRender.filters;
    }
    const globals = config.nunjucksRender.globals;
    if (globals) {
      for (let key of Object.keys(globals)) {
        env.addGlobal(key, globals[key]);
      }
      delete config.nunjucksRender.globals;
    }
    if (typeof origFn === "function") {
      origFn(env);
    }
  };

  const svgs = src(paths.spritesSrc)
    .pipe(
      svgmin((file) => {
        const prefix = path.basename(
          file.relative,
          path.extname(file.relative)
        );
        return {
          plugins: [
            "preset-default",
            "removeXMLNS",
            {
              name: "prefixIDs",
              params: { prefix },
            },
            {
              name: "cleanupIDs",
              params: {
                prefix: `${prefix}-`,
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
        quiet: true,
        removeTags: true,
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

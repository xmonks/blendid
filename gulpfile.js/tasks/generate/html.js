if (!TASK_CONFIG.generate.html) return;

const stream = require("stream");
const utils = require("util");
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-htmlmin-next");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const streamArray = require("stream-array");
const through = require("through2");
const File = require("vinyl");
const nunjucksRender = require("gulp-nunjucks-render");
const cloneDeep = require("lodash.clonedeep");
const projectPath = require("../../lib/projectPath");
const { getPaths } = require("../html");

const pipeline = utils.promisify(stream.pipeline);
const { src, dest, task, parallel } = gulp;

const dataFile = (pathConfig, name) =>
  projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
const jsonData = (pathConfig) => (name) =>
  fs.promises
    .readFile(dataFile(pathConfig, name), "utf8")
    .then((f) => JSON.parse(f))
    .catch(() => {});

function generateHtml(sourcePath, destPath, { template, route }) {
  const config = cloneDeep(TASK_CONFIG.html);
  const paths = getPaths();

  const collectionsDataFunction =
    PATH_CONFIG.data &&
    config.collections &&
    ((file) => {
      const cols = config.collections;
      return Promise.all(cols.map(jsonData(PATH_CONFIG))).then((xs) =>
        cols.reduce(
          (acc, x, i) => Object.assign({}, acc, { [x]: xs[i] }),
          file.data || {}
        )
      );
    });

  const dataFunction =
    collectionsDataFunction ||
    config.dataFunction ||
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

  const createFile = (item) =>
    new File({
      path: route(item),
      contents: fs.readFileSync(
        projectPath(PATH_CONFIG.src, PATH_CONFIG.html.src, template)
      ),
      data: { item },
    });

  return () =>
    pipeline([
      streamArray(require(sourcePath)),
      through.obj(function (item, enc, done) {
        let file = createFile(item);
        this.push(file);
        done();
      }),
      data(dataFunction),
      nunjucksRender(config.nunjucksRender),
      gulpif(
        TASK_CONFIG.svgSprite,
        inject(svgs, {
          removeTags: true,
          transform: (_, file) => file.contents.toString(),
        })
      ),
      gulpif(global.production, htmlmin(config.htmlmin)),
      dest(destPath),
    ]);
}

function* createTasks() {
  const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
  const destPath = projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest);
  const collections = TASK_CONFIG.generate.html;
  for (let col of collections) {
    const sourcePath = `${col.collection}.json`;
    yield generateHtml(projectPath(dataPath, sourcePath), destPath, col);
  }
}

const taskName = "generate-html";
task(taskName, parallel(Array.from(createTasks())));
module.exports = taskName;

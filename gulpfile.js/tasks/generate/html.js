const fs = require("fs");
const path = require("path");
const data = require("gulp-data");
const mode = require("gulp-mode")();
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
const DefaultRegistry = require("undertaker-registry");
const nunjucksMarkdown = require("nunjucks-markdown");
const marked = require("marked");

const dataFile = (pathConfig, name) =>
  projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
const jsonData = (pathConfig) => (name) =>
  fs.promises
    .readFile(dataFile(pathConfig, name), "utf8")
    .then((f) => JSON.parse(f))
    .catch(() => {});

class GenerateHtmlRegistry extends DefaultRegistry {
  #ownTasks = new Set();

  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }


  ownTasks() {
    return Array.from(this.#ownTasks);
  }

  init({ task, parallel, src, dest }) {
    if (!this.config.generate.html) return;

    const config = cloneDeep(this.config.html);
    const taskConfig = this.config;
    const pathConfig = this.pathConfig;
    function generateHtml(
      sourcePath,
      destPath,
      { template, route, collection }
    ) {
      const paths = getPaths(null, taskConfig, pathConfig);

      const collectionsDataFunction =
        pathConfig.data &&
        config.collections &&
        ((file) => {
          const cols = config.collections;
          return Promise.all(cols.map(jsonData(pathConfig))).then((xs) =>
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
          return fs.promises
            .readFile(paths.dataPath, "utf-8")
            .then((x) => JSON.parse(x));
        };

      const nunjucksRenderPath = [
        projectPath(pathConfig.src, pathConfig.html.src),
      ];
      config.nunjucksRender.path =
        config.nunjucksRender.path || nunjucksRenderPath;

      const origFn = config.nunjucksRender.manageEnv;
      config.nunjucksRender.manageEnv = (env) => {
        nunjucksMarkdown.register(env, marked.parse);
        const filters = config.nunjucksRender.filters;
        if (filters) {
          for (const filter of Object.keys(filters)) {
            env.addFilter(filter, filters[filter]);
          }
          delete config.nunjucksRender.filters;
        }
        const globals = config.nunjucksRender.globals;
        if (globals) {
          for (const key of Object.keys(globals)) {
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
        .pipe(svgstore(taskConfig.svgSprite.svgstore));

      const createFile = (item) =>
        new File({
          path: route(item),
          contents: fs.readFileSync(
            projectPath(pathConfig.src, pathConfig.html.src, template)
          ),
          data: { item },
        });

      let generateHtmlTask = () =>
        streamArray(require(sourcePath))
          .pipe(
            through.obj(function (item, enc, done) {
              let file = createFile(item);
              this.push(file);
              done();
            })
          )
          .pipe(data(dataFunction))
          .pipe(nunjucksRender(config.nunjucksRender))
          .pipe(
            gulpif(
              taskConfig.svgSprite,
              inject(svgs, {
                quiet: true,
                removeTags: true,
                transform: (_, file) => file.contents.toString(),
              })
            )
          )
          .pipe(mode.production(htmlmin(config.htmlmin)))
          .pipe(dest(destPath));
      generateHtmlTask.displayName = `generate-html-${collection}`;
      return generateHtmlTask;
    }

    function* createTasks(collections, pathConfig) {
      const dataPath = projectPath(pathConfig.src, pathConfig.data.src);
      const destPath = projectPath(pathConfig.dest, pathConfig.html.dest);
      for (const col of collections) {
        const sourcePath = `${col.collection}.json`;
        yield generateHtml(projectPath(dataPath, sourcePath), destPath, col);
      }
    }
    task(
      "generate-html",
      parallel(
        Array.from(createTasks(this.config.generate.html, this.pathConfig))
      )
    );
    this.#ownTasks.add("generate-html");
  }
}
module.exports = GenerateHtmlRegistry;

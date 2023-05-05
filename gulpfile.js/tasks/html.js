const fs = require("fs");
const path = require("path");
const DefaultRegistry = require("undertaker-registry");
const gulp = require("gulp");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const mode = require("gulp-mode")();
const htmlmin = require("gulp-htmlmin-next");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const nunjucksRender = require("gulp-nunjucks-render");
const nunjucksMarkdown = require("nunjucks-markdown");
const marked = require("marked");
const cloneDeep = require("lodash.clonedeep");
const projectPath = require("../lib/projectPath");

function dataFile(pathConfig, name) {
  return projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
}

function jsonData(pathConfig) {
  return (name) =>
    fs.promises
      .readFile(dataFile(pathConfig, name), "utf8")
      .then((f) => JSON.parse(f))
      .catch(() => {});
}

function getPaths(exclude, taskConfig, pathConfig) {
  return {
    src: [
      projectPath(
        pathConfig.src,
        pathConfig.html.src,
        "**",
        `*.{${taskConfig.html.extensions}}`
      ),
      exclude,
    ].filter(Boolean),
    spritesSrc: projectPath(pathConfig.src, pathConfig.icons.src, "*.svg"),
    dataPath: pathConfig.data
      ? projectPath(
          pathConfig.src,
          pathConfig.data.src,
          taskConfig.html.dataFile
        )
      : null,
    dest: projectPath(pathConfig.dest, pathConfig.html.dest),
  };
}

class HtmlRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    const exclude = `!${projectPath(
      pathConfig.src,
      pathConfig.html.src,
      "**",
      `{${config.excludeFolders}}`,
      "**"
    )}`;
    this.paths = getPaths(exclude, config, pathConfig);
  }
  init({ task, src, dest }) {
    if (!this.config.html) return;
    const config = cloneDeep(this.config.html);
    const htmlTask = () => {
      const collectionsDataFunction =
        this.pathConfig.data && Array.isArray(config.collections)
          ? () => {
              const cols = config.collections;
              const data = fs.existsSync(this.paths.dataPath)
                ? JSON.parse(fs.readFileSync(this.paths.dataPath, "utf-8"))
                : {};
              return Promise.all(cols.map(jsonData(this.pathConfig))).then(
                (xs) =>
                  cols.reduce(
                    (acc, x, i) => Object.assign(acc, { [x]: xs[i] }),
                    data
                  )
              );
            }
          : null;

      const dataFileFunction = () => {
        return fs.promises
          .readFile(this.paths.dataPath, "utf-8")
          .then((x) => JSON.parse(x));
      };

      const dataFunction =
        config.dataFunction ?? collectionsDataFunction ?? dataFileFunction;

      const nunjucksRenderPath = [
        projectPath(this.pathConfig.src, this.pathConfig.html.src),
      ];
      config.nunjucksRender.path =
        config.nunjucksRender.path ?? nunjucksRenderPath;

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

      const svgs = src(this.paths.spritesSrc)
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
        .pipe(svgstore(this.config.svgSprite.svgstore));

      return src(this.paths.src)
        .pipe(data(dataFunction))
        .pipe(nunjucksRender(config.nunjucksRender))
        .pipe(
          gulpif(
            this.config.svgSprite,
            inject(svgs, {
              quiet: true,
              removeTags: true,
              transform: (_, file) => file.contents.toString(),
            })
          )
        )
        .pipe(mode.production(htmlmin(config.htmlmin)))
        .pipe(dest(this.paths.dest));
    };
    const { alternateTask = () => htmlTask } = this.config;
    const finalTask = alternateTask(gulp, this.pathConfig, this.config);

    task("html", finalTask);
  }
}
module.exports = HtmlRegistry;
module.exports.getPaths = getPaths;

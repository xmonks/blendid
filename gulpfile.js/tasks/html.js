if (!TASK_CONFIG.html) return;

const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const data = require("gulp-data");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-htmlmin");
const inject = require("gulp-inject");
const svgmin = require("gulp-svgmin");
const svgstore = require("gulp-svgstore");
const nunjucksRender = require("gulp-nunjucks-render");
const handleErrors = require("../lib/handleErrors");
const projectPath = require("../lib/projectPath");

const dataFile = (pathConfig, name) =>
  projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
const jsonData = pathConfig => name =>
  fs.promises
    .readFile(dataFile(pathConfig, name), "utf8")
    .then(f => JSON.parse(f))
    .catch(() => {});

const getPaths = exclude => ({
  src: [
    projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.html.src,
      "**/*.{" + TASK_CONFIG.html.extensions + "}"
    ),
    exclude
  ].filter(Boolean),
  spritesSrc: projectPath(PATH_CONFIG.src, PATH_CONFIG.icons.src, "*.svg"),
  dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest)
});

const htmlTask = function() {
  const exclude =
    "!" +
    projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.html.src,
      "**/{" + TASK_CONFIG.html.excludeFolders.join(",") + "}/**"
    );

  const paths = getPaths(exclude);

  const collectionsDataFunction =
    PATH_CONFIG.data &&
    TASK_CONFIG.html.collections &&
    (() => {
      const cols = TASK_CONFIG.html.collections;
      return Promise.all(cols.map(jsonData(PATH_CONFIG))).then(xs =>
        cols.reduce((acc, x, i) => Object.assign(acc, { [x]: xs[i] }), {})
      );
    });

  const dataFunction =
    collectionsDataFunction ||
    TASK_CONFIG.html.dataFunction ||
    function(file) {
      const dataPath = projectPath(
        PATH_CONFIG.src,
        PATH_CONFIG.html.src,
        TASK_CONFIG.html.dataFile
      );
      return fs.promises.readFile(dataPath, "utf-8").then(x => JSON.parse(x));
    };

  const nunjucksRenderPath = [
    projectPath(PATH_CONFIG.src, PATH_CONFIG.html.src)
  ];
  TASK_CONFIG.html.nunjucksRender.path =
    TASK_CONFIG.html.nunjucksRender.path || nunjucksRenderPath;

  const filters = TASK_CONFIG.html.nunjucksRender.filters;
  if (filters) {
    const origFn = TASK_CONFIG.html.nunjucksRender.manageEnv;
    TASK_CONFIG.html.nunjucksRender.manageEnv = env => {
      for (let filter of Object.keys(filters)) {
        env.addFilter(filter, filters[filter]);
      }
      if (typeof origFn === "function") {
        origFn(env);
      }
    };
    delete TASK_CONFIG.html.nunjucksRender.filters;
  }
  const svgs = gulp
    .src(paths.spritesSrc)
    .pipe(
      svgmin(file => {
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
                force: true
              }
            }
          ]
        };
      })
    )
    .pipe(svgstore(TASK_CONFIG.svgSprite.svgstore));

  return gulp
    .src(paths.src)
    .pipe(data(dataFunction))
    .on("error", handleErrors)
    .pipe(nunjucksRender(TASK_CONFIG.html.nunjucksRender))
    .on("error", handleErrors)
    .pipe(
      gulpif(
        TASK_CONFIG.svgSprite,
        inject(svgs, {
          transform: (_, file) => file.contents.toString()
        })
      )
    )
    .pipe(gulpif(global.production, htmlmin(TASK_CONFIG.html.htmlmin)))
    .pipe(gulp.dest(paths.dest))
    .on("error", handleErrors);
};

const { alternateTask = () => htmlTask } = TASK_CONFIG.html;
const task = alternateTask(gulp, PATH_CONFIG, TASK_CONFIG);
gulp.task("html", task);
module.exports = task;
module.exports.getPaths = getPaths;

import fs from "node:fs";
import path from "node:path";
import DefaultRegistry from "undertaker-registry";
import gulp from "gulp";
import data from "gulp-data";
import gulpif from "gulp-if";
import gulp_mode from "gulp-mode";
import htmlmin from "gulp-htmlmin-next";
import inject from "gulp-inject";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import nunjucksRender from "gulp-nunjucks-render";
import nunjucksMarkdown from "nunjucks-markdown";
import { marked } from "../lib/markdown.mjs";
import projectPath from "../lib/projectPath.mjs";
import cloneDeep from "lodash-es/cloneDeep.js";

const mode = gulp_mode();

export function dataFile(pathConfig, name) {
  return projectPath(pathConfig.src, `${pathConfig.data.src}/${name}.json`);
}

export function jsonData(pathConfig) {
  return (name) => loadDataFile(dataFile(pathConfig, name));
}

export async function loadDataFile(dataFile) {
  if (!fs.existsSync(dataFile)) return null;
  const isJSON = path.extname(dataFile) === ".json";
  const dataModule = await import(
    dataFile,
    isJSON ? { assert: { type: "json" } } : undefined
  );
  return dataModule.default;
}

export function createDataFunction(collections, pathConfig, paths) {
  return async () => {
    console.log({collections, pathConfig, paths})
    const data = (await loadDataFile(paths.dataPath)) ?? {};
    console.log({data})
    if (!(Array.isArray(collections) && pathConfig.data)) {
      return data;
    }
    const colsData = await Promise.all(collections.map(jsonData(pathConfig)));
    return collections.reduce(
      (acc, key, i) => Object.assign(acc, { [key]: colsData[i] }),
      data
    );
  };
}

export function getPaths(exclude, taskConfig, pathConfig) {
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
          taskConfig.html?.dataFile ?? ""
        )
      : null,
    dest: projectPath(pathConfig.dest, pathConfig.html.dest),
  };
}

export class HtmlRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    const exclude = `!${projectPath(
      pathConfig.src,
      pathConfig.html.src,
      "**",
      `{${config.html.excludeFolders}}`,
      "**"
    )}`;
    this.paths = getPaths(exclude, config, pathConfig);
  }
  init({ task, src, dest }) {
    if (!this.config.html) return;
    const config = cloneDeep(this.config.html);

    const htmlTask = () => {
      const dataFunction =
        config.dataFunction ??
        createDataFunction(config.collections, this.pathConfig, this.paths);

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
                "removeXMLNS",
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

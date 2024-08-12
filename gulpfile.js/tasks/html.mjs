import fs from "node:fs";
import path from "node:path";
import gulp from "gulp";
import logger from "gulplog";
import debug from "gulp-debug";
import data from "gulp-data";
import gulp_mode from "gulp-mode";
import htmlmin from "gulp-htmlmin-next";
import inject from "gulp-inject";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import nunjucksRender from "gulp-nunjucks-render";
import nunjucksMarkdown from "nunjucks-markdown";
import cloneDeep from "lodash-es/cloneDeep.js";
import through2 from "through2";
import DefaultRegistry from "undertaker-registry";
import handleErrors from "../lib/handleErrors.mjs";
import { marked } from "../lib/markdown.mjs";
import projectPath from "../lib/projectPath.mjs";

/** @typedef {import("@types/nunjucks").Environment} Environment */
/** @typedef {import("@types/gulp")} Undertaker */

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
    `${dataFile}?${Date.now()}`,
    isJSON ? { with: { type: "json" } } : undefined
    );
  return dataModule.default;
}

export function createDataFunction(collections, pathConfig, paths) {
  return async () => {
    const data = (await loadDataFile(paths.dataPath)) ?? {};
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

export function getPaths(taskConfig, pathConfig) {
  return {
    ignore: taskConfig.html.excludeFolders?.map((x) => `**/${x}/*`),
    src: projectPath(
      pathConfig.src,
      pathConfig.html.src,
      `**`,
      `*.{${taskConfig.html?.extensions ?? "html"}}`
    ),
    spritesSrc: projectPath(pathConfig.src, pathConfig.icons.src, "*.svg"),
    dataPath: pathConfig.data
      ? projectPath(
        pathConfig.src,
        pathConfig.data.src,
        taskConfig.html?.dataFile ?? ""
      )
      : null,
    dest: projectPath(pathConfig.dest, pathConfig.html.dest)
  };
}

export function getNunjucksRenderOptions(config, pathConfig) {
  const {
    manageEnv,
    filters,
    globals,
    path: customPath,
    ...nunjucksRenderOptions
  } = config.nunjucksRender;
  nunjucksRenderOptions.path = customPath ?? [
    projectPath(pathConfig.src, pathConfig.html.src)
  ];
  /**
   * @param {Environment} env
   */
  nunjucksRenderOptions.manageEnv = (env) => {
    nunjucksMarkdown.register(env, marked.parse);
    if (globals) {
      for (const key of Object.keys(globals)) {
        env.addGlobal(key, globals[key]);
      }
    }
    if (filters) {
      for (const filter of Object.keys(filters)) {
        env.addFilter(filter, filters[filter]);
      }
    }
    if (typeof manageEnv === "function") {
      manageEnv(env);
    }
  };
  return nunjucksRenderOptions;
}

export class HtmlRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    this.paths = getPaths(config, pathConfig);
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    if (!this.config.html) return;

    const config = cloneDeep(this.config.html);

    const htmlTask = () => {
      let pathConfig = this.pathConfig;
      const dataFunction =
        config.dataFunction ??
        createDataFunction(config.collections, pathConfig, this.paths);
      const nunjucksRenderOptions = getNunjucksRenderOptions(
        config,
        pathConfig
      );

      const svgs = this.config.svgSprite
        ? src(this.paths.spritesSrc)
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
                    params: { prefix }
                  },
                  {
                    name: "cleanupIDs",
                    params: {
                      prefix: `${prefix}-`,
                      minify: true,
                      force: true
                    }
                  },
                  "removeXMLNS"
                ]
              };
            })
          )
          .pipe(debug({ title: "svgmin", logger: logger.debug }))
          .pipe(svgstore(this.config.svgSprite?.svgstore))
          .pipe(debug({ title: "svgstore", logger: logger.debug }))
        : null;

      return src(this.paths.src, { ignore: this.paths.ignore })
        .pipe(debug({ title: "html:", logger: logger.debug }))
        .pipe(data(dataFunction))
        .on("error", handleErrors)
        .pipe(nunjucksRender(nunjucksRenderOptions))
        .on("error", handleErrors)
        .pipe(
          this.config.svgSprite
            ? inject(svgs, {
              quiet: true,
              removeTags: true,
              transform(_, file) {
                return file.contents.toString();
              }
            }) : through2.obj()
        )
        .on("error", handleErrors)
        .pipe(this.config.svgSprite ? debug({ title: "injectsvg", logger: logger.debug }) : through2.obj())
        .pipe(mode.production(htmlmin(config.htmlmin)))
        .on("error", handleErrors)
        .pipe(mode.production(debug({ title: "htmlmin:", logger: logger.debug })))
        .pipe(dest(this.paths.dest));
    };
    const { alternateTask = () => htmlTask } = this.config;
    const finalTask = alternateTask(gulp, this.pathConfig, this.config);

    task("html", finalTask);
  }
}

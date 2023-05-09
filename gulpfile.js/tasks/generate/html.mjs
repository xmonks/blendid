import fs from "node:fs";
import path from "node:path";
import module from "node:module";
import data from "gulp-data";
import gulp_mode from "gulp-mode";
import gulpif from "gulp-if";
import htmlmin from "gulp-htmlmin-next";
import inject from "gulp-inject";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import streamArray from "stream-array";
import through from "through2";
import File from "vinyl";
import nunjucksRender from "gulp-nunjucks-render";
import DefaultRegistry from "undertaker-registry";
import {
  getPaths,
  createDataFunction,
  getNunjucksRenderOptions,
} from "../html.mjs";
import projectPath from "../../lib/projectPath.mjs";

const mode = gulp_mode();
const require = module.createRequire(import.meta.url);

export class GenerateHtmlRegistry extends DefaultRegistry {
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

    const config = this.config.html;
    const taskConfig = this.config;
    const pathConfig = this.pathConfig;
    function generateHtml(
      sourcePath,
      destPath,
      { template, route, collection }
    ) {
      const paths = getPaths(null, taskConfig, pathConfig);

      const dataFunction =
        config.dataFunction ??
        createDataFunction(config.collections, pathConfig, paths);

      const nunjucksRenderOptions = getNunjucksRenderOptions(
        config,
        pathConfig
      );

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
                { prefixIDs: { prefix } },
                {
                  cleanupIDs: {
                    prefix: prefix + "-",
                    minify: true,
                    force: true,
                  },
                },
                "removeXMLNS",
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
          .pipe(nunjucksRender(nunjucksRenderOptions))
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

import fs from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import data from "gulp-data";
import gulpif from "gulp-if";
import htmlmin from "gulp-htmlmin-next";
import inject from "gulp-inject";
import nunjucksRender from "gulp-nunjucks-render";
import gulpMode from "gulp-mode";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import Vinyl from "vinyl";
import cloneDeep from "lodash-es/cloneDeep.js";
import DefaultRegistry from "undertaker-registry";
import {
  createDataFunction,
  getNunjucksRenderOptions,
  getPaths
} from "../html.mjs";
import projectPath from "../../lib/projectPath.mjs";
import handleErrors from "../../lib/handleErrors.mjs";

const mode = gulpMode();

async function createFile(item, route, template) {
  const data = await new Response(item.contents).json();
  return new Vinyl({
    path: route(data),
    contents: fs.readFileSync(template),
    data: { item }
  });
}

function generateHtmlFile(route, template) {
  return new Transform({
    objectMode: true,
    transform(item, enc, done) {
      createFile(item, route, template)
        .then((x) => this.push(x))
        .then(() => done());
    }
  });
}

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

    const config = cloneDeep(this.config.html);
    const taskConfig = this.config;
    const pathConfig = this.pathConfig;

    function generateHtml(
      sourcePath,
      destPath,
      { template, route, collection }
    ) {
      const paths = getPaths(null, taskConfig, pathConfig);
      const templatePath = projectPath(
        pathConfig.src,
        pathConfig.html.src,
        template
      );

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
                    force: true
                  }
                },
                "removeXMLNS"
              ]
            };
          })
        )
        .pipe(svgstore(taskConfig.svgSprite.svgstore));

      function generateHtmlTask() {
        return src(sourcePath)
          .pipe(generateHtmlFile(route, templatePath))
          .on("error", handleErrors)
          .pipe(data(dataFunction))
          .on("error", handleErrors)
          .pipe(nunjucksRender(nunjucksRenderOptions))
          .on("error", handleErrors)
          .pipe(
            gulpif(
              taskConfig.svgSprite,
              inject(svgs, {
                quiet: true,
                removeTags: true,
                transform: (_, file) => file.contents.toString()
              })
            )
          )
          .on("error", handleErrors)
          .pipe(mode.production(htmlmin(config.htmlmin)))
          .pipe(dest(destPath));
      }

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

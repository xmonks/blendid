import { Transform } from "node:stream";
import gulpMode from "gulp-mode";
import htmlmin from "gulp-htmlmin-next";
import nunjucksRender from "gulp-nunjucks-render";
import cloneDeep from "lodash-es/cloneDeep.js";
import DefaultRegistry from "undertaker-registry";
import Vinyl from "vinyl";
import projectPath from "../../lib/projectPath.mjs";
import handleErrors from "../../lib/handleErrors.mjs";

const mode = gulpMode();

function createFile(item, { host, route }) {
  const [originalUrl, targetUrl] = route(item);
  const path = originalUrl.endsWith("/")
    ? originalUrl + "index.html"
    : originalUrl;
  return new Vinyl({
    path,
    contents: Buffer.from(
      [
        `<!DOCTYPE html>`,
        `<meta charset=utf-8>`,
        `<title>This page has been moved</title>`,
        `<meta name=robots content=noindex>`,
        `<meta http-equiv=refresh content="0;url={{host}}{{targetUrl}}">`,
        `<link rel=canonical href="{{host}}{{targetUrl}}">`,
        `<script>window.location.replace(new URL("{{targetUrl}}", "{{host}}"));</script>`,
        `<p>This page has been moved to <a href="{{host}}{{targetUrl}}">{{host}}{{targetUrl}}</a>`
      ].join("")
    ),
    data: { host, targetUrl }
  });
}

function generateHtmlFile(col) {
  return new Transform({
    transform(item, enc, done) {
      this.push(createFile(item, col));
      done();
    }
  });
}

export class GenerateRedirectsRegistry extends DefaultRegistry {
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
    if (!this.config.generate.redirects) return;

    const config = cloneDeep(this.config.html);

    function generateRedirect(sourcePath, destPath, col) {
      function generateRedirectsTask() {
        return src(sourcePath)
          .pipe(generateHtmlFile(col))
          .pipe(nunjucksRender(config.nunjucksRender))
          .on("error", handleErrors)
          .pipe(mode.production(htmlmin(config.htmlmin)))
          .pipe(dest(destPath));
      }

      generateRedirectsTask.displayName = `generate-redirects-${col.collection}`;
      return generateRedirectsTask;
    }

    function* createTasks(collections, pathConfig) {
      const dataPath = projectPath(pathConfig.src, pathConfig.data.src);
      const destPath = projectPath(pathConfig.dest, pathConfig.html.dest);
      for (const col of collections) {
        const sourcePath = projectPath(dataPath, `${col.collection}.json`);
        yield generateRedirect(sourcePath, destPath, col);
      }
    }

    task(
      "generate-redirect",
      parallel(
        Array.from(createTasks(this.config.generate.redirects, this.pathConfig))
      )
    );
    this.#ownTasks.add("generate-redirect");
  }
}

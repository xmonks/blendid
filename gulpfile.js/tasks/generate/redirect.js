const DefaultRegistry = require("undertaker-registry");
const File = require("vinyl");
const mode = require("gulp-mode")();
const htmlmin = require("gulp-htmlmin-next");
const streamArray = require("stream-array");
const through = require("through2");
const nunjucksRender = require("gulp-nunjucks-render");
const cloneDeep = require("lodash.clonedeep");
const projectPath = require("../../lib/projectPath");

function createFile(item, { host, route }) {
  const [originalUrl, targetUrl] = route(item);
  const path = originalUrl.endsWith("/")
    ? originalUrl + "index.html"
    : originalUrl;
  return new File({
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
        `<p>This page has been moved to <a href="{{host}}{{targetUrl}}">{{host}}{{targetUrl}}</a>`,
      ].join("")
    ),
    data: { host, targetUrl },
  });
}

class GenerateRedirectsRegistry extends DefaultRegistry {
  #ownTasks = new Set();
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  ownTasks() {
    return Array.from(this.#ownTasks);
  }

  init({ task, parallel, dest }) {
    if (!this.config.generate.redirects) return;

    const config = cloneDeep(this.config.html);
    function generateRedirect(sourcePath, destPath, col) {
      const generateRedirectsTask = () =>
        streamArray(require(sourcePath))
          .pipe(
            through.obj(function (item, enc, done) {
              const file = createFile(item, col);
              this.push(file);
              done();
            })
          )
          .pipe(nunjucksRender(config.nunjucksRender))
          .pipe(mode.production(htmlmin(config.htmlmin)))
          .pipe(dest(destPath));
      generateRedirectsTask.displayName = `generate-json-${col.collection}`;
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

module.exports = GenerateRedirectsRegistry;

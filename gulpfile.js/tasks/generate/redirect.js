if (!TASK_CONFIG.generate.redirects) return;

const stream = require("stream");
const utils = require("util");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const htmlmin = require("gulp-htmlmin-next");
const streamArray = require("stream-array");
const through = require("through2");
const File = require("vinyl");
const nunjucksRender = require("gulp-nunjucks-render");
const cloneDeep = require("lodash.clonedeep");
const projectPath = require("../../lib/projectPath");

const pipeline = utils.promisify(stream.pipeline);
const { dest, task, parallel } = gulp;

function generateRedirect(sourcePath, destPath, { host, route }) {
  const config = cloneDeep(TASK_CONFIG.html);

  const createFile = (item) => {
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
  };

  return () =>
    pipeline([
      streamArray(require(sourcePath)),
      through.obj(function (item, enc, done) {
        let file = createFile(item);
        this.push(file);
        done();
      }),
      nunjucksRender(config.nunjucksRender),
      gulpif(global.production, htmlmin(config.htmlmin)),
      dest(destPath),
    ]);
}

function* createTasks() {
  const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
  const destPath = projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest);
  const collections = TASK_CONFIG.generate.redirects;
  for (let col of collections) {
    const sourcePath = `${col.collection}.json`;
    yield generateRedirect(projectPath(dataPath, sourcePath), destPath, col);
  }
}

const taskName = "generate-redirect";
task(taskName, parallel(Array.from(createTasks())));
module.exports = taskName;

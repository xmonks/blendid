import DefaultRegistry from "undertaker-registry";
import markdownToJSON from "gulp-markdown-to-json";
import merge from "gulp-merge-json";
import changed from "gulp-changed";
import { marked } from "../../lib/markdown.mjs";
import projectPath from "../../lib/projectPath.mjs";
import handleErrors from "../../lib/handleErrors.mjs";

export class GenerateJsonRegistry extends DefaultRegistry {
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
    if (!this.config.generate.json) return;

    function generateJson(sourcePath, destPath, { collection, mergeOptions }) {
      const generateJsonTask = () =>
        src(sourcePath)
          .pipe(changed(destPath))
          .pipe(markdownToJSON({ renderer: marked }))
          .on("error", handleErrors)
          .pipe(
            merge({
              fileName: `${collection}.json`,
              ...mergeOptions,
            })
          )
          .pipe(dest(destPath));
      generateJsonTask.displayName = `generate-json-${collection}`;
      return generateJsonTask;
    }

    function* createTasks(collections, pathConfig) {
      const dataPath = projectPath(pathConfig.src, pathConfig.data.src);
      for (const col of collections) {
        const sourcePath = projectPath(
          dataPath,
          col.srcGlob ?? `${col.collection}/**/*.md`
        );
        yield generateJson(sourcePath, dataPath, col);
      }
    }

    task(
      "generate-json",
      parallel(
        Array.from(createTasks(this.config.generate.json, this.pathConfig))
      )
    );
    this.#ownTasks.add("generate-json");
  }
}

import { Readable } from "node:stream";
import chalk from "chalk";
import log from "fancy-log";
import DefaultRegistry from "undertaker-registry";
import projectPath from "../lib/projectPath.mjs";

async function* merge(streams) {
  for (const stream of streams) {
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

export class InitRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, src, dest }) {
    task("init", () => {
      const configStream = src(["path-config.json", "task-config.js"]).pipe(
        dest(projectPath("config"))
      );

      const srcStream = src(["../src/**/*", "../src/**/.gitkeep"]).pipe(
        dest(projectPath(this.pathConfig.src))
      );

      log(chalk.green("Generating default Blendid project files"));
      log(
        chalk.yellow(`
To start the dev server:
`),
        chalk.magenta(`
yarn blendid
`)
      );

      return Readable.from(merge([configStream, srcStream]));
    });
  }
}

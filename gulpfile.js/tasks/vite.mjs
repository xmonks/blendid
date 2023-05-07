import DefaultRegistry from "undertaker-registry";
import logger from "fancy-log";
import { createServer, version } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import projectPath from "../lib/projectPath.mjs";
import chalk from "chalk";

export class ViteRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }
  init({ task }) {
    task("vite", async () => {
      const root = projectPath(this.pathConfig.dest);
      const { plugins = [], browser, browserArgs, ...config } = this.config;
      if (browser) process.env.BROWSER = browser;
      if (browserArgs) process.env.BROWSER_ARGS = browserArgs;
      plugins.push(basicSsl());
      const server = await createServer({
        build: false,
        configFile: false,
        envFile: false,
        mode: "development",
        root,
        plugins,
        ...config,
      });
      await server.listen();
      logger(`${chalk.cyan("[vite]")} ${chalk.blue(`v${version}`)}`);
      logger(`${chalk.cyan("[vite]")} ${chalk.bold("dev server running at:")}`);
      server.printUrls();
      logger(`${chalk.cyan("[vite]")} serving files from: ${root}`);
      logger(`${chalk.cyan("[vite]")} opening the browser... ${browser ?? ""} ${browserArgs ?? ""}`);
    });
  }
}

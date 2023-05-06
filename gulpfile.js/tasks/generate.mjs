import DefaultRegistry from "undertaker-registry";
import { GenerateRedirectsRegistry } from "./generate/redirect.mjs";
import { GenerateJsonRegistry } from "./generate/json.mjs";
import { GenerateHtmlRegistry } from "./generate/html.mjs";

const noop = (done) => {
  done();
};

export class GenerateRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, series, registry }) {
    if (!this.config.generate) return;

    const redirect = new GenerateRedirectsRegistry(
      this.config,
      this.pathConfig
    );
    const json = new GenerateJsonRegistry(this.config, this.pathConfig);
    const html = new GenerateHtmlRegistry(this.config, this.pathConfig);
    registry(redirect);
    registry(json);
    registry(html);

    const genTasks = [redirect, json, html].flatMap((r) => r.ownTasks());
    task("generate", genTasks.length ? series(genTasks) : noop);
  }
}

import DefaultRegistry from "undertaker-registry";
import { create } from "browser-sync";
import projectPath from "../lib/projectPath.mjs";

/** @typedef {import("@types/gulp")} Undertaker */

const browserSync = create("blendid");

function browsersyncReload(cb) {
  browserSync.reload();
  cb();
}
browsersyncReload.displayName = "browsersync-reload";

function normalizeConfig(config) {
  if (typeof config.proxy === "string") {
    config.proxy = {
      target: config.proxy
    };
  }

  // Resolve path from project
  if (config.server?.baseDir) {
    config.server.baseDir = projectPath(config.server.baseDir);
  }

  // Resolve files from project
  if (config.files) {
    config.files = config.files.map((glob) => projectPath(glob));
  }
  return config;
}

export class BrowserSyncRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    if (!config) return;

    const { excludeFolders, excludeFiles = [], ...rest } = config;
    this.config = normalizeConfig(rest);

    const excludeFoldersGlob = excludeFolders
      ? `!(${projectPath(pathConfig.dest, "**", `{${excludeFolders}}`, "**")})`
      : null;

    const excludeFilesGlobs = excludeFiles?.map(
      (glob) => `!(${projectPath(pathConfig.dest, glob)})`
    );

    const server = this.config.proxy ?? this.config.server;
    server.middleware = server.middleware ?? server.extraMiddlewares ?? [];
    const assets = projectPath(pathConfig.dest, "**", "*.{html,js,css}");
    this.assetsGlob = [assets, excludeFoldersGlob]
      .concat(excludeFilesGlobs)
      .filter(Boolean);
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, watch }) {
    if (!this.config) return;
    task("browserSync", (done) => {
      browserSync.init(this.config);
      watch(this.assetsGlob, { events: "all" }, browsersyncReload);
      done();
    });
  }
}

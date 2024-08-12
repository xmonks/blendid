import DefaultRegistry from "undertaker-registry";
import { generateSW } from "workbox-build/build/generate-sw.js";
import { injectManifest } from "workbox-build/build/inject-manifest.js";
import projectPath from "../lib/projectPath.mjs";

function transformConfigPaths({ globDirectory, swDest, swSrc, ...config }) {
  if (globDirectory) {
    config.globDirectory = projectPath(globDirectory);
  }
  if (swDest) {
    config.swDest = projectPath(swDest);
  }
  if (typeof swSrc === "string") {
    config.swSrc = swSrc;
  } else if (typeof swSrc === "function") {
    config.swSrc = swSrc();
  }
  return config;
}

export class WorkboxBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task }) {
    if (!this.config) return;

    task("workboxBuild", () => {
      const config = transformConfigPaths(this.config);
      const useInjectManifest = typeof config.swSrc === "string";

      if (useInjectManifest) {
        return injectManifest(config);
      } else {
        return generateSW(config);
      }
    });
  }
}

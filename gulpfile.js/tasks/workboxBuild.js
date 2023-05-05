const DefaultRegistry = require("undertaker-registry");
const { generateSW, injectManifest } = require("workbox-build");
const projectPath = require("../lib/projectPath");

const transformConfigPaths = ({ globDirectory, swDest, swSrc, ...config }) => {
  if (globDirectory) {
    config.globDirectory = projectPath(globDirectory);
  }
  if (swDest) {
    config.swDest = projectPath(swDest);
  }
  if (swSrc) {
    config.swSrc = projectPath(swSrc);
  }
  return config;
};

class WorkboxBuildRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

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
module.exports = WorkboxBuildRegistry;

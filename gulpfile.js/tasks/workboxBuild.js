if (!TASK_CONFIG.workboxBuild) return;

const { task } = require("gulp");
const projectPath = require("../lib/projectPath");
const { generateSW, injectManifest } = require("workbox-build");

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

const workboxBuildTask = function() {
  const config = transformConfigPaths(TASK_CONFIG.workboxBuild);
  const useInjectManifest = typeof config.swSrc === "string";

  if (useInjectManifest) {
    return injectManifest(config).catch(error => {
      throw error;
    });
  } else {
    return generateSW(config).catch(error => {
      throw error;
    });
  }
};

task("workboxBuild", workboxBuildTask);
module.exports = workboxBuildTask;

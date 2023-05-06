import fs from "node:fs";
import module from "node:module";
import mergeWith from "lodash-es/mergeWith.js";
import projectPath from "./projectPath.mjs";
import taskDefaults from "./taskDefaults.mjs";

const require = module.createRequire(import.meta.url);

async function getTaskConfigInternal() {
  if (process.env.BLENDID_CONFIG_PATH) {
    const esm = projectPath(process.env.BLENDID_CONFIG_PATH, "task-config.mjs");
    if (fs.existsSync(esm)) {
      const module = await import(esm);
      return module.default;
    }
    return require(projectPath(
      process.env.BLENDID_CONFIG_PATH,
      "task-config.js"
    ));
  }

  const defaultEsm = projectPath("config/task-config.mjs");
  if (fs.existsSync(defaultEsm)) return import(defaultEsm);

  const defaultConfigPath = projectPath("config/task-config.js");
  if (fs.existsSync(defaultConfigPath)) {
    return require(defaultConfigPath);
  }

  return require("../task-config");
}

function withDefaults(taskConfig) {
  Object.keys(taskDefaults).reduce((config, key) => {
    if (taskConfig[key] !== false) {
      // if true, use default, else merge objects
      config[key] =
        taskDefaults[key] === true
          ? taskDefaults[key]
          : mergeWith(taskDefaults[key], config[key] || {}, replaceArrays);
    }
    return config;
  }, taskConfig);

  return taskConfig;
}

function replaceArrays(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
}

export async function getTaskConfig() {
  const config = await getTaskConfigInternal();
  return withDefaults(config);
}

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
    return require(
      projectPath(process.env.BLENDID_CONFIG_PATH, "task-config.js")
    );
  }

  const defaultEsm = projectPath("config/task-config.mjs");
  if (fs.existsSync(defaultEsm)) {
    const module = await import(defaultEsm);
    return module.default;
  }

  const defaultConfigPath = projectPath("config/task-config.js");
  if (fs.existsSync(defaultConfigPath)) {
    return require(defaultConfigPath);
  }

  return require("../task-config");
}

function withDefaults(taskConfig) {
  const result = Object.assign({}, taskConfig);
  for (const key of Object.keys(taskDefaults)) {
    if (taskConfig[key] === false) continue;
    result[key] =
      taskConfig[key] === true
        ? taskDefaults[key]
        : mergeWith(taskDefaults[key], taskConfig[key] ?? {}, replaceArrays);
  }
  return result;
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

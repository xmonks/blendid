import fs from "node:fs";
import module from "node:module";
import projectPath from "./projectPath.mjs";

const require = module.createRequire(import.meta.url);

function getPathConfig() {
  if (process.env.BLENDID_CONFIG_PATH) {
    return require(
      projectPath(process.env.BLENDID_CONFIG_PATH, "path-config.json")
    );
  }

  const defaultConfigPath = projectPath("config/path-config.json");

  if (fs.existsSync(defaultConfigPath)) {
    return require(defaultConfigPath);
  }

  return require("../path-config.json");
}

export default getPathConfig();

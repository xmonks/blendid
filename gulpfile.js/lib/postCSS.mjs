import cssnano from "cssnano";
import presetEnv from "postcss-preset-env";
import functions from "postcss-functions";

function getPresetEnvConfig(config) {
  let options = config.presetEnv ?? {};
  if (config.autoprefixer) {
    options.autoprefixer = config.autoprefixer;
  }
  return options;
}

function getPostCSSPlugins(config, userPlugins, mode) {
  const plugins = [presetEnv(getPresetEnvConfig(config)), functions(config)]
    .concat(userPlugins)
    .filter(Boolean);

  if (mode.production()) {
    plugins.push(cssnano(config.cssnano));
  }
  return plugins;
}

export default getPostCSSPlugins;

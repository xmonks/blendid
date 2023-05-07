import cssnano from "cssnano";
import presetEnv from "postcss-preset-env";
import gulp_mode from "gulp-mode";

const mode = gulp_mode();

function getPresetEnvConfig(config) {
  let options = config.presetEnv ?? {};
  if (config.autoprefixer) {
    options.autoprefixer = config.autoprefixer;
  }
  return options;
}

function getPostCSSPlugins(config) {
  const plugins = [presetEnv(getPresetEnvConfig(config))]
    .concat(config.postcss?.plugins)
    .filter(Boolean);

  delete config.postcss?.plugins;

  if (mode.production()) {
    plugins.push(cssnano(config.cssnano));
  }
  return plugins;
}

export default getPostCSSPlugins;

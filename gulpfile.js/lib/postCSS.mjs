import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import gulp_mode from "gulp-mode";

const mode = gulp_mode();

function getPostCSSPlugins(config) {
  const plugins = [
    autoprefixer(config.autoprefixer),
    mode.production() ? cssnano(config.cssnano) : null,
  ]
    .concat(config.postcss?.plugins)
    .filter(Boolean);

  delete config.postcss?.plugins;

  return plugins;
}

export default getPostCSSPlugins;

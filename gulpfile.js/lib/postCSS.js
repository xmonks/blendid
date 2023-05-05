const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const mode = require("gulp-mode")();

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

module.exports = getPostCSSPlugins;

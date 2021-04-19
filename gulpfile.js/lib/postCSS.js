const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

function getPostCSSPlugins(config) {
  const plugins = [autoprefixer(config.autoprefixer)];
  if (config.postcss && config.postcss.plugins) {
    plugins.concat(config.postcss.plugins);
    delete config.postcss.plugins;
  }
  if (global.production) {
    plugins.push(cssnano(config.cssnano));
  }
  return plugins;
}

module.exports = getPostCSSPlugins;

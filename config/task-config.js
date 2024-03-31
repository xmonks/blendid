const pathConfig = require("./path-config.json");

module.exports = {
  html: true,
  images: true,
  cloudinary: false,
  workboxBuild: false,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,
  esbuild: true,

  browserSync: {
    server: {
      baseDir: pathConfig.dest,
    },
  },

  production: {
    rev: true
  },

  watch: {
    tasks: []
  }
};

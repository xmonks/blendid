const pathConfig = require("./path-config.json");

module.exports = {
  html: true,
  images: true,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,
  javascripts: {
    modules: {
      app: "app.js"
    }
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  workboxBuild: {
    globDirectory: pathConfig.dest,
    globPatterns: ["**/*.{html,json,js,css,png,jpg,gif,svg}"],
    // Create service-worker.js source file and define `swSrc` to use `injectManifest` method
    // swSrc: `${pathConfig.src}/sw.js`,
    swDest: `${pathConfig.dest}/sw.prod.js`
  },

  production: {
    rev: true
  }
};

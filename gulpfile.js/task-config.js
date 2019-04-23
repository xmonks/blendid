module.exports = {
  html: true,
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,

  workboxBuild: {
    globDirectory: './public',
    globPatterns: [
      '**\/*.{html,json,js,css}'
    ],
    // Create service-worker.js source file and define `swSrc` to use `injectManifest` method
    // swSrc: './src/service-worker.js',
    swDest: './public/service-worker.prod.js',
  },

  javascripts: {
    entry: {
      // files paths are relative to
      // javascripts.dest in path-config.json
      app: ["./app.js"]
    }
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: "public"
    }
  },

  production: {
    rev: true
  }
};

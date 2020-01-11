const os = require("os");
const path = require("path");
const projectPath = require("./projectPath");
const pkg = require(projectPath("package.json"));

module.exports = {
  javascripts: {},

  stylesheets: {
    sass: {
    },
    extensions: ["sass", "scss", "css"]
  },

  html: {
    dataFile: "data/global.json",
    nunjucksRender: {
      envOptions: {
        watch: false
      }
    },
    htmlmin: {
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    },
    excludeFolders: ["layouts", "shared", "macros", "data"],
    extensions: ["html", "njk", "json"]
  },

  images: {
    extensions: ["jpg", "png", "svg", "gif"]
  },

  fonts: {
    extensions: ["woff2", "woff", "eot", "ttf", "svg"]
  },

  svgSprite: {
    svgstore: {}
  },

  workboxBuild: {},

  production: {
    rev: true
  },

  additionalTasks: {
    initialize(gulp, PATH_CONFIG, TASK_CONFIG) {
      // gulp.task('myTask', function() { })
    },
    development: {
      prebuild: null,
      postbuild: null
    },
    production: {
      prebuild: null,
      postbuild: null
    }
  }
};

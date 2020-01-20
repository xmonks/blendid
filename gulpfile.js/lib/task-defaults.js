const scssParser = require("postcss-scss");
const sass = require("node-sass");
const cloudinary = require("cloudinary").v2;

module.exports = {
  javascripts: {},

  stylesheets: {
    sass: {
      functions: {
        "cloudinaryUrl($publicId, $width: 'auto', $format: 'auto', $quality: 'auto', $dpr: 1)": (
          publicId,
          width,
          format,
          quality,
          dpr
        ) => {
          return new sass.types.String(
            `url(${cloudinary.url(publicId.getValue(), {
              width: width.getValue(),
              fetch_format: format.getValue(),
              quality: quality.getValue(),
              dpr: dpr.getValue(),
              secure: true
            })})`
          );
        }
      }
    },
    postcss: {
      parser: scssParser
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

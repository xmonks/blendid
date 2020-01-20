const scssParser = require("postcss-scss");
const sass = require("node-sass");
const cloudinary = require("cloudinary").v2;

module.exports = {
  javascripts: {},

  stylesheets: {
    sass: {
      functions: {
        "cloudinaryUrl($publicId, $width: 'auto', $height: 'auto', $format: 'auto', $quality: 'auto', $dpr: 1, $crop: 'scale', $gravity: 'center')": (
          publicId,
          width,
          height,
          format,
          quality,
          dpr,
          crop,
          gravity
        ) => {
          return new sass.types.String(
            `url(${cloudinary.url(publicId.getValue(), {
              crop: crop.getValue(),
              dpr: dpr.getValue(),
              fetch_format: format.getValue(),
              gravity: gravity.getValue(),
              height: height.getValue(),
              quality: quality.getValue(),
              width: width.getValue(),
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
      filters: {
        split: (str, seperator) => str.split(seperator),
        cloudinaryUrl: (
          publicId,
          {
            width = "auto",
            height = "auto",
            format = "auto",
            quality = "auto",
            dpr = 1,
            crop = "scale",
            gravity = "center"
          } = {}
        ) =>
          cloudinary.url(publicId, {
            crop,
            dpr,
            fetch_format: format,
            gravity,
            height,
            quality,
            secure: true,
            width
          })
      },
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
    initialize(gulp, PATH_CONFIG, TASK_CONFIG) {},
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

const scssParser = require("postcss-scss");
const sass = require("node-sass");
const cloudinary = require("cloudinary").v2;
const terser = require("terser");

function cloudinaryUrl(
  publicId,
  {
    width = "auto",
    height,
    format = "auto",
    quality = "auto",
    dpr = 1,
    crop,
    gravity
  } = {}
) {
  return cloudinary.url(publicId, {
    crop,
    dpr,
    fetch_format: format,
    gravity,
    height,
    quality,
    secure: true,
    width
  });
}

function sassCloudinaryUrl(
  publicId,
  width,
  height,
  format,
  quality,
  dpr,
  crop,
  gravity
) {
  const nullableValue = x => (sass.NULL === x ? null : x.getValue());
  return new sass.types.String(
    `url(${cloudinaryUrl(publicId.getValue(), {
      crop: nullableValue(crop),
      dpr: nullableValue(dpr),
      format: nullableValue(format),
      gravity: nullableValue(gravity),
      height: nullableValue(height),
      quality: nullableValue(quality),
      width: nullableValue(width)
    })})`
  );
}

function minifyJS(text, inline) {
  const res = terser.minify(text, {
    warnings: true,
    module: true,
    mangle: false,
    ecma: 2018
  });
  if (res.warnings) console.log(res.warnings);
  if (res.error) {
    console.log(text);
    throw res.error;
  }
  return res.code;
}

module.exports = {
  javascripts: {},

  stylesheets: {
    sass: {
      functions: {
        "cloudinaryUrl($publicId, $width: 'auto', $height: null, $format: 'auto', $quality: 'auto', $dpr: 1, $crop: null, $gravity: null)": sassCloudinaryUrl
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
        cloudinaryUrl
      },
      envOptions: {
        watch: false
      }
    },
    htmlmin: {
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS,
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

const scssParser = require("postcss-scss");
const sass = require("node-sass");
const cloudinary = require("cloudinary").v2;
const terser = require("terser");
const { minifyHTMLLiterals } = require("minify-html-literals");

const terserOptions = {
  mangle: false,
  module: true,
  ecma: 2018
};

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

const sassCloudinaryUrlSignature =
  "cloudinaryUrl($publicId, $width: 'auto', $height: null, $format: 'auto', $quality: 'auto', $dpr: 1, $crop: null, $gravity: null)";
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
  const litTags = new Set(["html", "svg"]);
  const min = minifyHTMLLiterals(text, {
    fileName: "yolo.js",
    shouldMinify: ({ tag }) => tag && litTags.has(tag.toLowerCase())
  });
  const res = terser.minify(
    min ? min.code : text,
    Object.assign({}, terserOptions) // create copy because options are mutated
  );
  if (res.warnings) console.log(res.warnings);
  if (res.error) {
    console.log(text);
    throw res.error;
  }
  return res.code;
}

module.exports = {
  javascripts: {
    terser: terserOptions,
    extensions: ["js", "mjs", "cjs"]
  },

  stylesheets: {
    sass: {
      functions: {
        [sassCloudinaryUrlSignature]: sassCloudinaryUrl
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
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS,
      removeAttributeQuotes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeStyleLinkTypeAttributes: true
    },
    excludeFolders: ["layouts", "shared", "macros", "data"],
    extensions: ["html", "njk", "json"]
  },

  images: {
    extensions: ["jpg", "jpeg", "png", "svg", "gif"]
  },

  cloudinary: {
    extensions: ["jpg", "jpeg", "png", "gif", "svg"],
    manifest: "images.json"
  },

  fonts: {
    extensions: ["woff2", "woff", "eot", "ttf", "svg"]
  },

  svgSprite: {
    svgstore: {
      inlineSvg: true
    }
  },

  watch: {
    tasks: []
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

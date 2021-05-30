const sass = require("sass");
const cloudinary = require("cloudinary").v2;

function cloudinaryUrl(
  publicId,
  {
    width = "auto",
    height,
    format = "auto",
    quality = "auto",
    dpr = 1,
    crop,
    gravity,
    flags = "progressive",
  } = {}
) {
  try {
    return cloudinary.url(publicId, {
      crop,
      dpr,
      fetch_format: format,
      gravity,
      height,
      quality,
      secure: true,
      width,
      flags,
    });
  } catch (err) {
    console.error("cloudinaryUrl", err);
  }
}

function* pairs(dartMap) {
  for (let i = 0; i < dartMap.getLength(); i++) {
    yield [dartMap.getKey(i).getValue(), dartMap.getValue(i).getValue()];
  }
}
const toJS = (dartMap) => Object.fromEntries(pairs(dartMap));
const sassCloudinaryUrlSignature = "cloudinaryUrl($publicId, $opts: ())";
const sassCloudinaryUrl = (publicId, opts) =>
  new sass.types.String(
    `url(${cloudinaryUrl(publicId.getValue(), toJS(opts))})`
  );

module.exports = {
  javascripts: {
    extensions: ["js", "mjs", "cjs"],
  },

  stylesheets: {
    sass: {
      functions: {
        [sassCloudinaryUrlSignature]: sassCloudinaryUrl,
      },
    },
    extensions: ["sass", "scss", "css"],
  },

  generate: {
    extensions: ["md", "json"],
  },

  html: {
    dataFile: "data/global.json",
    nunjucksRender: {
      filters: {
        split: (str, seperator) => str.split(seperator),
        cloudinaryUrl,
      },
      envOptions: {
        watch: false,
      },
    },
    htmlmin: {
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      removeAttributeQuotes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeStyleLinkTypeAttributes: true,
    },
    excludeFolders: ["layouts", "shared", "macros", "data"],
    extensions: ["html", "njk", "json"],
  },

  images: {
    extensions: ["jpg", "jpeg", "png", "svg", "gif"],
  },

  cloudinary: {
    extensions: ["jpg", "jpeg", "png", "gif", "svg"],
    manifest: "images.json",
  },

  fonts: {
    extensions: ["woff2", "woff", "eot", "ttf", "svg"],
  },

  svgSprite: {
    svgstore: {
      inlineSvg: true,
    },
  },

  watch: {
    tasks: [],
  },

  workboxBuild: {},

  production: {
    rev: true,
  },

  additionalTasks: {
    initialize(gulp, PATH_CONFIG, TASK_CONFIG) {},
    development: {
      prebuild: null,
      postbuild: null,
    },
    production: {
      prebuild: null,
      postbuild: null,
    },
  },
};

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
    ar,
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
      aspect_ratio: ar,
    });
  } catch (err) {
    console.error("cloudinaryUrl", err);
  }
}

const sassCloudinaryUrlSignature = "cloudinaryUrl($publicId, $opts: ())";
const sassCloudinaryUrl = (args) => {
  const publicId = args[0].assertString("publicId").text;
  const opts = args[1]?.contents?.toJS();
  return new sass.SassString(
    `url(${cloudinaryUrl(publicId, opts)})`
  );
};

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
    dataFile: "global.json",
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

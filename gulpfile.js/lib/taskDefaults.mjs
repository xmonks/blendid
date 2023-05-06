import { pathToFileURL } from "node:url";
import module from "node:module";
import gulp_mode from "gulp-mode";
import sass from "sass-embedded";
import { v2 as cloudinary } from "cloudinary";

const mode = gulp_mode();
const require = module.createRequire(import.meta.url);

function resolveInclude(url) {
  const parts = url.split("/");
  parts.push("_" + parts.pop());
  const includeUrl = parts.join("/");
  return pathToFileURL(require.resolve(`${includeUrl}.scss`));
}

function cloudinaryUrl(publicId, opts = {}) {
  try {
    const unwrap = (x) => x?.value ?? x?.text ?? x;
    const customKeys = new Map([
      ["format", "fetch_format"],
      ["ar", "aspect_ratio"],
    ]);
    const options = Object.assign(
      {
        secure: true,
        width: "auto",
        fetch_format: "auto",
        quality: "auto",
        dpr: 1,
        flags: "progressive",
      },
      Object.fromEntries(
        Object.entries(opts).map(([k, v]) => [
          customKeys.has(k) ? customKeys.get(k) : k,
          unwrap(v),
        ])
      )
    );
    return cloudinary.url(publicId, options);
  } catch (err) {
    console.error("cloudinaryUrl", err);
  }
}

const sassCloudinaryUrlSignature = "cloudinaryUrl($publicId, $opts: ())";
const sassCloudinaryUrl = (args) => {
  const publicId = args[0].assertString("publicId").text;
  const opts = args[1]?.contents?.toJS();
  return new sass.SassString(`url(${cloudinaryUrl(publicId, opts)})`, {
    quotes: false,
  });
};

export default {
  javascripts: {
    extensions: ["js", "mjs", "cjs"],
  },

  esbuild: {
    extensions: ["ts", "js", "mjs"],
    options: {
      bundle: true,
      splitting: true,
      treeShaking: true,
      minify: mode.production(),
      mainFields: ["module", "browser", "main"],
      sourcemap: true,
      legalComments: "linked",
      format: "esm",
      platform: "browser",
      target: ["es2021"],
      charset: "utf8",
    },
  },

  stylesheets: {
    sass: {
      importers: [
        {
          findFileUrl(url) {
            try {
              return pathToFileURL(require.resolve(`${url}.scss`));
            } catch (err) {
              try {
                return resolveInclude(url);
              } catch (e) {
                return null;
              }
            }
          },
        },
      ],
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

  sizeReport: { gzip: true },

  watch: {
    tasks: [],
  },

  workboxBuild: {},

  production: {
    rev: true,
  },

  registries: [],

  additionalTasks: {
    /** @deprecated */
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

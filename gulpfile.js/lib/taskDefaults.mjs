import { pathToFileURL } from "node:url";
import * as path from "node:path";
import module from "node:module";
import logger from "fancy-log";
import gulp_mode from "gulp-mode";
import * as sass from "sass-embedded";
import { v2 as cloudinary } from "cloudinary";
import { getPathConfig } from "./getPathConfig.mjs";

const mode = gulp_mode();
const require = module.createRequire(import.meta.url);

function resolveInclude(url) {
  const parts = url.split("/");
  parts.push("_" + parts.pop());
  const includeUrl = parts.join("/");
  return pathToFileURL(require.resolve(`${includeUrl}.scss`));
}

/**
 * @param {string} publicId Public ID of cloudinary resource
 * @param {Object} [opts]
 */
function cloudinaryUrl(publicId, opts = {}) {
  try {
    const unwrap = (x) => x?.value ?? x?.text ?? x;
    const customKeys = new Map([
      ["format", "fetch_format"],
      ["ar", "aspect_ratio"]
    ]);
    const options = Object.assign(
      {
        secure: true,
        width: "auto",
        fetch_format: "auto",
        quality: "auto",
        dpr: 1,
        flags: "progressive"
      },
      Object.fromEntries(
        Object.entries(opts).map(([k, v]) => [
          customKeys.has(k) ? customKeys.get(k) : k,
          unwrap(v)
        ])
      )
    );
    return cloudinary.url(publicId, options);
  } catch (err) {
    logger.error("cloudinaryUrl", err);
  }
}

const sassCloudinaryUrlSignature = "cloudinaryUrl($publicId, $opts: ())";
function sassCloudinaryUrl(args) {
  const publicId = args[0].assertString("publicId").text;
  const opts = args[1]?.contents?.toJS();
  return new sass.SassString(`url(${cloudinaryUrl(publicId, opts)})`, {
    quotes: false
  });
}

/**
 * @param {string} assetPath Asset path
 * @param {"stylesheets"|"javascripts"|"esm"|"fonts"|"icons"|"images"|"html"|"static"} assetType Key in path-config.json map
 * @param {Object} [options]
 * @param {string} [options.base] Optional base path to prefix the resolved asset URL. Default is / - root absolute URL.
 * @returns {string}
 */
function assetUrl(assetPath, assetType, options) {
  const pathConfig = getPathConfig();
  const destPath = pathConfig[assetType].dest;
  return path.join(options?.base ?? "/", destPath, assetPath);
}

const sassAssetUrlSignature = "assetUrl($assetType, $assetPath, $opts: ())";
function sassAssetUrl(args) {
  const assetType = args[0].assertString("assetType").text;
  const assetPath = args[1].assertString("assetPath").text;
  const opts = args[2]?.contents?.toJS();
  return new sass.SassString(`url(${assetUrl(assetPath, assetType, opts)})`, {
    quotes: false
  });
}

export default {
  javascripts: {
    extensions: ["js", "mjs", "cjs"]
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
      charset: "utf8"
    }
  },

  stylesheets: {
    presetEnv: {
      stage: 3,
      minimumVendorImplementations: 2
    },
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
          }
        }
      ],
      functions: {
        [sassAssetUrlSignature]: sassAssetUrl,
        [sassCloudinaryUrlSignature]: sassCloudinaryUrl
      }
    },
    extensions: ["sass", "scss", "css"]
  },

  generate: {
    extensions: ["md", "json", "mjs"]
  },

  html: {
    dataFile: "global.json",
    excludeFolders: ["layouts", "shared", "macros", "data"],
    extensions: ["html", "njk", "json"],
    nunjucksRender: {
      filters: {
        split(str, seperator) {
          return str.split(seperator);
        },
        assetUrl,
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
      removeAttributeQuotes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeStyleLinkTypeAttributes: true
    }
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

  sizeReport: { gzip: true },

  watch: {
    tasks: []
  },

  workboxBuild: {},

  production: {
    rev: true
  },

  registries: [],

  additionalTasks: {
    development: {
      prebuild: null,
      postbuild: null
    },
    production: {
      prebuild: null,
      postbuild: null
    }
  },

  vite: {
    appType: "mpa",
    server: {
      open: "/",
      host: true,
      port: 3000
    }
  }
};

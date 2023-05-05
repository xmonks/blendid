const DefaultRegistry = require("undertaker-registry");
const fs = require("fs");
const path = require("path");
const mode = require("gulp-mode")();
const rollup = require("rollup");
const projectPath = require("../lib/projectPath");

/**
 * Generates `data/assets.json` for later use in collections
 * @param bundle
 * @param options
 * @param pathConfig
 * @returns {Promise<void>}
 */
async function writeBundleManifest(bundle, options, pathConfig) {
  const manifest = await bundle.generate(options);
  const manifestPath = projectPath(
    pathConfig.src,
    pathConfig.data.src,
    "assets.json"
  );
  if (!fs.existsSync(path.dirname(manifestPath)))
    await fs.promises.mkdir(path.dirname(manifestPath));
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

function resolveInputPaths(modules, src) {
  const input = {};
  for (let entry in modules) {
    input[entry] = path.join(src, modules[entry]);
  }
  return input;
}

function registerDefaultPlugins(plugins, replacePlugins, minifiOptions) {
  // create shallow copy so we don't modify our parameters
  const result = [...plugins];
  if (!replacePlugins) {
    const alias = require("@rollup/plugin-alias");
    const { nodeResolve } = require("@rollup/plugin-node-resolve");
    result.unshift(
      // Solves common problem with tslib resolution
      alias({
        entries: [{ find: "tslib", replacement: "tslib/tslib.es6.js" }],
      }),
      // Enable node_modules resolution for browser packages
      nodeResolve({ browser: true })
    );
  }
  // Minify production build
  if (mode.production()) {
    const {
      default: minifyHtml,
    } = require("rollup-plugin-minify-html-literals");
    result.push(
      // minifies lit-html literals
      minifyHtml(minifiOptions)
    );
  }
  return result;
}

class JavaScriptsRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    this.paths = {
      src: projectPath(pathConfig.src, pathConfig.javascripts.src),
      dest: projectPath(pathConfig.dest, pathConfig.javascripts.dest),
    };
  }
  init({ task }) {
    if (!this.config) return;

    task("javascripts", async () => {
      const {
        modules = {},
        plugins = [],
        output = {},
        replacePlugins,
        extensions,
        minify,
        ...rest
      } = this.config;
      // Rollup resolves imports relative to working directory. Gulp restores it per task
      const origWd = process.cwd();
      process.chdir(this.paths.src);
      const bundle = await rollup.rollup({
        input: resolveInputPaths(modules, this.paths.src),
        plugins: registerDefaultPlugins(plugins, replacePlugins, minify),
        ...rest,
      });
      const options = {
        entryFileNames: "[name].js",
        dir: this.paths.dest,
        format: "esm",
        ...output,
      };
      await writeBundleManifest(bundle, options, this.pathConfig);
      const result = await bundle.write(options);
      process.chdir(origWd);
      return result;
    });
  }
}

module.exports = JavaScriptsRegistry;

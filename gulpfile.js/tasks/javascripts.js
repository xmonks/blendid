if (!TASK_CONFIG.javascripts) return;

const fs = require("fs");
const { task } = require("gulp");
const path = require("path");
const rollup = require("rollup");
const { terser } = require("rollup-plugin-terser");
const resolve = require("@rollup/plugin-node-resolve");
const projectPath = require("../lib/projectPath");

/**
 * Generates `data/assets.json` for later use in collections
 * @param bundle
 * @param options
 * @returns {Promise<void>}
 */
async function writeBundleManifest(bundle, options) {
  const manifest = await bundle.generate(options);
  const manifestPath = projectPath(
    PATH_CONFIG.src,
    PATH_CONFIG.data.src,
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

function registerDefaultPlugins(plugins, replacePlugins, terserOptions) {
  // Enable node_modules resolution for browser packages
  const result = replacePlugins
    ? [...plugins]
    : [resolve({ browser: true }), ...plugins];
  // Minify production build
  if (global.production) {
    result.push(terser(terserOptions));
  }
  return result;
}

const paths = {
  src: projectPath(PATH_CONFIG.src, PATH_CONFIG.javascripts.src),
  dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest)
};

task("javascripts", async function() {
  const {
    modules = {},
    plugins = [],
    output = {},
    replacePlugins,
    terser: terserOptions,
    ...rest
  } = TASK_CONFIG.javascripts;
  // Rollup resolves imports relative to working directory. Gulp restores it per task
  process.chdir(paths.src);
  const bundle = await rollup.rollup({
    input: resolveInputPaths(modules, paths.src),
    plugins: registerDefaultPlugins(plugins, replacePlugins, terserOptions),
    ...rest
  });
  const options = {
    entryFileNames: "[name].mjs",
    dir: paths.dest,
    format: "esm",
    ...output
  };
  await writeBundleManifest(bundle, options);
  return bundle.write(options);
});

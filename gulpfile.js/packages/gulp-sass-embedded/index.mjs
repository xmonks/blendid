/**
 * @licence The MIT License (MIT)
 * @copyright Copyright (c) 2013 David Manning
 * @see https://github.com/dlmanning/gulp-sass
 */
import chalk from "chalk";
import PluginError from "plugin-error";
import replaceExtension from "replace-ext";
import stripAnsi from "strip-ansi";
import through from "through2";
import path from "path";
import applySourceMap from "vinyl-sourcemaps-apply";
import sass from "sass-embedded";

const PLUGIN_NAME = "gulp-sass-embedded";

function ensureParentDirectoryInIncludedPaths(file, opts) {
  const includePaths = [];
  if (typeof opts.includePaths === "string") {
    includePaths.push(opts.includePaths);
  } else if (Array.isArray(opts.includePaths)) {
    includePaths.push(...opts.includePaths);
  }
  includePaths.unshift(path.dirname(file.path));
  return { includePaths };
}

function buildSourceMaps(sassObj, file) {
  // Transform map into JSON
  const sassMap = JSON.parse(sassObj.map.toString());
  // Grab the stdout and transform it into stdin
  const sassMapFile = sassMap.file.replace(/^stdout$/, "stdin");
  // Grab the base file name that's being worked on
  const sassFileSrc = file.relative;
  // Grab the path portion of the file that's being worked on
  const sassFileSrcPath = path.dirname(sassFileSrc);
  if (sassFileSrcPath) {
    // Prepend the path to all files in the sources array except the file that's being worked on
    const sourceFileIndex = sassMap.sources.indexOf(sassMapFile);
    sassMap.sources = sassMap.sources.map((source, index) => {
      return index === sourceFileIndex
        ? source
        : path.join(sassFileSrcPath, source);
    });
  }

  // Remove 'stdin' from sources and replace with filenames!
  sassMap.sources = sassMap.sources.filter((src) => src !== "stdin" && src);

  // Replace the map file with the original file name (but new extension)
  sassMap.file = replaceExtension(sassFileSrc, ".css");
  // Apply the map
  applySourceMap(file, sassMap);
}

function buildStats(file) {
  let now = new Date();
  file.stat.atime = now;
  file.stat.mtime = now;
  file.stat.ctime = now;
}

function createFlushFile(file, flush) {
  return (sassObj) => {
    if (sassObj.map) buildSourceMaps(sassObj, file);
    if (file.stat) buildStats(file);

    flush(
      null,
      Object.assign(file, {
        contents: sassObj.css,
        path: replaceExtension(file.path, ".css"),
      })
    );
  };
}

function generateSourceMapsIfEnabled(file) {
  if (!file.sourceMap) return null;
  return {
    sourceMap: file.path,
    omitSourceMapUrl: true,
    sourceMapContents: true,
  };
}

const gulpSass = (options) =>
  through.obj((file, transform, flush) => {
    if (file.isNull()) return flush(null, file);

    if (file.isStream())
      return flush(
        new PluginError({
          plugin: PLUGIN_NAME,
          message: "Streaming not supported",
        })
      );

    if (path.basename(file.path).indexOf("_") === 0) return flush();

    if (!file.contents.length) {
      file.path = replaceExtension(file.path, ".css");
      return flush(null, file);
    }

    const opts = Object.assign(
      {},
      options,
      ensureParentDirectoryInIncludedPaths(file, options),
      generateSourceMapsIfEnabled(file)
    );

    const flushFile = createFlushFile(file, flush);

    const errorMessage = (error) => {
      const filePath =
        (error.file === "stdin" ? file.path : error.file) || file.path;
      const relativePath = path.relative(process.cwd(), filePath);
      const message = [chalk.underline(relativePath), error.formatted].join(
        "\n"
      );

      error.messageFormatted = message;
      error.messageOriginal = error.message;
      error.message = stripAnsi(message);
      error.relativePath = relativePath;

      return flush(new PluginError(PLUGIN_NAME, error));
    };

    try {
      const result = sass.compile(file.path, opts);
      return flushFile({
        css: Buffer.from(result.css),
        map: result.sourceMap,
      });
    } catch (error) {
      return errorMessage(error);
    }
  });

gulpSass.logError = function logError(error) {
  process.stderr.write(`${error}\n`);
  this.emit("end");
};

export default gulpSass;

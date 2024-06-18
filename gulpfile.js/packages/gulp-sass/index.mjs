/**
 * @licence The MIT License (MIT)
 * @copyright Copyright (c) 2013 David Manning
 * @see https://github.com/dlmanning/gulp-sass
 */
import path from "node:path";
import { Transform } from "node:stream";
import { styleText } from "node:util";
import logger from "gulplog";
import PluginError from "plugin-error";
import replaceExtension from "replace-ext";
import stripAnsi from "strip-ansi";
import applySourceMap from "vinyl-sourcemaps-apply";
import * as sass from "sass";

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
  const now = new Date();
  file.stat.atime = now;
  file.stat.mtime = now;
  file.stat.ctime = now;
}

function addResultsToFile(file, sassResult) {
  if (sassResult.map) buildSourceMaps(sassResult, file);
  if (file.stat) buildStats(file);

  return Object.assign(file, {
    contents: sassResult.css,
    path: replaceExtension(file.path, ".css")
  });
}

function errorMessage(file, error) {
  const filePath =
    (error.file === "stdin" ? file.path : error.file) || file.path;
  const relativePath = path.relative(process.cwd(), filePath);
  const message = [styleText("underline", relativePath), error.formatted].join(
    "\n"
  );

  error.messageFormatted = message;
  error.messageOriginal = error.message;
  error.message = stripAnsi(message);
  error.relativePath = relativePath;

  return new PluginError(PLUGIN_NAME, error);
}

function generateSourceMapsIfEnabled(file) {
  if (!file.sourceMap) return null;
  return {
    sourceMap: file.path,
    omitSourceMapUrl: true,
    sourceMapContents: true
  };
}

function gulpSass(options) {
  return new Transform({
    objectMode: true,
    transform(file, transform, cb) {
      if (file.isNull()) return cb(null, file);

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      if (path.basename(file.path).startsWith("_")) {
        // ignore partials
        return cb();
      }

      if (!file.contents.length) {
        file.path = replaceExtension(file.path, ".css");
        this.push(file);
        return cb();
      }

      const opts = Object.assign(
        {},
        options,
        ensureParentDirectoryInIncludedPaths(file, options),
        generateSourceMapsIfEnabled(file)
      );

      try {
        const result = sass.compile(file.path, opts);
        this.push(
          addResultsToFile(file, {
            css: Buffer.from(result.css),
            map: result.sourceMap
          })
        );
        cb();
      } catch (error) {
        cb(errorMessage(file, error));
      }
    }
  });
}

gulpSass.logError = function logError(error) {
  logger.error(`${error}\n`);
  this.emit("end");
};

export default gulpSass;

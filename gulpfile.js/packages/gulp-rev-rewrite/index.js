import path from "node:path";
import { Buffer } from "node:buffer";
import { Transform } from "node:stream";
import PluginError from "plugin-error";
import replace from "./lib/replace.js";

function relativePath(from, to) {
  return path.relative(from, to).replaceAll("\\", "/");
}

export default function plugin(options = {}) {
  let manifest = {};
  const files = [];

  return new Transform({
    objectMode: true,
    transform(file, encoding, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      if (file.isStream()) {
        return callback(
          new PluginError("gulp-rev-rewrite", "Streaming not supported")
        );
      }

      // Collect original and revisioned paths directly from the vinyl files in the stream
      if (file.revOrigPath) {
        const originalPath = relativePath(file.revOrigBase, file.revOrigPath);
        manifest[originalPath] = relativePath(file.base, file.path);
      }

      files.push(file);

      callback();
    },
    flush(callback) {
      // Collect original and revisioned paths from a manifest
      if (options.manifest) {
        manifest = Object.assign(
          manifest,
          JSON.parse(options.manifest.toString())
        );
      }

      // Rewrite paths
      for (const file of files) {
        const modifiedRenames = Object.entries(manifest).map((entry) => {
          const [unreved, reved] = entry;
          const modifiedUnreved = options.modifyUnreved
            ? options.modifyUnreved(unreved, file)
            : unreved;
          const modifiedReved = options.modifyReved
            ? options.modifyReved(reved, file)
            : reved;
          return { unreved: modifiedUnreved, reved: modifiedReved };
        });

        const contents = file.contents.toString();
        const newContents = replace(contents, modifiedRenames);

        // Update contents only if they changed
        if (newContents !== contents) {
          file.contents = Buffer.from(newContents);
        }

        this.push(file);
      }

      callback();
    }
  });
}

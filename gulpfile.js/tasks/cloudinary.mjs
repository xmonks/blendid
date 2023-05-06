import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import DefaultRegistry from "undertaker-registry";
import cloudinaryUpload from "gulp-cloudinary-upload";
import changed from "gulp-changed";
import projectPath from "../lib/projectPath.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

function readManifest(path) {
  if (!path) return null;
  return fs.promises
    .readFile(path, "utf-8")
    .then((x) => JSON.parse(x))
    .catch(() => null);
}

export class CloudinaryRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    this.paths = {
      src: projectPath(pathConfig.src, pathConfig.cloudinary?.src ?? ""),
      dest: projectPath(pathConfig.src, pathConfig.data?.src ?? ""),
      manifest: config.manifest
        ? projectPath(
            pathConfig.src,
            pathConfig.data?.src ?? "",
            config.manifest
          )
        : null,
    };
  }

  init({ task, src, dest, lastRun }) {
    if (!this.config) return;
    const paths = this.paths;
    const pathConfig = this.pathConfig;

    function getRelativePath(filePath) {
      return path.relative(
        paths.src,
        path.resolve(__dirname, path.dirname(filePath))
      );
    }

    function getRelativeFilePath(filePath) {
      return path.relative(paths.src, path.resolve(__dirname, filePath));
    }

    const cloudinaryTask = () =>
      src(path.join(paths.src, "**", `*.{${this.config.extensions}}`), {
        since: lastRun(cloudinaryTask),
      })
        .pipe(
          changed(paths.dest, {
            async hasChanged(stream, sourceFile) {
              const manifest = await readManifest(paths.manifest);
              const imagePath = getRelativeFilePath(sourceFile.path);
              if (!manifest?.[imagePath]) {
                stream.push(sourceFile);
              }
            },
          })
        )
        .pipe(
          cloudinaryUpload({
            folderResolver(filePath) {
              const relativePath = getRelativePath(filePath);
              return path.join(pathConfig.cloudinary.dest, relativePath);
            },
            keyResolver(filePath) {
              return path.relative(
                paths.src,
                path.resolve(__dirname, filePath)
              );
            },
          })
        )
        .pipe(
          cloudinaryUpload.manifest({
            path: paths.manifest,
            merge: true,
          })
        )
        .pipe(dest(paths.dest));

    task("cloudinary", cloudinaryTask);
  }
}

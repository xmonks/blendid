if (!TASK_CONFIG.cloudinary) return;

const fs = require("fs");
const stream = require("stream");
const util = require("util");
const { task, src, dest, lastRun } = require("gulp");
const cloudinaryUpload = require("gulp-cloudinary-upload");
const changed = require("gulp-changed");
const path = require("path");
const projectPath = require("../lib/projectPath");

const pipeline = util.promisify(stream.pipeline);

const paths = {
  src: projectPath(PATH_CONFIG.src, PATH_CONFIG.cloudinary.src),
  dest: projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src),
  manifest: projectPath(
    PATH_CONFIG.src,
    PATH_CONFIG.data.src,
    TASK_CONFIG.cloudinary.manifest
  )
};

function readManifest(path) {
  return fs.promises
    .readFile(path, "utf-8")
    .then(x => JSON.parse(x))
    .catch(() => null);
}

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
  pipeline(
    src(
      path.join(paths.src, "**", `*.{${TASK_CONFIG.cloudinary.extensions}}`),
      {
        since: lastRun(cloudinaryTask)
      }
    ),
    changed(paths.dest, {
      async hasChanged(stream, sourceFile) {
        const manifest = await readManifest(paths.manifest);
        const imagePath = getRelativeFilePath(sourceFile.path);
        if (!(manifest && manifest[imagePath])) {
          stream.push(sourceFile);
        }
      }
    }),
    cloudinaryUpload({
      folderResolver(filePath) {
        const relativePath = getRelativePath(filePath);
        return path.join(PATH_CONFIG.cloudinary.dest, relativePath);
      },
      keyResolver(filePath) {
        return path.relative(paths.src, path.resolve(__dirname, filePath));
      }
    }),
    cloudinaryUpload.manifest({
      path: paths.manifest,
      merge: true
    }),
    dest(paths.dest)
  );

task("cloudinary", cloudinaryTask);
module.exports = cloudinaryTask;

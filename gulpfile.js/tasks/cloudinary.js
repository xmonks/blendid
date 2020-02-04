if (!TASK_CONFIG.cloudinary) return;

const fs = require("fs");
const { task, src, dest, lastRun } = require("gulp");
const cloudinaryUpload = require("gulp-cloudinary-upload");
const changed = require("gulp-changed");
const path = require("path");
const projectPath = require("../lib/projectPath");

const paths = {
  src: projectPath(PATH_CONFIG.src, PATH_CONFIG.cloudinary.src),
  dest: projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src),
  manifest: projectPath(
    PATH_CONFIG.src,
    PATH_CONFIG.data.src,
    TASK_CONFIG.cloudinary.manifest
  )
};

async function readManifest(path) {
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
  return path.relative(
    paths.src,
    path.resolve(__dirname, filePath)
  );
}

const cloudinaryTask = () =>
  src(path.join(paths.src, "**", `*.{${TASK_CONFIG.cloudinary.extensions}}`), {
    since: lastRun(cloudinaryTask)
  })
    .pipe(
      changed(paths.dest, {
        async hasChanged(stream, sourceFile, targetPath) {
          const manifest = await readManifest(paths.manifest);
          const imagePath = getRelativeFilePath(sourceFile.path);
          console.log("hasChaged:", {
            image: manifest[imagePath],
            path: sourceFile.path,
            relPath: imagePath,
            manifestPath: paths.manifest
          });
          if (!(manifest && manifest[imagePath])) {
            stream.push(sourceFile);
          }
        }
      })
    )
    .pipe(
      cloudinaryUpload({
        folderResolver(filePath) {
          const relativePath = getRelativePath(filePath);
          return path.join(PATH_CONFIG.cloudinary.dest, relativePath);
        },
        keyResolver(filePath) {
          return path.relative(paths.src, path.resolve(__dirname, filePath));
        }
      })
    )
    .pipe(
      cloudinaryUpload.manifest({
        path: paths.manifest,
        merge: true
      })
    )
    .pipe(dest(paths.dest));

task("cloudinary", cloudinaryTask);
module.exports = cloudinaryTask;

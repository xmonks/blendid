if (!TASK_CONFIG.cloudinary) return;

const { task, src, dest, lastRun } = require("gulp");
const cloudinaryUpload = require("gulp-cloudinary-upload");
const path = require("path");
const projectPath = require("../lib/projectPath");

const paths = {
  src: projectPath(PATH_CONFIG.src, PATH_CONFIG.cloudinary.src),
  dest: projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src)
};

const cloudinaryTask = () =>
  src(path.join(paths.src, "**", `*.{${TASK_CONFIG.cloudinary.extensions}}`), {
    since: lastRun(cloudinaryTask)
  })
    .pipe(
      cloudinaryUpload({
        folderResolver(filePath) {
          const relativePath = path.relative(
            paths.src,
            path.resolve(__dirname, path.dirname(filePath))
          );
          return path.join(PATH_CONFIG.cloudinary.dest, relativePath);
        },
        keyResolver(filePath) {
          return path.relative(paths.src, path.resolve(__dirname, filePath));
        }
      })
    )
    .pipe(
      cloudinaryUpload.manifest({
        path: path.join(paths.dest, TASK_CONFIG.cloudinary.manifest)
      })
    )
    .pipe(dest(paths.dest));

task("cloudinary", cloudinaryTask);
module.exports = cloudinaryTask;

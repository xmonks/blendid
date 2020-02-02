if (!TASK_CONFIG.cloudinary) return;

const { task, src, dest } = require("gulp");
const cloudinaryUpload = require("gulp-cloudinary-upload");
const changedInPlace = require("gulp-changed-in-place");
const path = require("path");
const projectPath = require("../lib/projectPath");

const cloudinaryTask = () =>
  src(
    projectPath(
      PATH_CONFIG.src,
      PATH_CONFIG.cloudinary.src,
      `**/*.{${TASK_CONFIG.cloudinary.extensions}}`
    )
  )
    //.pipe(changedInPlace())
    .pipe(
      cloudinaryUpload({
        folderResolver(filePath) {
          const relativePath = path.relative(
            projectPath(PATH_CONFIG.src, PATH_CONFIG.cloudinary.src),
            path.resolve(__dirname, path.dirname(filePath))
          );
          return path.join(PATH_CONFIG.cloudinary.dest, relativePath);
        }
      })
    )
    .pipe(
      cloudinaryUpload.manifest({
        path: projectPath(
          PATH_CONFIG.src,
          PATH_CONFIG.data.src,
          TASK_CONFIG.cloudinary.manifest
        )
      })
    )
    .pipe(dest(projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src)));

task("cloudinary", cloudinaryTask);
module.exports = cloudinaryTask;

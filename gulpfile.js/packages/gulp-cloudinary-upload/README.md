# gulp-cloudinary-upload [![Build Status](https://travis-ci.org/TheDancingCode/gulp-cloudinary-upload.svg?branch=master)](https://travis-ci.org/TheDancingCode/gulp-cloudinary-upload) [![npm](https://img.shields.io/npm/v/gulp-cloudinary-upload.svg)](https://www.npmjs.com/package/gulp-cloudinary-upload) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/TheDancingCode/gulp-cloudinary-upload.svg)](https://greenkeeper.io/)

> Batch upload images to Cloudinary

## Install

```
npm install --save-dev gulp-cloudinary-upload
```

Only [LTS and current releases](https://github.com/nodejs/Release#release-schedule) of Node are supported.

## Usage

### Upload

Upload images to your [Cloudinary](https://cloudinary.com/) cloud. The plugin uses the filename as `public_id` for easy retrieval.

```js
const gulp = require('gulp');
const cloudinaryUpload = require('gulp-cloudinary-upload');

gulp.task('default', () =>
  gulp.src('src/images/*')
    .pipe(cloudinaryUpload({
      config: {
        cloud_name: 'sample',
        api_key: '874837483274837',
        api_secret: 'a676b67565c6767a6767d6767f676fe1'
      }
    }));
);
```

### Asset manifest

Write an asset manifest mapping the original images to Cloudinary's upload response. This data can be consumed by other plugins and is particularly useful in conjuction with templating languages.

```js
const gulp = require('gulp');
const cloudinaryUpload = require('gulp-cloudinary-upload');

gulp.task('default', () =>
  gulp.src('src/images/*')
    .pipe(cloudinaryUpload({
      config: {
        cloud_name: 'sample',
        api_key: '874837483274837',
        api_secret: 'a676b67565c6767a6767d6767f676fe1'
      }
    }))
    .pipe(cloudinaryUpload.manifest())
    .pipe(gulp.dest('src/data'));
);
```

Example manifest, after uploading `cat.png` and `dog.jpg`:

```JSON
{
  "cat.png": {
    "public_id": "cat",
    "version": 1528013000,
    "signature": "f420ed5e038d34777c4b0468750c3076860e89dd",
    "width": 1200,
    "height": 800,
    "format": "png",
    "resource_type": "image",
    "created_at": "2018-06-03T08:03:20Z",
    "tags": [],
    "bytes": 7890,
    "type": "upload",
    "etag": "3ccfc4c5eac57349ab827b5c9ac87d69",
    "placeholder": false,
    "url": "http://res.cloudinary.com/demo/image/upload/v1528013000/cat.png",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v1528013000/cat.png",
    "original_filename": "cat"
  },
  "dog.jpg": {
    "public_id": "dog",
    "version": 1528011592,
    "signature": "0a6a7e4d3e551d6701f5976f115600ee37d2271f",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "resource_type": "image",
    "created_at": "2018-06-03T08:03:32Z",
    "tags": [],
    "bytes": 12045,
    "type": "upload",
    "placeholder": false,
    "url": "http://res.cloudinary.com/demo/image/upload/v1528011592/dog.jpg",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v1528011592/dog.jpg",
    "original_filename": "dog"
  }
}
```

By default, `cloudinary-manifest.json` will be replaced as a whole. To merge with an existing manifest, pass `merge: true` and the `path` to the manifest to `cloudinaryUpload.manifest()`:

```js
const gulp = require('gulp');
const cloudinaryUpload = require('gulp-cloudinary-upload');

gulp.task('default', () =>
  gulp.src('src/images/*')
    .pipe(cloudinaryUpload({
      config: {
        cloud_name: 'sample',
        api_key: '874837483274837',
        api_secret: 'a676b67565c6767a6767d6767f676fe1'
      }
    }))
    .pipe(cloudinaryUpload.manifest({
      path: 'src/data/cloudinary-manifest.json',
      merge: true
    }))
    .pipe(gulp.dest('src/data'));
);
```

## API

### cloudinaryUpload([options])

#### options

Type: `Object`

##### config

Type: `Object`

An object containing your Cloudinary `cloud_name`, `api_key` and `api_secret` configuration parameters. This can be omitted when setting the `CLOUDINARY_URL` environment variable.

Example:

```js
config: {
  cloud_name: 'sample',
  api_key: '874837483274837',
  api_secret: 'a676b67565c6767a6767d6767f676fe1'
}
```

##### params

Type: `Object`<br>
Default: `{ overwrite: false }`

Pass additional parameters to [Cloudinary's upload method](https://cloudinary.com/documentation/image_upload_api_reference#upload). Useful when creating eager transformations or tagging images. Note that this plugin always uses a file's name as its `public_id`. As a result, the `public_id`, `use_filename` and `unique_filename` parameters won't have any effect.

Example:

```js
params: {
  tags: ['cat', 'British Longhair', 'animal', '2018']
}
```

##### folderResolver

Type: `Function`<br>
Default: `undefined`

Function for generating `params.folder` influenced by original file path.

### cloudinaryUpload.manifest([options])

#### options

Type: `Object`

##### path

Type: `String`<br>
Default: `cloudinary-manifest.json`

Set the name or location of the manifest file.

##### merge

Type: `Boolean`<br>
Default: `false`

Merge with an existing manifest file. Use the `path` option to point to its location.

## Testing

In order to run the tests locally, create a `.env` file with the `CLOUDINARY_URL` environment variable. Have a look at [`.env.example`](https://github.com/TheDancingCode/gulp-cloudinary-upload/blob/master/.env.example) for an example.

## Acknowledgements

The code for the `cloudinaryUpload.manifest()` method was largely borrowed from [gulp-rev](https://github.com/sindresorhus/gulp-rev).

## License

MIT © [Thomas Vantuycom](https://github.com/TheDancingCode)

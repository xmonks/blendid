# Changelog

## 8.1.1
 - cleanup marked usage from transitional settings
 - Fixed broken `init` and `init-config` tasks (changed behavior of `src` in Gulp v5)
 - updated dependencies

## 8.1.O
 - requires Node 22
 - updated dependencies
 - uses `with` instead of `assert` in JSON imports

## 8.0.8
 - fixed HTML generator to generate file for each item in the collection
 - updated dependencies

## 8.0.7
- changed order of the `static` files task (moved to second place after clean)
- updated caniuse-lite

## 8.0.6
- rev JS uses esm path config prior to esbuild

## 8.0.5
- fix error in sizereport

## 8.0.4
- all binary handling tasks have disabled encoding
- Updated Sass Embedded to 1.74.1

## 8.0.3
- Fixed fonts task changing encoding of font files
- Updated Vite to 5.2.8

## 8.0.2
- removed `cloudinaryUrl` debug logging
- fixed HTML generator NPE

## 8.0.1
- added debugging ability to every task
- fixed globs/ignores
- added type hints to registries

## 8.0.0
- Requires Node 21
- Gulp v5
- updated dependencies

## 7.1.0

- bumped dependencies
- Sass `pkg:` specifier is now supported, See [official blog post](https://sass-lang.com/blog/announcing-pkg-importers/) for more details

## 7.0.4

- updated dependencies to latest versions

## 7.0.3

- fix native streams of JSON in generators

## 7.0.2

- updated Changelog

## 7.0.1

- cleanup files from npm package

## 7.0.0

- removed deprecated code
- use native node stream utilities instead of dependencies
- updated dependencies
- removed `javascripts` functionality based on Rollup in favour of `esbuild`

# 6.x

- moved to Gulp Registries and ESM
- deprecated global based APIs for extending the Blendid functionality in favor of Registries
- support for ESM based configuration
- introduced Vite.js for HMR
- introduced esbuild based workflow for ESM code
- moved to `postcss-preset-env`

# 5.x

- cleaned up shims for different backend frameworks
- updated to Gulp v4
- introduced support for `collections`
- introduced `generate` functionality based on collections
- introduced `cloudinary` functionality
- moved to `sass-embedded`

## 4.4.2

- relatively references directories and files within init task

## 4.4.1

- hotfix: ensures new `fancy-log` package does not break tasks

## 4.4.0

- Prevent browserSync.server.middleware from being overwritten completely
- reorganizes production and replace file tasks to ensure public directory is cleaned on build task
- replaces outdated gulp-util with appropriate packages

## 4.3.1

- Hotfix for HTTP/2 upgrade task

## 4.3.0

- Adds an HTTP/2 assets upgrade by running `yarn run blendid -- http2-upgrade`
- Updates extras to include HTTP/2 init files

## 4.2.0

- Update dependencies, including Webpack 3
- Adds Drupal init task
- Readme updates
- Allow manually specifying the files that the `clean` task will delete via a `clean.patterns` option

## 4.1.0

- Add `devtool`, `uglifyJsPlugin`, and `definePlugin` environment options
- [Autoset `uglifyJsPlugin.sourceMap` to `true`](https://github.com/webpack/webpack/issues/2704#issuecomment-228860162)
  if `production.devtool` is defined
- Add `publicPath` to Craft task-config.js [#432](https://github.com/vigetlabs/blendid/issues/432)

## 4.0.1

- add watchOptions to browserSync config [#429](https://github.com/vigetlabs/blendid/pull/429)

## 4.0.0 Blendid!

- Gulp Starter is now Blendid!
- Now a standalone yarn/npm installable module :tada:
- Tasks and modules are fully configurable through task-config.js
- Paths are fully configuraable through path-config.json
- Update all dependencies to latest, including Webpack 2
- HTML and CSS tasks can be swapped out with alternative custom tasks
- Changed default Sass files from `.sass` to `.scss` 😭
- Custom gulp tasks can be added and run prebuild, postbuild, in development or production builds
- Renames javascripts `entries` option to `entry` to match Webpack config
- Removes Karma, Mocha, Sinon, Chai Test Suite. Jest is better and easy to set up. Use that instead.
- `init` task generates default config files and folder structure
- `init-craft` and `init-rails` tasks generate config files, helpers, and asset folder structures for their
  environments.
- So much more... see the README

### Upgrading from Beta and Release Candidates

- In task-config.js, `javascripts.entries` was renamed `javascript.entry` to be consistent with Webpack.
- You are no longer requried to provide `extensions` in each task config, or really any non-default configuration. If
  you want to use default settings in any task configuration, simply set the value to `true`. If you pass a
  configuration object, those settings will be merged with the defaults.
- Check the README for other new configuration options.

# 3.x.x Gulp Starter

This was the previous iteration of this project. Gulp Starter was not an installable package, and was more of an example
starter kit that you could fork, clone, and copy into your project. The last iteration of this work is archived in the
gulp-starter branch of this repo.

See the blog post that started it all:
https://www.viget.com/articles/gulp-browserify-starter-faq

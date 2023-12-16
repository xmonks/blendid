# ![Blendid](https://raw.githubusercontent.com/hckr-studio/blendid/master/blendid-logo.png)

**Blendid** is a delicious stand-alone blend of tasks and build tools that form a full-featured modern asset pipeline.
It can be used as-is as a static site builder, or can be configured and integrated into your own
development environment and site or app structure.

## Quick start on a fresh project (empty directory)

```bash
nvm install 20
yarn init
yarn add @hckr_/blendid
yarn blendid init
yarn blendid
```

This will create default src and config files in your directory and start compiling and live-updating files!
Try editing them and watch your browser auto-update!

# Publish to npm

```
yarn npm login
yarn npm publish --access public --tag latest
```

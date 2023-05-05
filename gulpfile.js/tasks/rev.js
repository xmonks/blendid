const DefaultRegistry = require("undertaker-registry");
// TODO: transform to registries
const RevAssetsRegistry = require("./rev/assets.js");
const RevCodeRegistry = require("./rev/code.js");
const RevImportmapsCodeRegistry = require("./rev/importmaps-code.js");
const RevUpdateReferenceRegistry = require("./rev/update-references.js");
const RevUpdateHtmlRegistry = require("./rev/update-html.js");
const RevUpdateJsRegistry = require("./rev/update-js.js");

class RevRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
  }

  init({ task, series, registry }) {
    if (!this.config.production.rev) return;
    registry(new RevAssetsRegistry(this.config, this.pathConfig));
    registry(new RevCodeRegistry(this.config, this.pathConfig));
    registry(new RevImportmapsCodeRegistry(this.config, this.pathConfig));
    registry(new RevUpdateReferenceRegistry(this.config, this.pathConfig));
    registry(new RevUpdateHtmlRegistry(this.config, this.pathConfig));
    registry(new RevUpdateJsRegistry(this.config, this.pathConfig));

    const updateHtml = this.config.html ? "update-html" : false;
    const updateJs =
      this.config.javascripts || this.config.esbuild ? "update-js" : false;
    const revTasks = [
      // 1) Add md5 hashes to assets referenced by CSS and JS files
      "rev-assets",
      // 2) Update asset references (images, fonts, etc) with reved filenames in compiled css + js
      "rev-update-references",
      // 3) Rev and compress CSS and JS files
      // (this is done after assets, so that if a referenced asset hash changes,
      // the parent hash will change as well
      "rev-code",
      "rev-importmaps-code",
      // 4) Update asset references in JS
      updateJs,
      // 5) Update asset references in HTML
      updateHtml,
    ].filter(Boolean);
    task("rev", series(revTasks));
  }
}

module.exports = RevRegistry;

const { assert } = require("chai");
const forEach = require("lodash/forEach");
const getEnabledTasks = require("../getEnabledTasks");
const keys = require("lodash/keys");

describe("getEnabledTasks", function() {
  describe("when env == development", function() {
    beforeEach(function() {
      ENV = "development";
    });

    describe("#assetTasks", function() {
      beforeEach(function() {
        TASK_CONFIG = {
          cloudinary: true,
          fonts: true,
          iconFont: true,
          images: true,
          svgSprite: true
        };
      });

      it("returns all tasks when none disabled", function() {
        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.assetTasks, [
          "cloudinary",
          "fonts",
          "iconFont",
          "images",
          "svgSprite"
        ]);
      });

      it("returns only enabled task when some disabled", function() {
        TASK_CONFIG["iconFont"] = false;
        TASK_CONFIG["svgSprite"] = false;

        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.assetTasks, ["cloudinary", "fonts", "images"]);
      });

      it("returns false when all disabled", function() {
        forEach(keys(TASK_CONFIG), function(key) {
          TASK_CONFIG[key] = false;
        });

        const tasks = getEnabledTasks(ENV);
        assert.equal(tasks.assetTasks, false);
      });
    });

    describe("#codeTasks", function() {
      beforeEach(function() {
        TASK_CONFIG = {
          html: true,
          stylesheets: true,
          javascripts: true
        };
      });

      it("returns all except javascripts when none disabled", function() {
        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.codeTasks, ["html", "stylesheets", "javascripts"]);
      });

      it("returns only enabled except javascripts task when some disabled", function() {
        TASK_CONFIG["stylesheets"] = false;

        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.codeTasks, ["html", "javascripts"]);
      });

      it("returns false when all disabled", function() {
        forEach(keys(TASK_CONFIG), function(key) {
          TASK_CONFIG[key] = false;
        });

        const tasks = getEnabledTasks(ENV);
        assert.equal(tasks.codeTasks, false);
      });
    });
  });

  describe("when env == production", function() {
    beforeEach(function() {
      ENV = "production";
    });

    describe("#assetTasks", function() {
      beforeEach(function() {
        TASK_CONFIG = {
          cloudinary: true,
          fonts: true,
          iconFont: true,
          images: true,
          svgSprite: true
        };
      });

      it("returns all tasks when none disabled", function() {
        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.assetTasks, [
          "cloudinary",
          "fonts",
          "iconFont",
          "images",
          "svgSprite"
        ]);
      });

      it("returns only enabled task when some disabled", function() {
        TASK_CONFIG["iconFont"] = false;
        TASK_CONFIG["svgSprite"] = false;

        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.assetTasks, ["cloudinary", "fonts", "images"]);
      });

      it("returns false when all disabled", function() {
        forEach(keys(TASK_CONFIG), function(key) {
          TASK_CONFIG[key] = false;
        });

        const tasks = getEnabledTasks(ENV);
        assert.equal(tasks.assetTasks, false);
      });
    });

    describe("#codeTasks", function() {
      beforeEach(function() {
        TASK_CONFIG = {
          html: true,
          stylesheets: true,
          javascripts: true
        };
      });

      it("returns all and convert javascripts task when none disabled", function() {
        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.codeTasks, [
          "html",
          "stylesheets",
          "javascripts"
        ]);
      });

      it("returns only enabled and convert javascripts task when some disabled", function() {
        TASK_CONFIG["stylesheets"] = false;

        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.codeTasks, ["html", "javascripts"]);
      });

      it("still correctly disable javascripts task when disabled", function() {
        TASK_CONFIG["javascripts"] = false;

        const tasks = getEnabledTasks(ENV);
        assert.deepEqual(tasks.codeTasks, ["html", "stylesheets"]);
      });

      it("returns false when all disabled", function() {
        forEach(keys(TASK_CONFIG), function(key) {
          TASK_CONFIG[key] = false;
        });

        const tasks = getEnabledTasks(ENV);
        assert.equal(tasks.codeTasks, false);
      });
    });
  });
});

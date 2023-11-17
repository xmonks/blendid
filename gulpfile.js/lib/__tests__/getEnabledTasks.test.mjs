import { assert } from "chai";
import getEnabledTasks from "../getEnabledTasks.mjs";

var ENV = "development";
var taskConfig = {};

describe("getEnabledTasks", function () {
  describe("when env == development", function () {
    beforeEach(function () {
      ENV = "development";
    });

    describe("#assetTasks", function () {
      beforeEach(function () {
        taskConfig = {
          cloudinary: true,
          fonts: true,
          iconFont: true,
          images: true,
          svgSprite: true
        };
      });

      it("returns all tasks when none disabled", function () {
        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.assetTasks, [
          "cloudinary",
          "fonts",
          "iconFont",
          "images"
        ]);
      });

      it("returns only enabled task when some disabled", function () {
        taskConfig["iconFont"] = false;

        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.assetTasks, ["cloudinary", "fonts", "images"]);
      });

      it("returns false when all disabled", function () {
        Object.keys(taskConfig).forEach((key) => {
          taskConfig[key] = false;
        });

        const tasks = getEnabledTasks(taskConfig);
        assert.equal(tasks.assetTasks, null);
      });
    });

    describe("#codeTasks", function () {
      beforeEach(function () {
        taskConfig = {
          html: true,
          stylesheets: true,
          esbuild: true
        };
      });

      it("returns all when none disabled", function () {
        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.codeTasks, ["esbuild", "stylesheets"]);
      });

      it("returns only enabled except esbuild task when some disabled", function () {
        taskConfig["stylesheets"] = false;

        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.codeTasks, ["esbuild"]);
      });

      it("returns false when all disabled", function () {
        Object.keys(taskConfig).forEach((key) => {
          taskConfig[key] = false;
        });

        const tasks = getEnabledTasks(taskConfig);
        assert.equal(tasks.codeTasks, null);
      });
    });
  });

  describe("when env == production", function () {
    beforeEach(function () {
      ENV = "production";
    });

    describe("#assetTasks", function () {
      beforeEach(function () {
        taskConfig = {
          cloudinary: true,
          fonts: true,
          iconFont: true,
          images: true
        };
      });

      it("returns all tasks when none disabled", function () {
        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.assetTasks, [
          "cloudinary",
          "fonts",
          "iconFont",
          "images"
        ]);
      });

      it("returns only enabled task when some disabled", function () {
        taskConfig["iconFont"] = false;

        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.assetTasks, ["cloudinary", "fonts", "images"]);
      });

      it("returns false when all disabled", function () {
        Object.keys(taskConfig).forEach((key) => {
          taskConfig[key] = false;
        });

        const tasks = getEnabledTasks(taskConfig);
        assert.equal(tasks.assetTasks, null);
      });
    });

    describe("#codeTasks", function () {
      beforeEach(function () {
        taskConfig = {
          html: true,
          stylesheets: true,
          esbuild: true
        };
      });

      it("returns all and convert javascripts task when none disabled", function () {
        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.codeTasks, ["esbuild", "stylesheets"]);
      });

      it("returns only enabled and convert javascripts task when some disabled", function () {
        taskConfig["stylesheets"] = false;

        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.codeTasks, ["esbuild"]);
      });

      it("still correctly disable esbuild task when disabled", function () {
        taskConfig["esbuild"] = false;

        const tasks = getEnabledTasks(taskConfig);
        assert.deepEqual(tasks.codeTasks, ["stylesheets"]);
      });

      it("returns false when all disabled", function () {
        Object.keys(taskConfig).forEach((key) => {
          taskConfig[key] = false;
        });

        const tasks = getEnabledTasks(taskConfig);
        assert.equal(tasks.codeTasks, null);
      });
    });
  });
});

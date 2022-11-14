const { assert } = require("chai");
const pathToUrl = require("../pathToUrl");

describe("pathToUrl", function () {
  it("converts Windows paths to a url path", function () {
    const urlPath = pathToUrl("\\Foo\\bar\\baz");
    assert.equal(urlPath, "/Foo/bar/baz");
  });

  it("does not affect unix paths", function () {
    const unixPath = pathToUrl("/Foo/bar/baz/");
    assert.equal(unixPath, "/Foo/bar/baz/");
  });

  it("normalizes path segments", function () {
    const joinedPath = pathToUrl("/", "//Foo", "bar", "baz/");
    assert.equal(joinedPath, "/Foo/bar/baz/");
  });
});

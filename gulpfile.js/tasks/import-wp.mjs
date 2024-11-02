import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parseArgs, styleText } from "node:util";
import logger from "gulplog";
import DefaultRegistry from "undertaker-registry";
import projectPath from "../lib/projectPath.mjs";

async function fetchObjects(objectType, url) {
  const hostname = new URL(url).hostname;
  const wordpressAPI = hostname.endsWith("wordpress.com")
    ? `https://public-api.wordpress.com/wp/v2/sites/${hostname}/`
    : new URL(`/wp-json/wp/v2/`, url);

  const resp = await fetch(new URL(objectType, wordpressAPI));
  return resp.json();
}

function pageTemplates(pages) {
  return pages
    .map(x => [x.slug, { title: x.title.rendered, content: x.content.rendered }])
    .map(([slug, { title, content }]) => [
        slug,
        `{% extends 'layouts/application.njk' %}

{% set title = "${title}" %}
{% set slug = "${slug}" %}

{% block content %}
<h1>${title}</h1>
${content}
{% endblock %}`
      ]
    );
}

async function importPages(url, dest) {
  logger.info(styleText("cyan", `Adding pages from website ${url}`));

  const pages = await fetchObjects("pages", url);

  logger.info(styleText("gray", `Found ${pages.length} pages`));

  for (const [slug, content] of pageTemplates(pages)) {
    const dir = path.join(dest, slug);
    const file = path.join(dir, "index.njk");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, content);
    logger.info(styleText("green", `Created page ${slug}`));
  }
}

function postTemplates(pages) {
  return pages
    .map(x => [x.slug, { title: x.title.rendered, content: x.content.rendered, date: new Date(x.date) }])
    .map(([slug, { title, content, date }]) => [
        slug,
        `---
title: "${title}"
slug: "${slug}"
date: "${date.toISOString()}"
---
<h1>${title}</h1>
${content}`
      ]
    );
}

async function importPosts(url, dest) {
  logger.info(styleText("cyan", `Adding posts from website ${url}`));

  const posts = await fetchObjects("posts", url);

  logger.info(styleText("gray", `Found ${posts.length} posts`));

  for (const [slug, content] of postTemplates(posts)) {
    await fs.writeFile(path.join(dest, `${slug}.md`), content);
    logger.info(styleText("green", `Created post ${slug}`));
  }
}

/** @typedef {import("@types/gulp")} Undertaker */

export class ImportWPRegistry extends DefaultRegistry {
  constructor(config, pathConfig) {
    super();
    this.config = config;
    this.pathConfig = pathConfig;
    this.args = parseArgs({
      args: process.argv,
      options: {
        pages: { type: "boolean" },
        posts: { type: "boolean" },
        url: { type: "string" }
      }
    }).values;
  }

  /**
   * @param {Undertaker} taker
   */
  init({ task, src, dest }) {
    task("import-wp", async () => {
      if (this.args.pages) {
        const dest = projectPath(this.pathConfig.src, this.pathConfig.html.src);
        await importPages(this.args.url, dest);
      }

      if (this.args.posts) {
        const dest = projectPath(this.pathConfig.src, this.pathConfig.data.src, "posts");
        await fs.mkdir(dest, { recursive: true });
        await importPosts(this.args.url, dest);
      }
    });
  }
}

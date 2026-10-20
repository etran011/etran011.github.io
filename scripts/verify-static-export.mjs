import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const origin = "https://export.invalid";
const pages = (await readdir(root, { recursive: true })).filter(file => file.endsWith(".html"));
for (const required of ["index.html", "404.html", "projects/optionlab/index.html", "projects/platepredict/index.html", "robots.txt", "sitemap.xml", ".nojekyll"]) {
  assert((await stat(path.join(root, required))).isFile(), `Missing export: ${required}`);
}
let references = 0;
for (const file of pages) {
  const html = await readFile(path.join(root, file), "utf8");
  const base = new URL(file.replace(/index\.html$/, ""), `${origin}/`);
  // Validate rendered HTML attributes, not serialized React payload strings.
  for (const tag of html.matchAll(/<(?:a|img|source|script|link)\b[^>]*>/g)) {
    for (const attribute of tag[0].matchAll(/\b(href|src|srcSet|srcset)="([^"]*)"/g)) {
      const values = /srcset/i.test(attribute[1])
        ? attribute[2].split(",").map(candidate => candidate.trim().split(/\s+/)[0])
        : [attribute[2]];
      for (const value of values) {
        const url = new URL(value.replaceAll("&amp;", "&"), base);
        if (url.origin !== origin) continue;
        let target = path.join(root, decodeURIComponent(url.pathname));
        assert(target.startsWith(`${root}/`), `Invalid export path: ${value}`);
        if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
        assert((await stat(target)).isFile(), `Broken reference in ${file}: ${value}`);
        if (url.hash && target.endsWith(".html")) {
          const destination = await readFile(target, "utf8");
          const id = decodeURIComponent(url.hash.slice(1));
          assert(destination.includes(`id="${id}"`), `Missing anchor in ${file}: ${value}`);
        }
        references++;
      }
    }
  }
}
console.log(`Static export verified: ${pages.length} HTML files, ${references} local references, required routes and GitHub Pages assets.`);

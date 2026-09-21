import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const htmlPath = resolve(root, "404.html");
const cssPath = resolve(root, "404.css");
let failed = false;

function fail(message) {
  failed = true;
  console.error(`404 check: ${message}`);
}

for (const path of [htmlPath, cssPath]) {
  if (!existsSync(path)) fail(`missing ${path.endsWith("404.html") ? "404.html" : "404.css"}`);
}

if (!failed) {
  const html = readFileSync(htmlPath, "utf8");
  const css = readFileSync(cssPath, "utf8");

  const requiredHtml = [
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<link rel="canonical" href="https://rclevenger-hm.github.io/portfolio/404.html">',
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta property="og:url" content="https://rclevenger-hm.github.io/portfolio/404.html">',
    'href="/portfolio/404.css"',
    'href="#main"',
    '<main id="main">',
    '<h1 id="error-title">',
    'HTTP 404 · route unavailable',
    'href="/portfolio/"',
    'href="/portfolio/resume/"',
    'href="/portfolio/resume/evidence.html"',
    'href="/portfolio/projects/aws-async-intake/"',
    'href="/portfolio/projects/kafka-oci/"',
  ];
  for (const token of requiredHtml) if (!html.includes(token)) fail(`404.html missing ${token}`);

  const requiredCss = [":focus-visible", "@media(max-width:900px)", "@media(max-width:660px)", "prefers-reduced-motion", "@media print"];
  for (const token of requiredCss) if (!css.includes(token)) fail(`404.css missing ${token}`);

  if ((html.match(/<h1\b/g) ?? []).length !== 1) fail("404.html must contain exactly one h1");
  if ((html.match(/<main\b/g) ?? []).length !== 1) fail("404.html must contain exactly one main landmark");
  if (/<script\b/i.test(html)) fail("404.html must remain script-free");
  if (/\b(?:src|href)=["']http:\/\//i.test(html)) fail("404.html contains an insecure external resource");
  if (/href=["'](?:resume\/|projects\/|404\.css)/i.test(html)) fail("404 recovery assets and routes must be root-relative under /portfolio/ so nested missing URLs recover correctly");

  const bytes = statSync(htmlPath).size + statSync(cssPath).size;
  if (bytes > 24_000) fail(`404 asset budget exceeded: ${bytes}/24000 bytes`);
  else console.log(`404 assets: ${bytes}/24000 bytes`);
}

if (failed) process.exit(1);
console.log("404 recovery check passed");

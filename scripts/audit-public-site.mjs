import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const siteBase = "https://rclevenger-hm.github.io/portfolio/";
const sitePath = new URL(siteBase).pathname;
const ignoredDirectories = new Set([".git", ".github", "_site", "analytics-worker", "node_modules", "scripts"]);
const trackerPatterns = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /analytics\.google\.com/i,
  /hotjar\.com/i,
  /segment\.com/i,
  /cdn\.segment\.com/i,
  /mixpanel\.com/i,
  /amplitude\.com/i,
  /clarity\.ms/i,
];

let failed = false;
let warningCount = 0;
let auditedBytes = 0;
const titles = new Map();
const canonicals = new Map();

function fail(file, message) {
  failed = true;
  console.error(`ERROR ${file}: ${message}`);
}

function warn(file, message) {
  warningCount += 1;
  console.warn(`WARN  ${file}: ${message}`);
}

function walk(directory) {
  const entries = [];
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (item.isDirectory() && ignoredDirectories.has(item.name)) continue;
    const absolute = join(directory, item.name);
    if (item.isDirectory()) entries.push(...walk(absolute));
    else entries.push(absolute);
  }
  return entries;
}

function repoPath(absolute) {
  return relative(root, absolute).split(sep).join("/");
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function tags(source, tagName) {
  return source.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function metaContent(source, key, value) {
  for (const tag of tags(source, "meta")) {
    if ((attr(tag, key) ?? "").toLowerCase() === value.toLowerCase()) return attr(tag, "content") ?? "";
  }
  return "";
}

function linkValue(source, relName) {
  for (const tag of tags(source, "link")) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    if (rel.includes(relName.toLowerCase())) return attr(tag, "href") ?? "";
  }
  return "";
}

function localAssetPath(htmlFile, href) {
  if (!href || /^(?:[a-z]+:)?\/\//i.test(href) || href.startsWith("data:") || href.startsWith("#")) return null;
  const clean = href.split(/[?#]/, 1)[0];
  if (clean.startsWith(sitePath)) return normalize(resolve(root, clean.slice(sitePath.length)));
  return normalize(resolve(dirname(htmlFile), clean));
}

function inspectPage(file) {
  const name = repoPath(file);
  const source = readFileSync(file, "utf8");
  const isAdmin = name.startsWith("admin/");
  auditedBytes += statSync(file).size;

  if (!/^\s*<!doctype html>/i.test(source)) fail(name, "missing HTML doctype");
  const htmlTag = source.match(/<html\b[^>]*>/i)?.[0] ?? "";
  if (!/^en(?:-|$)/i.test(attr(htmlTag, "lang") ?? "")) fail(name, "html lang must identify English content");
  if (!tags(source, "meta").some(tag => (attr(tag, "charset") ?? "").toLowerCase() === "utf-8")) fail(name, "missing UTF-8 charset declaration");
  if (!metaContent(source, "name", "viewport").includes("width=device-width")) fail(name, "missing responsive viewport declaration");

  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  if (!title) fail(name, "missing document title");
  else {
    if (titles.has(title)) fail(name, `duplicates title used by ${titles.get(title)}`);
    titles.set(title, name);
    if (title.length > 80) warn(name, `title is ${title.length} characters; keep search results concise`);
  }

  const description = metaContent(source, "name", "description").trim();
  if (!isAdmin && !description) fail(name, "missing meta description");
  if (description && (description.length < 60 || description.length > 190)) warn(name, `meta description is ${description.length} characters`);

  const robots = metaContent(source, "name", "robots").toLowerCase().replace(/\s/g, "");
  if (isAdmin) {
    if (!robots.includes("noindex")) fail(name, "admin page must remain noindex");
  } else if (robots.includes("noindex")) {
    fail(name, "public page unexpectedly blocks indexing");
  }

  if (!isAdmin) {
    const canonical = linkValue(source, "canonical");
    if (!canonical) fail(name, "missing canonical URL");
    else {
      if (!canonical.startsWith(siteBase)) fail(name, `canonical URL must stay under ${siteBase}`);
      if (canonicals.has(canonical)) fail(name, `duplicates canonical URL used by ${canonicals.get(canonical)}`);
      canonicals.set(canonical, name);
    }

    const ogTitle = metaContent(source, "property", "og:title");
    const ogDescription = metaContent(source, "property", "og:description");
    const ogUrl = metaContent(source, "property", "og:url");
    if (!ogTitle || !ogDescription || !ogUrl) warn(name, "social metadata is incomplete (og:title, og:description, og:url)");
    else if (canonical && ogUrl !== canonical) warn(name, "og:url does not match the canonical URL");
  }

  const mainCount = (source.match(/<main\b/gi) ?? []).length;
  const h1Count = (source.match(/<h1\b/gi) ?? []).length;
  if (!isAdmin && mainCount !== 1) fail(name, `expected exactly one main landmark, found ${mainCount}`);
  if (!isAdmin && h1Count !== 1) fail(name, `expected exactly one h1, found ${h1Count}`);

  const ids = new Set();
  for (const match of source.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    const id = match[1];
    if (ids.has(id)) fail(name, `duplicate id "${id}"`);
    ids.add(id);
  }
  for (const match of source.matchAll(/\baria-labelledby\s*=\s*["']([^"']+)["']/gi)) {
    for (const id of match[1].trim().split(/\s+/)) if (id && !ids.has(id)) fail(name, `aria-labelledby references missing id "${id}"`);
  }

  for (const tag of tags(source, "img")) if (attr(tag, "alt") === null) fail(name, "image is missing alt text");
  for (const tag of tags(source, "iframe")) if (!(attr(tag, "title") ?? "").trim()) fail(name, "iframe is missing a title");
  for (const match of source.matchAll(/\btabindex\s*=\s*["']?(-?\d+)/gi)) if (Number(match[1]) > 0) fail(name, `positive tabindex ${match[1]} disrupts keyboard order`);

  for (const tag of tags(source, "a")) {
    const target = (attr(tag, "target") ?? "").toLowerCase();
    if (target === "_blank") {
      const rel = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
      if (!rel.includes("noopener")) fail(name, "target=_blank link is missing rel=noopener");
    }
  }

  if (!isAdmin) {
    const skipLink = source.match(/<a\b[^>]*href=["']#[^"']+["'][^>]*>[\s\S]*?<\/a>/i)?.[0] ?? "";
    if (!/skip/i.test(skipLink)) warn(name, "no obvious skip link was found");
  }

  for (const tag of tags(source, "script")) {
    const src = attr(tag, "src");
    if (!isAdmin && src && /^(?:https?:)?\/\//i.test(src)) fail(name, `public page loads third-party script ${src}`);
  }

  for (const pattern of trackerPatterns) if (!isAdmin && pattern.test(source)) fail(name, `contains third-party tracking reference matching ${pattern}`);
  for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["'](http:\/\/[^"']+)["']/gi)) fail(name, `uses insecure external resource ${match[1]}`);

  const styleSheets = [];
  for (const tag of tags(source, "link")) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    if (!rel.includes("stylesheet")) continue;
    const href = attr(tag, "href") ?? "";
    const asset = localAssetPath(file, href);
    if (!asset) {
      if (/^(?:https?:)?\/\//i.test(href) && !isAdmin) fail(name, `public page depends on external stylesheet ${href}`);
      continue;
    }
    if (!existsSync(asset)) {
      fail(name, `stylesheet does not exist: ${href}`);
      continue;
    }
    styleSheets.push(asset);
  }

  const uniqueStyles = [...new Set(styleSheets)];
  const cssBytes = uniqueStyles.reduce((sum, asset) => sum + statSync(asset).size, 0);
  const pageBytes = statSync(file).size;
  if (!isAdmin && pageBytes > 32_000) fail(name, `HTML budget exceeded: ${pageBytes}/32000 bytes`);
  if (!isAdmin && cssBytes > 48_000) fail(name, `stylesheet budget exceeded: ${cssBytes}/48000 bytes`);
  if (!isAdmin && pageBytes + cssBytes > 72_000) fail(name, `combined HTML/CSS budget exceeded: ${pageBytes + cssBytes}/72000 bytes`);

  if (!isAdmin && uniqueStyles.length) {
    const css = uniqueStyles.map(asset => readFileSync(asset, "utf8")).join("\n");
    if (!/:focus-visible\b/.test(css)) warn(name, "linked stylesheets do not expose an explicit :focus-visible state");
    if (/(?:animation|transition)\s*:/i.test(css) && !/prefers-reduced-motion/i.test(css)) fail(name, "motion styles exist without prefers-reduced-motion handling");
    for (const pattern of trackerPatterns) if (pattern.test(css)) fail(name, `stylesheet contains tracking reference matching ${pattern}`);
    if (/\@import\s+(?:url\()?['"]?https?:\/\//i.test(css)) fail(name, "stylesheet imports a third-party dependency");
  }
}

const htmlFiles = walk(root).filter(file => file.endsWith(".html"));
if (!htmlFiles.length) {
  console.error("ERROR no HTML pages found");
  process.exit(1);
}

for (const file of htmlFiles) inspectPage(file);

const robotsPath = resolve(root, "robots.txt");
if (!existsSync(robotsPath)) fail("robots.txt", "file is missing");
else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/Sitemap:\s*https:\/\/rclevenger-hm\.github\.io\/portfolio\/sitemap\.xml/i.test(robots)) fail("robots.txt", "canonical sitemap directive is missing");
}

console.log(`Audited ${htmlFiles.length} HTML pages (${auditedBytes} HTML bytes).`);
console.log(`Quality audit completed with ${warningCount} advisory warning${warningCount === 1 ? "" : "s"}.`);
if (failed) process.exit(1);
console.log("public site quality gate passed");

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const htmlPath = resolve(root, "architecture/index.html");
const cssPath = resolve(root, "architecture/architecture.css");
let bad = false;

for (const path of [htmlPath, cssPath]) {
  if (!existsSync(path)) {
    console.error("missing architecture asset", path);
    bad = true;
  }
}

if (!bad) {
  const html = readFileSync(htmlPath, "utf8");
  const css = readFileSync(cssPath, "utf8");

  const requiredHtml = [
    "Architecture Atlas",
    "Skip to main content",
    "id=\"main\"",
    "id=\"aws-intake\"",
    "id=\"kafka-oci\"",
    "id=\"oci-janitor\"",
    "id=\"gamecast\"",
    "role=\"img\"",
    "aria-labelledby=\"aws-title aws-desc\"",
    "aria-labelledby=\"kafka-title kafka-desc\"",
    "aria-labelledby=\"janitor-title janitor-desc\"",
    "aria-labelledby=\"game-title game-desc\"",
    "https://github.com/rclevenger-hm/driver_license_authenticity_lambda",
    "https://github.com/rclevenger-hm/kafka-oci-deployment",
    "https://github.com/rclevenger-hm/oci-ephemeral-resource-janitor",
    "https://github.com/rclevenger-hm/sports-gamecast",
    "The common pattern",
    "Boundary"
  ];

  for (const token of requiredHtml) {
    if (!html.includes(token)) {
      console.error("architecture page missing", token);
      bad = true;
    }
  }

  for (const token of ["focus-visible", "prefers-reduced-motion", "@media print", ".system-grid", ".arch-diagram"]) {
    if (!css.includes(token)) {
      console.error("architecture CSS missing", token);
      bad = true;
    }
  }

  const diagramCount = (html.match(/role="img"/g) || []).length;
  if (diagramCount !== 4) {
    console.error("expected four accessible architecture diagrams, found", diagramCount);
    bad = true;
  }

  const boundaryCount = (html.match(/<dt>Boundary<\/dt>/g) || []).length;
  if (boundaryCount !== 4) {
    console.error("expected four explicit evidence boundaries, found", boundaryCount);
    bad = true;
  }

  if (/<script\s+src=|<img\b/i.test(html)) {
    console.error("architecture atlas should remain dependency-light and self-contained");
    bad = true;
  }

  const bytes = statSync(htmlPath).size + statSync(cssPath).size;
  if (bytes > 50000) {
    console.error("architecture asset budget exceeded", bytes);
    bad = true;
  } else {
    console.log(`architecture assets: ${bytes}/50000 bytes`);
  }
}

if (bad) process.exit(1);
console.log("architecture atlas validation passed");

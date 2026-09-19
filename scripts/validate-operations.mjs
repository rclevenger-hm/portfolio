import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const htmlPath = resolve(root, "operations/index.html");
const cssPath = resolve(root, "operations/operations.css");
const evidencePath = resolve(root, "resume/evidence.html");
let bad = false;

for (const path of [htmlPath, cssPath, evidencePath]) {
  if (!existsSync(path)) {
    console.error("missing operations asset", path);
    bad = true;
  }
}

if (!bad) {
  const html = readFileSync(htmlPath, "utf8");
  const css = readFileSync(cssPath, "utf8");
  const evidence = readFileSync(evidencePath, "utf8");

  const requiredHtml = [
    "Operations & Incident Response",
    "Skip to operations evidence",
    'id="main"',
    'id="triage"',
    "Queue age is rising",
    "Cluster health is degrading",
    "The remote command timed out",
    "A cleanup decision looks wrong",
    "Page on impact",
    "Unknown outcome",
    "Evidence boundary",
    "https://github.com/rclevenger-hm/driver_license_authenticity_lambda/blob/main/terraform/observability.tf",
    "https://github.com/rclevenger-hm/kafka-oci-deployment",
    "https://github.com/rclevenger-hm/oci-hadoop-job-automation/blob/main/docs/OPERATIONS.md",
    "https://github.com/rclevenger-hm/oci-ephemeral-resource-janitor"
  ];

  for (const token of requiredHtml) {
    if (!html.includes(token)) {
      console.error("operations page missing", token);
      bad = true;
    }
  }

  for (const token of ["focus-visible", "prefers-reduced-motion", "@media print", ".triage-grid", ".severity-row"]) {
    if (!css.includes(token)) {
      console.error("operations CSS missing", token);
      bad = true;
    }
  }

  const triageCards = (html.match(/class="triage-card"/g) || []).length;
  if (triageCards !== 4) {
    console.error("expected four incident triage cards, found", triageCards);
    bad = true;
  }

  const severityRows = (html.match(/class="severity-row" role="row"/g) || []).length;
  if (severityRows !== 3) {
    console.error("expected three operational severity rows, found", severityRows);
    bad = true;
  }

  if (!evidence.includes('href="../operations/"')) {
    console.error("reliability evidence map does not link to operations page");
    bad = true;
  }

  if (/<script\s+src=|<img\b/i.test(html)) {
    console.error("operations page should remain dependency-light and text-first");
    bad = true;
  }

  const bytes = statSync(htmlPath).size + statSync(cssPath).size;
  if (bytes > 55000) {
    console.error("operations asset budget exceeded", bytes);
    bad = true;
  } else {
    console.log(`operations assets: ${bytes}/55000 bytes`);
  }
}

if (bad) process.exit(1);
console.log("operations evidence validation passed");

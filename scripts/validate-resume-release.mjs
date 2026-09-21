import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
let bad = false;

const resumePath = resolve(root, "resume/index.html");
const pdfPath = resolve(root, "resume/Roger-Clevenger-Principal-SRE-Resume.pdf");
const profilePath = resolve(root, "data/profile.json");
const llmsPath = resolve(root, "llms.txt");
const sitemapPath = resolve(root, "sitemap.xml");

const resume = readFileSync(resumePath, "utf8");
const pdf = readFileSync(pdfPath);
const llms = readFileSync(llmsPath, "utf8");
const sitemap = readFileSync(sitemapPath, "utf8");
const profile = JSON.parse(readFileSync(profilePath, "utf8"));

const pdfUrl = "https://rclevenger-hm.github.io/portfolio/resume/Roger-Clevenger-Principal-SRE-Resume.pdf";

if (!resume.includes('href="Roger-Clevenger-Principal-SRE-Resume.pdf"')) {
  console.error("resume page does not expose the PDF download");
  bad = true;
}
if (!resume.includes('type="application/pdf"')) {
  console.error("resume page is missing PDF alternate metadata");
  bad = true;
}
if (resume.includes("<span>Current</span>") || resume.includes('"worksFor"')) {
  console.error("resume still presents Oracle as a current employer");
  bad = true;
}
if (!resume.includes("<span>Most recent</span>")) {
  console.error("resume is missing the most-recent role marker");
  bad = true;
}

if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
  console.error("downloadable resume is not a valid PDF payload");
  bad = true;
}
const pdfBytes = statSync(pdfPath).size;
if (pdfBytes < 3_000 || pdfBytes > 250_000) {
  console.error("resume PDF size outside expected bounds", pdfBytes);
  bad = true;
}

if (profile.resumePdfUrl !== pdfUrl) {
  console.error("structured profile is missing the canonical PDF URL");
  bad = true;
}
if (profile.experience?.[0]?.organization !== "Oracle" || profile.experience?.[0]?.era !== "most-recent") {
  console.error("structured experience still reports a stale current-employer state");
  bad = true;
}
if (!llms.includes(`Downloadable resume PDF: ${pdfUrl}`) || llms.includes("Current: Principal Site Reliability Engineer, Oracle")) {
  console.error("plain-text profile is missing the PDF or has stale employment status");
  bad = true;
}
if (!sitemap.includes(`<loc>${pdfUrl}</loc>`)) {
  console.error("sitemap is missing the downloadable resume");
  bad = true;
}

if (bad) process.exit(1);
console.log(`resume release checks passed; PDF size ${pdfBytes} bytes`);

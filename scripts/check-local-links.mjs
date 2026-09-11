import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set(['.git', '_site', 'analytics-worker', 'node_modules']);
let failed = false;
let checked = 0;

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

function localReference(value) {
  const raw = value.trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('/') || raw.includes('__ANALYTICS_API_BASE__')) return null;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(raw)) return null;
  const withoutQuery = raw.split(/[?#]/, 1)[0];
  if (!withoutQuery) return null;
  try {
    return decodeURIComponent(withoutQuery);
  } catch {
    return withoutQuery;
  }
}

function resolves(reference, htmlFile) {
  const target = normalize(resolve(dirname(htmlFile), reference));
  const relativeTarget = relative(root, target);
  if (relativeTarget.startsWith('..') || relativeTarget === '..') return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  if (existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, 'index.html'))) return true;
  return false;
}

for (const htmlFile of walk(root)) {
  const html = readFileSync(htmlFile, 'utf8');
  const source = relative(root, htmlFile);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const reference = localReference(match[1]);
    if (!reference) continue;
    checked += 1;
    if (!resolves(reference, htmlFile)) {
      console.error(`broken local reference in ${source}: ${reference}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`local link integrity passed (${checked} references checked)`);

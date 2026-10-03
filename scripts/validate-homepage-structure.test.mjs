import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateHomepageStructure } from './validate-homepage-structure.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('complete homepage has balanced explicit markup and a footer', () => {
  assert.deepEqual(validateHomepageStructure(html), []);
});

test('rejects the production truncation inside the CI/CD skills paragraph', () => {
  const end = html.indexOf('Python · release') + 'Python · release'.length;
  assert.ok(end > 'Python · release'.length);
  assert.ok(validateHomepageStructure(html.slice(0, end)).length);
});

test('rejects incomplete tail even if only final closing tags are appended', () => {
  const end = html.indexOf('Python · release') + 'Python · release'.length;
  assert.ok(validateHomepageStructure(html.slice(0, end) + '</body></html>').length);
});

test('rejects a missing nested closing tag despite a complete document ending', () => {
  assert.ok(validateHomepageStructure(html.replace('</article>', '')).length);
});

test('ignores comments and raw script contents when balancing tags', () => {
  const extra = '<!-- <div> --><script>const sample = "<article>";</script>';
  assert.deepEqual(validateHomepageStructure(html.replace('</body>', extra + '</body>')), []);
});

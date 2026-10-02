// Check this hand-authored homepage's explicit structure. Browsers repair missing
// end tags, so rendering alone cannot detect a truncated source document.
// This is a completeness guard, not a general-purpose HTML conformance validator.
export function validateHomepageStructure(html) {
  const errors = [];
  if (!/^<!doctype html>/i.test(html.trimStart())) errors.push('missing HTML doctype');
  if (!/<\/body>\s*<\/html>\s*$/i.test(html)) errors.push('missing final body/html closing tags');
  if (!/<footer\b[^>]*class="site-footer"/i.test(html)) errors.push('missing site footer');

  const source = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const stack = [];
  for (const match of source.matchAll(/<\/?([a-z][a-z0-9-]*)\b(?:"[^"]*"|'[^']*'|[^'">])*?>/gi)) {
    const tag = match[1].toLowerCase();
    if (voidTags.has(tag)) continue;
    if (match[0].startsWith('</')) {
      const expected = stack.pop();
      if (expected !== tag) errors.push(`unexpected closing </${tag}>; expected </${expected ?? 'none'}>`);
    } else {
      stack.push(tag);
    }
  }
  if (stack.length) errors.push(`unclosed elements: ${stack.join(', ')}`);
  return errors;
}

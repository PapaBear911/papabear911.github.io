#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';

const ROOT = process.cwd();
const failures = [];
const knownBaseline = [];

function check(name, fn) {
  let ok = true, msg = '';
  try { const r = fn(); if (r !== true) { ok = false; msg = r || ''; } }
  catch (e) { ok = false; msg = e.message; }
  return { name, ok, msg };
}

function readFile(p) { return readFileSync(p, 'utf8'); }
function exists(p) { try { statSync(p); return true; } catch { return false; } }

const html = readFile('index.html');
const css = ''; // CSS is inline in index.html
const jsMain = exists('js/main.js') ? readFile('js/main.js') : '';
const jsSize = exists('js/main.js') ? statSync('js/main.js').size : 0;

const checks = [];

// 1. skip link present
checks.push(check('skip-link-present', () => html.includes('class="skip"') && html.includes('href="#main"') ? true : 'skip link missing'));

// 2. all img have alt+width+height
checks.push(check('img-alt-dims', () => {
  const imgs = html.match(/<img[^>]*>/g) || [];
  for (const img of imgs) {
    if (!/\salt=/.test(img)) return `img missing alt: ${img.slice(0,60)}`;
    if (!/\swidth=/.test(img)) return `img missing width: ${img.slice(0,60)}`;
    if (!/\sheight=/.test(img)) return `img missing height: ${img.slice(0,60)}`;
  }
  return true;
}));

// 3. no transition: all
checks.push(check('no-transition-all', () => /transition:\s*all/.test(html) ? 'transition: all found' : true));

// 4. no outline: none
checks.push(check('no-outline-none', () => /outline:\s*none/.test(html) ? 'outline: none found' : true));

// 5. token block present
checks.push(check('token-block-present', () => /:root\s*\{/.test(html) ? true : ':root token block missing'));

// 6. no hero-eyebrow class
checks.push(check('no-hero-eyebrow', () => /hero-eyebrow/.test(html) ? 'hero-eyebrow still present' : true));

// 7. no inter / space grotesk font reference
checks.push(check('no-overused-fonts', () => /\b(Inter|Space Grotesk)\b/i.test(html.replace(/IntersectionObserver/g,'')) ? 'overused font ref found' : true));

// 8. color-scheme present
checks.push(check('color-scheme-present', () => /color-scheme/.test(html) ? true : 'color-scheme missing'));

// 9. scroll-padding-top present
checks.push(check('scroll-padding-top', () => /scroll-padding-top/.test(html) ? true : 'scroll-padding-top missing'));

// 10. no inline script (except the early class-add + json-ld)
checks.push(check('no-inline-script-body', () => {
  const scripts = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g) || [];
  const offenders = scripts.filter(s => !s.includes('application/ld+json') && !s.includes("classList.add('js')"));
  return offenders.length === 0 ? true : `${offenders.length} inline script(s) found`;
}));

// 11. js size budget
checks.push(check('js-size-budget', () => jsSize <= 200 * 1024 ? true : `js/main.js is ${jsSize} bytes (>200KB)`));

// 12. reduced-motion handling present in css
checks.push(check('reduced-motion-css', () => /prefers-reduced-motion:\s*reduce/.test(html) ? true : 'reduced-motion media query missing'));

// 13. canvas aria-hidden (if any canvas)
checks.push(check('canvas-aria-hidden', () => {
  if (!/<canvas/.test(html + jsMain)) return true;
  return /aria-hidden="true"/.test(html + jsMain) ? true : 'canvas missing aria-hidden';
}));

// 14. no backdrop-filter
checks.push(check('no-backdrop-filter', () => /backdrop-filter/.test(html) ? 'backdrop-filter found' : true));

// 15. no transition: all in js
checks.push(check('no-transition-all-js', () => /transition:\s*all/.test(jsMain) ? 'transition: all in js' : true));

// 16. Hallmark stamp is the first non-empty CSS line
checks.push(check('hallmark-stamp', () => {
  const style = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!style) return 'no <style> block found';
  const firstLine = style[1].split('\n').map(l => l.trim()).find(Boolean) || '';
  return /^\/\* Hallmark · .+ \*\/$/.test(firstLine) ? true : `first CSS line is not a Hallmark stamp: ${firstLine.slice(0,60)}`;
}));

// 17. overflow-x: clip on both html and body
checks.push(check('overflow-x-clip', () => {
  const htmlRule = html.match(/html\s*\{([^}]*)\}/);
  const bodyRule = html.match(/body\s*\{([^}]*)\}/);
  if (!htmlRule || !/overflow-x:\s*clip/.test(htmlRule[1])) return 'html lacks overflow-x: clip';
  if (!bodyRule || !/overflow-x:\s*clip/.test(bodyRule[1])) return 'body lacks overflow-x: clip';
  return true;
}));

// 18. no literal colour values outside :root token blocks
checks.push(check('colors-in-tokens', () => {
  const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  // Strip token blocks (:root and media-scoped :root variants) and comments
  const withoutTokens = style.replace(/:root[^{]*\{[^}]*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const literal = /#(?:[0-9a-fA-F]{3,8})\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/g;
  const m = withoutTokens.match(literal);
  return m ? `literal colour(s) outside tokens: ${m.slice(0,5).join(', ')}` : true;
}));

// 19. no middle-dot meta separators in visible copy
checks.push(check('no-middle-dot-meta', () => {
  const body = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  return body.includes('·') ? 'middle-dot separator found in copy' : true;
}));

let pass = 0, fail = 0;
for (const c of checks) {
  if (c.ok) { pass++; console.log(`PASS  ${c.name}`); }
  else { fail++; console.log(`FAIL  ${c.name}: ${c.msg}`); }
}
console.log(`\n${pass} passed, ${fail} failed (total ${checks.length})`);
process.exit(fail > 0 ? 1 : 0);

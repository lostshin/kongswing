import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const index = readFileSync('dist/index.html', 'utf8');
const vocabulary = readFileSync('dist/vocabulary.html', 'utf8');
const events = readFileSync('dist/events.html', 'utf8');

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'));
  return match?.[1] || '';
}

function navHrefs(source) {
  const menu = source.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] || '';
  return [...menu.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
}

assert.ok(
  existsSync('public/fonts/iansui/Iansui-Regular.ttf'),
  'Iansui font file should be bundled locally so POJ/Tai-lo glyphs do not depend on Google Fonts subsetting',
);
assert.ok(
  existsSync('public/fonts/gochi-hand-poj/GochiHandPOJ-Regular.ttf'),
  'GochiHandPOJ font file should be bundled locally for English language text',
);

for (const [name, source] of Object.entries({ index, vocabulary, events })) {
  assert.match(source, /@font-face\s*\{[^}]*font-family:\s*['"]IansuiLocal['"][^}]*Iansui-Regular\.ttf/s, `${name} should define local Iansui @font-face`);
  assert.match(source, /@font-face\s*\{[^}]*font-family:\s*['"]GochiHandPOJ['"][^}]*GochiHandPOJ-Regular\.ttf/s, `${name} should define local GochiHandPOJ @font-face`);
  assert.match(source, /--tai:\s*'IansuiLocal'/, `${name} should route Taiwanese text through local Iansui`);
  assert.match(source, /--poj:\s*'IansuiLocal'/, `${name} should route romanization through local Iansui`);
  assert.match(source, /--en:\s*'GochiHandPOJ'/, `${name} should expose GochiHandPOJ as the English font token`);
  assert.match(source, /\.lang-en\b[^}]*font-family:\s*var\(--en\)/s, `${name} should apply GochiHandPOJ to English language spans`);
}

assert.match(cssBlock(index, '.nav-cta'), /color:\s*var\(--paper\)/, 'nav CTA should apply the same text color to every language variant');

assert.doesNotMatch(cssBlock(index, '.nav-links'), /position:\s*fixed/, 'mobile nav sheet should not use fixed positioning inside sticky nav');
assert.match(index, /\.nav-menu\b/, 'mobile nav should use a dedicated menu wrapper instead of overloading the desktop link row');

for (const [name, source] of Object.entries({ index, vocabulary, events })) {
  assert.match(source, /@view-transition\s*\{[^}]*navigation:\s*auto/s, `${name} should opt into same-origin page transitions`);
  assert.match(source, /rel="prefetch" href="(?:vocabulary|events|index)\.html"/, `${name} should prefetch likely cross-page navigation targets`);
  assert.match(source, /--content-max:\s*1280px/, `${name} should keep the wider desktop content width`);
  assert.match(cssBlock(source, '.wrap'), /max-width:\s*var\(--content-max\)/, `${name} .wrap should use the desktop content token`);
  assert.match(cssBlock(source, '.nav-inner'), /max-width:\s*var\(--content-max\)/, `${name} nav should align to the same desktop content width`);
}

assert.deepEqual(
  navHrefs(index),
  ['#about', '#vocab', 'vocabulary.html', '#events', 'events.html', '#faq', '#contact'],
  'home top menu should expose all core destinations',
);
assert.deepEqual(
  navHrefs(vocabulary),
  ['index.html#about', 'index.html#vocab', 'vocabulary.html', 'index.html#events', 'events.html', 'index.html#faq', 'index.html#contact'],
  'vocabulary top menu should match the home menu destinations',
);
assert.deepEqual(
  navHrefs(events),
  ['index.html#about', 'index.html#vocab', 'vocabulary.html', 'index.html#events', 'events.html', 'index.html#faq', 'index.html#contact'],
  'events top menu should match the home menu destinations',
);

assert.match(cssBlock(index, 'html'), /scroll-behavior:\s*smooth/, 'home page should smooth-scroll same-page anchor jumps');
assert.match(cssBlock(index, '.hero h1 .title-line'), /white-space:\s*nowrap/, 'home hero should keep jump, 跳, and Swing on the same line');
assert.match(index, /sessionStorage\.getItem\('kts-smooth-target'\)/, 'home page should consume queued smooth-scroll targets from subpages');
for (const [name, source] of Object.entries({ vocabulary, events })) {
  assert.match(source, /sessionStorage\.setItem\('kts-smooth-target', 'contact'\)/, `${name} should queue contact smooth-scroll before returning home`);
}

console.log('site regression checks passed');

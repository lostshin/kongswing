import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const pages = {
  index: readFileSync('dist/index.html', 'utf8'),
  about: readFileSync('dist/about.html', 'utf8'),
  daily: readFileSync('dist/daily.html', 'utf8'),
  vocabulary: readFileSync('dist/vocabulary.html', 'utf8'),
  events: readFileSync('dist/events.html', 'utf8'),
  faq: readFileSync('dist/faq.html', 'utf8'),
  contact: readFileSync('dist/contact.html', 'utf8'),
};

const sharedUiComponents = [
  'src/components/PageHero.astro',
  'src/components/SectionHeader.astro',
  'src/components/ButtonLink.astro',
  'src/components/StatGrid.astro',
  'src/components/InfoCardGrid.astro',
  'src/components/ContactForm.astro',
  'src/components/ContactChannels.astro',
];

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
assert.ok(
  existsSync('public/logo.png'),
  'brand logo should exist at public/logo.png because Nav and metadata reference /logo.png',
);
assert.ok(
  existsSync('public/rabbit-run-sprite.png'),
  'running rabbit sprite should exist as a project asset for the home page animation',
);

for (const file of sharedUiComponents) {
  assert.ok(existsSync(file), `${file} should exist so repeated page UI is shared instead of duplicated inline`);
}

for (const [name, source] of Object.entries(pages)) {
  assert.match(source, /@font-face\s*\{[^}]*font-family:\s*['"]IansuiLocal['"][^}]*Iansui-Regular\.ttf/s, `${name} should define local Iansui @font-face`);
  assert.match(source, /@font-face\s*\{[^}]*font-family:\s*['"]GochiHandPOJ['"][^}]*GochiHandPOJ-Regular\.ttf/s, `${name} should define local GochiHandPOJ @font-face`);
  assert.match(source, /--tai:\s*'IansuiLocal'/, `${name} should route Taiwanese text through local Iansui`);
  assert.match(source, /--poj:\s*'IansuiLocal'/, `${name} should route romanization through local Iansui`);
  assert.match(source, /--en:\s*'GochiHandPOJ'/, `${name} should expose GochiHandPOJ as the English font token`);
  assert.match(source, /\.lang-en\b[^}]*font-family:\s*var\(--en\)/s, `${name} should apply GochiHandPOJ to English language spans`);
}

assert.match(cssBlock(pages.index, '.nav-cta'), /color:\s*var\(--paper\)/, 'nav CTA should apply the same text color to every language variant');

assert.doesNotMatch(cssBlock(pages.index, '.nav-links'), /position:\s*fixed/, 'mobile nav sheet should not use fixed positioning inside sticky nav');
assert.match(pages.index, /\.nav-menu\b/, 'mobile nav should use a dedicated menu wrapper instead of overloading the desktop link row');

for (const [name, source] of Object.entries(pages)) {
  assert.match(source, /@view-transition\s*\{[^}]*navigation:\s*auto/s, `${name} should opt into same-origin page transitions`);
  assert.match(source, /rel="prefetch" href="(?:vocabulary|events|index)\.html"/, `${name} should prefetch likely cross-page navigation targets`);
  assert.match(source, /--content-max:\s*1280px/, `${name} should keep the wider desktop content width`);
  assert.match(cssBlock(source, '.wrap'), /max-width:\s*var\(--content-max\)/, `${name} .wrap should use the desktop content token`);
  assert.match(cssBlock(source, '.nav-inner'), /max-width:\s*var\(--content-max\)/, `${name} nav should align to the same desktop content width`);
  assert.match(source, /id="lang-sw"/, `${name} should expose the language switcher`);
  assert.match(source, /\.page-hero\b/, `${name} should include shared page hero styles from global.css`);
  assert.match(source, /\.ui-btn\b/, `${name} should include shared button styles from global.css`);
  assert.match(source, /class="brand-mark"[^>]*><img src="logo\.png"/, `${name} nav logo should use a flat-file-safe relative asset path`);
  assert.match(cssBlock(source, 'main#main'), /margin-top:\s*var\(--main-nav-gap\)/, `${name} main content should be visually separated from sticky nav`);
  assert.match(cssBlock(source, 'main#main'), /scroll-margin-top:\s*calc\(var\(--nav-height\) \+ var\(--main-nav-gap\)\)/, `${name} #main scroll target should not hide under sticky nav`);
  assert.match(cssBlock(source, '.brand-mark img'), /object-fit:\s*cover/, `${name} nav logo should have explicit object-fit so it renders reliably inside the circular mark`);
}

const expectedNav = ['index.html', 'about.html', 'daily.html', 'vocabulary.html', 'events.html', 'faq.html', 'contact.html'];
for (const name of Object.keys(pages)) {
  assert.deepEqual(navHrefs(pages[name]), expectedNav, `${name} nav should match unified order`);
}

assert.match(cssBlock(pages.index, 'html'), /scroll-behavior:\s*smooth/, 'home page should smooth-scroll same-page anchor jumps');
assert.match(cssBlock(pages.index, '.hero h1 .title-line'), /white-space:\s*nowrap/, 'home hero should keep jump, 跳, and Swing on the same line');
assert.match(cssBlock(pages.index, '.hero h1 .title-line'), /margin-top:\s*\.16em/, 'home hero should keep a little air between Kóng 台語 and 跳 Swing');
assert.match(pages.index, /@media \(max-width:820px\)\{[\s\S]*?\.hero-art\{display:none\}/, 'mobile home hero should hide the desktop artwork so stickers cannot overlap the CTA or ticker');
assert.match(pages.index, /@media \(max-width:420px\)\{[\s\S]*?\.hero h1 \.title-line\{white-space:normal\}/, 'very narrow phones should allow the hero title line to wrap');
assert.match(pages.index, /rabbit-run-sprite\.png/, 'home page should render the generated running rabbit sprite');
assert.match(pages.index, /animation:\s*rabbitRun\b[^;]*steps\(8\)/, 'running rabbit should use an eight-frame stepped sprite animation');
assert.match(pages.index, /@keyframes rabbitRun\{from\{transform:translateX\(0\)\}to\{transform:translateX\(-100%\)\}\}/, 'running rabbit keyframes should traverse every sprite frame');
assert.match(pages.index, /sessionStorage\.getItem\('kts-smooth-target'\)/, 'home page should consume queued smooth-scroll targets from subpages');
assert.match(pages.index, /querySelectorAll\('\.nav-links a\[href\$="\.html"\]'\)/, 'nav links should queue a smooth-scroll target before cross-page navigation');

assert.match(pages.contact, /id="contact-form"/, 'contact page should preserve the contact form id used by the submit handler');
assert.match(pages.contact, /class="contact-form"/, 'contact page should use the shared contact form shell');

console.log('site regression checks passed');

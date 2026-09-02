/* Functional test for the theme engine — runs the real index.html + real
   js/themes.js inside jsdom. No browser required. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', 'public');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost:3000/',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const { window } = dom;
const doc = window.document;

/* --- minimal browser API stubs jsdom lacks --- */
window.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
window.CustomEvent = window.CustomEvent || function (t, o) { const e = doc.createEvent('CustomEvent'); e.initCustomEvent(t, !!(o && o.bubbles), !!(o && o.cancelable), o && o.detail); return e; };
const appendedFonts = [];
const realAppend = window.HTMLHeadElement.prototype.appendChild;
window.HTMLHeadElement.prototype.appendChild = function (node) {
  if (node && node.tagName === 'LINK') appendedFonts.push(node.href);
  return realAppend.call(this, node);
};

// jsdom persists localStorage to ~/.config/jsdom across runs — start clean so
// the "first visit" assertions really describe a first visit.
window.localStorage.clear();

let failures = 0;
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

/* --- load the real scripts in page order ---
   jsdom gives each window.eval() its own lexical scope, so `const Themes` from
   one call is invisible to the next. In a browser all classic scripts share one
   global lexical environment. We emulate that by evaluating them together and
   re-exposing the bindings on window, exactly like a real page would see them. */
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
window.eval([
  src('js/themes.js'),                                 // boots from <head>
  src('js/playlists-data.js'),
  src('js/modals.js'),
  'window.Themes = Themes;',
  'window.PLAYLISTS = PLAYLISTS;',
  'window.Modals = Modals;',
  'window.$ = $;'
].join('\n;'));
ok('boot() applies the default skin before DOM ready',
  doc.documentElement.getAttribute('data-theme') === 'retro' &&
  doc.documentElement.getAttribute('data-theme-mode') === 'dark');

window.Themes.init();                                  // what app.js does on DOMContentLoaded

/* --- switcher UI --- */
const panel = doc.querySelector('#themePanel');
ok('theme panel is injected', !!panel);
const cards = [...doc.querySelectorAll('.theme-card')];
ok('all 7 skins are listed', cards.length === 7, cards.map(c => c.dataset.themeId).join(', '));
ok('switcher button exists in the topbar', !!doc.querySelector('#themeBtn'));
ok('texture overlay is present', !!doc.querySelector('.fx-overlay .fx-vignette'));
ok('theme swatches render with real colors', cards.every(c => !c.innerHTML.includes('undefined')));

const activeCard = () => doc.querySelector('.theme-card.active');
ok('Retro Gold starts selected', activeCard() && activeCard().dataset.themeId === 'retro');
ok('theme pill shows the active theme name', doc.querySelector('#themePillName') && doc.querySelector('#themePillName').textContent === 'Retro Gold');
ok('top nav theme badge mirrors the current theme', doc.querySelector('#navThemeBadge') && /Retro Gold/.test(doc.querySelector('#navThemeBadge').textContent));

ok('the default skin fetches no extra webfonts', appendedFonts.length === 0, appendedFonts.join(' | ') || 'none fetched');

/* --- picking a theme --- */
let event = null;
doc.addEventListener('tcs:themechange', (e) => { event = e.detail; });

const synth = cards.find(c => c.dataset.themeId === 'synthwave');
synth.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok('clicking Synthwave repaints <html>', doc.documentElement.getAttribute('data-theme') === 'synthwave');
ok('light/dark mode flag follows the skin', doc.documentElement.getAttribute('data-theme-mode') === 'dark');
ok('theme-color meta is retuned', doc.querySelector('meta[name="theme-color"]').getAttribute('content') === '#0c0020');
ok('Synthwave lazy-loads its own faces once', appendedFonts.length === 1 && /family=Bungee/.test(appendedFonts[0]), appendedFonts.join(' | '));
ok('choice is persisted', window.localStorage.getItem('tcs_theme') === 'synthwave');
ok('tcs:themechange fired', event && event.theme === 'synthwave');
ok('panel closes after picking', panel.hidden === true);
ok('selected card is marked', activeCard().dataset.themeId === 'synthwave');
ok('theme pill updates after switching skins', doc.querySelector('#themePillName').textContent === "Synthwave '84");
ok('nav theme badge updates after switching skins', /Synthwave '84/.test(doc.querySelector('#navThemeBadge').textContent));

/* --- light skin --- */
const poster = cards.find(c => c.dataset.themeId === 'poster');
poster.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok('Old Poster flips to light mode', doc.documentElement.getAttribute('data-theme-mode') === 'light');
ok('theme fonts are lazy-loaded on first use', appendedFonts.length === 2 && /family=Bungee/.test(appendedFonts[0]) && /family=Yatra\+One/.test(appendedFonts[1]), appendedFonts.join(' | '));

/* --- station auto tint --- */
window.eval('Themes.apply("retro")');
const pl = window.PLAYLISTS.monsoon;
window.eval(`Themes.setStationAccent(${JSON.stringify(pl.accent)}, ${JSON.stringify(pl.glow)}, "monsoon")`);
const rootStyle = doc.documentElement.getAttribute('style') || '';
ok('Station Auto tints --accent-rgb on :root', /--accent-rgb:\s*110, 168, 255/.test(rootStyle), rootStyle.trim());
ok('Station Auto sets the hero glow', /--pl-glow/.test(rootStyle));

window.eval('Themes.setAuto(false)');
const after = doc.documentElement.getAttribute('style') || '';
ok('turning Station Auto off clears the inline tint', !/--accent-rgb/.test(after), after.trim());
ok('Station Auto preference is stored', window.localStorage.getItem('tcs_theme_auto') === '0');

window.eval('Themes.setAuto(true)');
ok('Station Auto re-applies the tint', /--accent-rgb/.test(doc.documentElement.getAttribute('style') || ''));

/* --- cycling + keyboard shortcut wiring --- */
const order = window.eval('Themes.THEMES.map(t => t.id)');
window.eval('Themes.apply("retro")');
window.eval('Themes.cycle(1)');
ok('cycle(1) advances to the next skin', window.eval('Themes.current()') === order[1]);
window.eval('Themes.cycle(-1)');
ok('cycle(-1) steps back', window.eval('Themes.current()') === 'retro');

/* --- ?theme= deep link --- */
const dom2 = new JSDOM(html, { url: 'http://localhost:3000/?theme=phosphor', runScripts: 'outside-only', pretendToBeVisual: true });
dom2.window.matchMedia = window.matchMedia;
dom2.window.localStorage.clear();
dom2.window.eval(src('js/themes.js') + '\n;window.T = Themes;');
ok('?theme=phosphor deep link works', dom2.window.document.documentElement.getAttribute('data-theme') === 'phosphor');

/* --- unknown / corrupted storage falls back safely --- */
window.localStorage.setItem('tcs_theme', 'not-a-real-theme');
const dom3 = new JSDOM(html, { url: 'http://localhost:3000/', runScripts: 'outside-only', pretendToBeVisual: true });
dom3.window.matchMedia = window.matchMedia;
dom3.window.eval(src('js/themes.js') + '\n;window.T = Themes;');
ok('garbage in localStorage falls back to Retro Gold', dom3.window.document.documentElement.getAttribute('data-theme') === 'retro');

/* --- every declared skin has a matching CSS block --- */
const themesCss = fs.readFileSync(path.join(ROOT, 'css/themes.css'), 'utf8');
const missingCss = order.filter(id => id !== 'retro' && !themesCss.includes(`:root[data-theme="${id}"]`));
ok('every registry entry has a CSS block', missingCss.length === 0, missingCss.join(', '));

console.log(failures === 0 ? '\n✓ all theme-engine tests passed' : `\n✗ ${failures} failure(s)`);
process.exit(failures ? 1 : 0);

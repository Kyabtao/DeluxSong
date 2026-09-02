/* Functional test for the 🌧️ Baarish? button — runs the real index.html +
   real js/rain-ambient.js + js/rain-visual.js + js/app.js inside jsdom with
   lightweight stubs. Also asserts the theme switcher is fully removed. */
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

window.localStorage.clear();
// non-invoking rAF keeps the canvas animation loop parked inside jsdom
window.requestAnimationFrame = () => 1;
window.cancelAnimationFrame = () => {};
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q }));

/* jsdom ships no canvas implementation — stub just enough 2D context for
   RainVisual (it only needs the plain drawing ops below) */
const ctx2d = {
  fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '',
  setTransform() {}, clearRect() {}, fillRect() {},
  beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, ellipse() {}, arc() {}
};
window.HTMLCanvasElement.prototype.getContext = function () { return ctx2d; };

/* WebAudio stub strong enough for RainAmbient.makeRain() */
function param() {
  return {
    value: 0,
    setValueAtTime() {},
    setTargetAtTime() {},
    exponentialRampToValueAtTime() {},
    linearRampToValueAtTime() {}
  };
}
window.AudioContext = function () {
  this.sampleRate = 44100;
  this.state = 'running';
  this.currentTime = 0;
  this.destination = {};
  this.resume = () => {};
  this.createBuffer = (_ch, len) => ({ getChannelData: () => new window.Float32Array(len) });
  this.createBufferSource = () => ({ buffer: null, loop: false, connect() {}, start() {}, stop() {} });
  this.createBiquadFilter = () => ({ type: '', frequency: param(), connect() {} });
  this.createGain = () => ({ gain: param(), connect() {} });
  this.createOscillator = () => ({ type: '', frequency: param(), connect() {}, start() {}, stop() {} });
};

window.BackgroundAudio = {
  init() {}, setupActionHandlers() {}, updateMediaSession() {},
  setPlaybackState() {}, setPositionState() {}
};
window.Modals = { init() {}, toast() {} };
window.YT = {
  Player: function () {},
  PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, CUED: 5 }
};
window.Image = class FakeImage {
  set src(v) {
    this._src = v;
    if (typeof this.onload === 'function') this.onload();
  }
  get src() { return this._src; }
};

let failures = 0;
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
window.eval([
  src('js/playlists-data.js'),
  src('js/rain-ambient.js'),
  src('js/rain-visual.js'),
  src('js/player.js'),
  src('js/app.js'),
  'window.RainAmbient = RainAmbient;',
  'window.RainVisual = RainVisual;'
].join('\n;'));

// app.js waits for DOMContentLoaded — the document is already parsed, so re-fire
doc.dispatchEvent(new window.Event('DOMContentLoaded'));

/* --- theme switcher is fully removed --- */
ok('theme button removed from the top bar', !doc.querySelector('#themeBtn'));
ok('theme badge removed from the nav status', !doc.querySelector('#navThemeBadge'));
ok('theme engine script is not referenced', !html.includes('js/themes.js'));

/* --- clicking Baarish? makes it rain on the website --- */
ok('rain canvas exists in the page', !!doc.querySelector('#rainCanvas'));

const rainBtn = doc.querySelector('#rainBtn');
rainBtn.click();
ok('baarish button switches to the on state', rainBtn.classList.contains('on'));
ok('baarish volume row is revealed', doc.querySelector('#rainRow').hidden === false);
ok('on-screen rain overlay switches on', doc.querySelector('#rainCanvas').classList.contains('rain-on'));
ok('RainVisual reports running', window.RainVisual.isOn() === true);
ok('RainAmbient is audible', window.RainAmbient.isPlaying() === true);

/* --- the volume slider also drives the visual downpour --- */
const vol = doc.querySelector('#rainVol');
vol.value = '80';
vol.dispatchEvent(new window.Event('input', { bubbles: true }));
ok('volume change keeps the downpour on', window.RainVisual.isOn() === true);

/* --- toggling off stops the weather --- */
rainBtn.click();
ok('baarish button switches off', !rainBtn.classList.contains('on'));
ok('on-screen rain overlay switches off', !doc.querySelector('#rainCanvas').classList.contains('rain-on'));
ok('RainVisual reports stopped', window.RainVisual.isOn() === false);
ok('RainAmbient is silent', window.RainAmbient.isPlaying() === false);

/* --- stray thunder event while idle must not crash --- */
window.dispatchEvent(new window.Event('tcs:thunder'));
ok('thunder event while idle is harmless', true);

console.log(failures === 0 ? '\n✓ rain UI tests passed' : `\n✗ ${failures} failure(s)`);
process.exit(failures ? 1 : 0);

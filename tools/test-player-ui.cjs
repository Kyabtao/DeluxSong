/* Functional test for playlist switching and drawer sync — runs the real
   index.html + real js/player.js inside jsdom with lightweight stubs. */
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
window.requestAnimationFrame = window.requestAnimationFrame || ((cb) => cb());
/* A stub rich enough to report a real transport state. The old empty stub
   never fired onReady/onStateChange, so nothing below the click handlers was
   ever exercised — the deck's spin hooks and seek fill went untested.

   `autoplay.allowed` models the browser: when false, loadVideoById/playVideo
   refuse to start audible media exactly as Chrome/Safari/Firefox do before a
   user gesture, and only a muted playVideo() gets through. */
function installStubs(win, autoplay) {
  win.__autoplay = autoplay;
  win.BackgroundAudio = {
    setupActionHandlers() {},
    updateMediaSession() {},
    setPlaybackState() {},
    setPositionState() {}
  };
  win.Modals = { toast() {} };
  win.YT = {
    Player: function (el, opts) {
      this._opts = opts;
      this._state = -1;
      opts.events.onReady({ target: this });
    },
    PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }
  };
  win.YT.Player.prototype = {
    _emit(state) {
      this._state = state;
      this._opts.events.onStateChange({ target: this, data: state });
    },
    // An audible start only happens when the browser allows it; a muted start
    // always does. Either way the call is recorded so tests can see the ask.
    _tryStart() {
      autoplay.attempts++;
      if (autoplay.allowed || autoplay.muted) this._emit(1);
    },
    playVideo() { this._tryStart(); },
    loadVideoById() { this._tryStart(); },
    pauseVideo() { this._emit(2); },
    getPlayerState() { return this._state; },
    getDuration() { return 252; },
    getCurrentTime() { return 63; },
    seekTo() {},
    setVolume() {},
    mute() { autoplay.muted = true; },
    unMute() { autoplay.muted = false; },
    cueVideoById() {}
  };
}

installStubs(window, { allowed: false, muted: false, attempts: 0 });
window.Image = class FakeImage {
  set src(v) {
    this._src = v;
    if (typeof this.onload === 'function') this.onload();
  }
  get src() {
    return this._src;
  }
};

let failures = 0;
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
window.eval([
  src('js/playlists-data.js'),
  src('js/player.js'),
  'window.PLAYLISTS = PLAYLISTS;',
  'window.PlayerEngine = PlayerEngine;',
  'window.$ = $;'
].join('\n;'));

window.PlayerEngine.init();

ok('top-bar now-on-air status is removed',
  !doc.querySelector('.nav-status'));
ok('drawer tabs are built for every playlist',
  doc.querySelectorAll('.drawer-tab').length === Object.keys(window.PLAYLISTS).length,
  `${doc.querySelectorAll('.drawer-tab').length} tabs`);
ok('player controls are visible and mounted from the start',
  !doc.querySelector('#player').classList.contains('player-controls-pending') &&
  doc.querySelectorAll('#player .controls button').length > 0);
ok('player reveal hint message is removed',
  !doc.querySelector('#playerHint'));
ok('playlist launcher message is removed',
  !doc.querySelector('#playlistBtn') && !doc.querySelector('.playlist-launcher'));

doc.querySelector('#listBtn').click();
ok('the player ☰ button opens the playlist sidebar',
  doc.querySelector('#drawer').classList.contains('open') &&
  doc.querySelector('#drawer').getAttribute('aria-hidden') === 'false');
doc.querySelector('#drawerClose').click();
ok('the sidebar ✕ button closes the playlist sidebar',
  !doc.querySelector('#drawer').classList.contains('open'));

const supportSection = doc.querySelector('.support-actions');
ok('Support Us and Add / Remove buttons share the pre-footer strip',
  !!supportSection &&
  !!supportSection.querySelector('#supportBtn') &&
  !!supportSection.querySelector('#requestFooterLink'),
  supportSection ? 'support-actions strip present' : 'support-actions strip missing');

/* --- FAQ: static content, current answers, nothing blocking the page --- */
const faqItems = doc.querySelectorAll('#acc details');
ok('FAQ ships static content (never missing, even without JavaScript)',
  faqItems.length >= 6, `${faqItems.length} questions`);
ok('FAQ answers match the current UI (no removed launcher / hidden buttons)',
  ![...faqItems].some((d) =>
    d.textContent.includes('📻 Choose a playlist') ||
    d.textContent.includes('buttons appear as soon as you choose a song')));
ok('YouTube API loads asynchronously and cannot block the page',
  !html.includes('src="https://www.youtube.com/iframe_api"') &&
  src('js/player.js').includes('iframe_api'));

window.PlayerEngine.switchPlaylist('monsoon', false);
ok('switchPlaylist keeps the top-bar status removed',
  !doc.querySelector('.nav-status'));
ok('switchPlaylist updates the drawer heading',
  doc.querySelector('#drawerStnLabel').textContent === 'Monsoon (90s)');
ok('switchPlaylist updates the hero station buttons',
  doc.querySelector('.station-btn.active') && doc.querySelector('.station-btn.active').dataset.playlist === 'monsoon');
ok('switchPlaylist refreshes the sidebar track list',
  doc.querySelectorAll('#tracks li').length === window.PLAYLISTS.monsoon.tracks.length,
  `${doc.querySelectorAll('#tracks li').length} tracks`);

const latestTab = doc.querySelector('.drawer-tab[data-filter="latest"]');
latestTab.click();
ok('clicking a drawer tab switches the live station',
  doc.querySelector('.station-btn.active') && doc.querySelector('.station-btn.active').dataset.playlist === 'latest');
ok('clicking a drawer tab updates the sidebar heading',
  doc.querySelector('#drawerStnLabel').textContent === 'Latest Hits');
ok('clicking a drawer tab refreshes the sidebar track list',
  doc.querySelectorAll('#tracks li').length === window.PLAYLISTS.latest.tracks.length,
  `${doc.querySelectorAll('#tracks li').length} tracks`);

const firstLatestTrack = window.PLAYLISTS.latest.tracks[0];
doc.querySelector('#tracks li').click();
ok('clicking a track in the live playlist keeps that playlist active',
  doc.querySelector('.station-btn.active') && doc.querySelector('.station-btn.active').dataset.playlist === 'latest');
ok('clicking a track keeps the top-bar status removed',
  !doc.querySelector('.nav-status'));
ok('clicked track becomes the now-playing title',
  doc.querySelector('#npTitle').textContent === firstLatestTrack.title,
  doc.querySelector('#npTitle').textContent);
ok('clicked track is highlighted in the refreshed sidebar',
  !!doc.querySelector('#tracks li.active'));

/* ==========================================================================
   HERO BACKDROP — the artwork must follow the live station
   ========================================================================== */
const heroEl = doc.querySelector('.hero');
const bgA = doc.getElementById('bgA');
const bgB = doc.getElementById('bgB');
// Whichever of the two crossfading layers currently carries the .in class is
// the artwork the listener actually sees.
const visibleBg = () => (bgA.classList.contains('in') ? bgA : bgB).getAttribute('src');
const shownLayers = () => [bgA, bgB].filter((el) => el.classList.contains('in')).length;

ok('exactly one backdrop layer is ever faded in',
  shownLayers() === 1, `${shownLayers()} layer(s) visible`);

/* Switching stations from the sidebar (drawer tab) must update the backdrop —
   this is the listener-facing path that used to leave the hero stuck. */
const officeTab = doc.querySelector('.drawer-tab[data-filter="office"]');
officeTab.click();
ok('switching stations from a drawer tab changes the hero backdrop',
  visibleBg() === window.PLAYLISTS.office.bg, visibleBg());
ok('switching stations from a drawer tab still shows exactly one layer',
  shownLayers() === 1, `${shownLayers()} layer(s) visible`);

window.PlayerEngine.switchPlaylist('monsoon', false);
ok('changing the station changes the hero backdrop image',
  visibleBg() === window.PLAYLISTS.monsoon.bg, visibleBg());
ok('changing the station retints the hero glow for that station',
  heroEl.style.getPropertyValue('--pl-glow').trim() === window.PLAYLISTS.monsoon.glow,
  heroEl.style.getPropertyValue('--pl-glow'));

window.PlayerEngine.switchPlaylist('truck', false);
ok('a second station change crossfades onto the other layer',
  visibleBg() === window.PLAYLISTS.truck.bg && shownLayers() === 1, visibleBg());

/* Every station in turn — no key may get stuck on a neighbour's artwork. */
const stuck = Object.keys(window.PLAYLISTS).filter((key) => {
  window.PlayerEngine.switchPlaylist(key, false);
  return visibleBg() !== window.PLAYLISTS[key].bg;
});
ok('every playlist shows its own backdrop when selected',
  stuck.length === 0, stuck.length ? `stuck on: ${stuck.join(', ')}` : 'all 7 stations');

/* Slow network: a backdrop that finishes loading AFTER a newer station change
   must never paint over the newer artwork. */
const queued = [];
const RealImage = window.Image;
window.Image = class SlowImage {
  set src(v) { this._src = v; queued.push(() => this.onload && this.onload()); }
  get src() { return this._src; }
};
window.PlayerEngine.switchPlaylist('auto', false);
window.PlayerEngine.switchPlaylist('indipop', false);
window.PlayerEngine.switchPlaylist('latest', false);
queued.reverse().forEach((fire) => fire()); // loads land out of order
window.Image = RealImage;
ok('a late-arriving backdrop cannot overwrite a newer station change',
  visibleBg() === window.PLAYLISTS.latest.bg && shownLayers() === 1, visibleBg());

window.PlayerEngine.switchPlaylist('office', false);
ok('the backdrop recovers after the out-of-order loads',
  visibleBg() === window.PLAYLISTS.office.bg, visibleBg());

/* Hand the deck back exactly as the drawer left it — a chosen station that
   still wants to play — so the auto-start checks below judge the boot and not
   the silent station-hopping this backdrop section just did. */
window.PlayerEngine.switchPlaylist('latest', true);

/* ==========================================================================
   PLAYER DECK — the "Golden Hour cassette deck" redesign
   ========================================================================== */
const player = doc.querySelector('#player');

ok('deck fascia carries the record emblem, brand and live station chip',
  !!player.querySelector('.player-fascia #disc') &&
  !!player.querySelector('.player-fascia .player-brand-name') &&
  player.querySelector('.player-fascia #stationBadge') === player.querySelector('.player-station-chip'));

ok('deck cassette window ships the two take-up reels the engine spins',
  player.querySelectorAll('.cassette-well .reel').length === 2 &&
  !!player.querySelector('#reelA') && !!player.querySelector('#reelB'));

ok('deck now-playing LCD keeps every engine hook (title, credit, counter)',
  !!player.querySelector('.np-text #npTitle') &&
  !!player.querySelector('.np-text #npCredit') &&
  !!player.querySelector('.np-text #trackCounter'));

ok('deck markup carries no inline style attributes (all styling is tokenised CSS)',
  player.querySelectorAll('[style]').length === 0,
  player.querySelectorAll('[style]').length === 0 ? '' : `${player.querySelectorAll('[style]').length} found`);

ok('deck stylesheet is imported through style.css, not linked ad hoc',
  src('style.css').includes('css/player-redesign.css') &&
  !/<link[^>]+player-redesign\.css/.test(html));

/* ==========================================================================
   AUTO-START ON ARRIVAL — the browser here refuses audible media
   ========================================================================== */
const disc = player.querySelector('#disc');
const unmuteBtn = player.querySelector('#unmuteBtn');

ok('the tap-for-sound prompt exists and starts hidden',
  !!unmuteBtn && unmuteBtn.hidden === true);
ok('the prompt itself is wired as a mute-lift control',
  typeof unmuteBtn.onclick === 'function');

(async () => {
  /* Let the engine reach onReady (one deferred turn) before judging the boot. */
  await new Promise((r) => setTimeout(r, 60));
  ok('the radio requests its opening song on load, with no click',
    window.__autoplay.attempts > 0 && !disc.classList.contains('spin'),
    `${window.__autoplay.attempts} start request(s) issued during boot`);

  /* Past AUTOSTART_GRACE the engine must notice the refusal and start the
     song muted rather than leave the listener in silence. */
  await new Promise((r) => setTimeout(r, 1900));
  ok('a refused audible start falls back to muted playback instead of silence',
    window.__autoplay.muted === true &&
    disc.classList.contains('spin') &&
    player.querySelector('#play').classList.contains('playing'),
    `muted:${window.__autoplay.muted} spinning:${disc.classList.contains('spin')}`);
  ok('a refused audible start offers sound on the deck',
    unmuteBtn.hidden === false);

  /* Any real gesture unlocks audio in every browser — so from here the stub
     grants audible starts, which is what a real browser does post-gesture. */
  window.dispatchEvent(new window.Event('pointerdown'));
  window.__autoplay.allowed = true;
  ok('the first gesture anywhere lifts the mute',
    window.__autoplay.muted === false,
    `muted:${window.__autoplay.muted}`);
  ok('the first gesture anywhere retires the prompt',
    unmuteBtn.hidden === true);

  /* ------------------------------------------------------------------------
     DECK TRANSPORT — pressing play must spin the emblem and BOTH reels
     ------------------------------------------------------------------------ */
  player.querySelector('#play').click();
  ok('pressing play while running pauses the deck',
    !disc.classList.contains('spin') &&
    !player.querySelector('#reelA').classList.contains('spin') &&
    !player.querySelector('#reelB').classList.contains('spin') &&
    !player.querySelector('#play').classList.contains('playing'));

  player.querySelector('#play').click();
  ok('pressing play again spins the record emblem and both take-up reels',
    disc.classList.contains('spin') &&
    player.querySelector('#reelA').classList.contains('spin') &&
    player.querySelector('#reelB').classList.contains('spin') &&
    player.querySelector('#play').classList.contains('playing'));

  /* The seek fill reads --seek-pct off #seek; without it the gradient paints an
     empty track however far in the song you are. */
  await new Promise((r) => setTimeout(r, 700)); // one 500ms tick
  const seek = player.querySelector('#seek');
  ok('the seek bar reports a live fill percentage for the deck gradient',
    seek.style.getPropertyValue('--seek-pct') === '25%' && seek.value === '250',
    `--seek-pct:${seek.style.getPropertyValue('--seek-pct') || '(none)'} value:${seek.value}`);
  ok('the tape counter shows the reported position and duration',
    player.querySelector('#cur').textContent === '1:03' &&
    player.querySelector('#dur').textContent === '4:12',
    `${player.querySelector('#cur').textContent} / ${player.querySelector('#dur').textContent}`);

  /* ==========================================================================
     Second boot, with a browser that DOES allow audible auto-start
     ========================================================================== */
  const dom2 = new JSDOM(html, {
    url: 'http://localhost:3000/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const win2 = dom2.window;
  win2.localStorage.clear();
  win2.requestAnimationFrame = win2.requestAnimationFrame || ((cb) => cb());
  win2.Image = class FakeImage {
    set src(v) { this._src = v; if (typeof this.onload === 'function') this.onload(); }
    get src() { return this._src; }
  };
  installStubs(win2, { allowed: true, muted: false, attempts: 0 });
  win2.eval([
    src('js/playlists-data.js'),
    src('js/player.js'),
    'window.PLAYLISTS = PLAYLISTS;',
    'window.PlayerEngine = PlayerEngine;',
    'window.$ = $;'
  ].join('\n;'));
  win2.PlayerEngine.init();

  const doc2 = win2.document;
  const disc2 = doc2.querySelector('#disc');
  const prompt2 = doc2.querySelector('#unmuteBtn');
  await new Promise((r) => setTimeout(r, 60)); // one deferred turn to onReady
  ok('a browser that allows audible auto-start plays out loud on arrival',
    win2.__autoplay.attempts > 0 &&
    disc2.classList.contains('spin') &&
    win2.__autoplay.muted === false,
    `attempts:${win2.__autoplay.attempts} muted:${win2.__autoplay.muted}`);

  await new Promise((r) => setTimeout(r, 1900));
  ok('no needless tap-for-sound prompt when audio was never held back',
    prompt2.hidden === true && win2.__autoplay.muted === false);

  /* The gesture listener is still armed here, so this is the case where an
     over-eager auto-start would fight the listener. */
  doc2.querySelector('#play').click();               // pause on purpose
  ok('the pause key stops an auto-started station',
    !disc2.classList.contains('spin'));
  win2.dispatchEvent(new win2.Event('pointerdown'));
  ok('a stray tap after a deliberate pause does not restart the station',
    !disc2.classList.contains('spin') &&
    !doc2.querySelector('#play').classList.contains('playing'));

  console.log(failures === 0 ? '\n✓ playlist UI tests passed' : `\n✗ ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
})();

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
window.BackgroundAudio = {
  setupActionHandlers() {},
  updateMediaSession() {},
  setPlaybackState() {},
  setPositionState() {}
};
window.Modals = { toast() {} };
/* A stub rich enough to report a real transport state. The old empty stub
   never fired onReady/onStateChange, so nothing below the click handlers was
   ever exercised — the deck's spin hooks and seek fill went untested. */
window.YT = {
  Player: function (el, opts) {
    this._opts = opts;
    this._state = -1;
    opts.events.onReady({ target: this });
  },
  PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }
};
window.YT.Player.prototype = {
  _emit(state) {
    this._state = state;
    this._opts.events.onStateChange({ target: this, data: state });
  },
  playVideo() { this._emit(1); },
  pauseVideo() { this._emit(2); },
  getPlayerState() { return this._state; },
  getDuration() { return 252; },
  getCurrentTime() { return 63; },
  seekTo() {},
  setVolume() {},
  mute() {},
  unMute() {},
  loadVideoById() {},
  cueVideoById() {}
};
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
ok('browsing drawer tabs updates the sidebar heading',
  doc.querySelector('#drawerStnLabel').textContent === 'Latest Hits');
ok('browsing drawer tabs updates the sidebar track list',
  doc.querySelectorAll('#tracks li').length === window.PLAYLISTS.latest.tracks.length,
  `${doc.querySelectorAll('#tracks li').length} tracks`);
ok('browsing a drawer tab does not immediately change the live station',
  doc.querySelector('.station-btn.active') && doc.querySelector('.station-btn.active').dataset.playlist === 'monsoon');

const firstLatestTrack = window.PLAYLISTS.latest.tracks[0];
doc.querySelector('#tracks li').click();
ok('clicking a track in another drawer playlist activates that playlist',
  doc.querySelector('.station-btn.active') && doc.querySelector('.station-btn.active').dataset.playlist === 'latest');
ok('clicking a track in another drawer playlist keeps the top-bar status removed',
  !doc.querySelector('.nav-status'));
ok('clicked track becomes the now-playing title',
  doc.querySelector('#npTitle').textContent === firstLatestTrack.title,
  doc.querySelector('#npTitle').textContent);
ok('clicked track is highlighted in the refreshed sidebar',
  !!doc.querySelector('#tracks li.active'));

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

/* Transport state: pressing play must spin the record emblem and BOTH reels.
   These are the only on-screen proof that a track is running. */
const disc = player.querySelector('#disc');
ok('record emblem is still before playback', !disc.classList.contains('spin'));
player.querySelector('#play').click();
ok('pressing play spins the record emblem and both take-up reels',
  disc.classList.contains('spin') &&
  player.querySelector('#reelA').classList.contains('spin') &&
  player.querySelector('#reelB').classList.contains('spin'));
ok('pressing play marks the key as playing',
  player.querySelector('#play').classList.contains('playing'));

/* The seek fill reads --seek-pct off #seek; without it the gradient paints an
   empty track however far in the song you are. */
(async () => {
  await new Promise((r) => setTimeout(r, 700)); // one 500ms tick
  const seek = player.querySelector('#seek');
  ok('the seek bar reports a live fill percentage for the deck gradient',
    seek.style.getPropertyValue('--seek-pct') === '25%' && seek.value === '250',
    `--seek-pct:${seek.style.getPropertyValue('--seek-pct') || '(none)'} value:${seek.value}`);
  ok('the tape counter shows the reported position and duration',
    player.querySelector('#cur').textContent === '1:03' &&
    player.querySelector('#dur').textContent === '4:12',
    `${player.querySelector('#cur').textContent} / ${player.querySelector('#dur').textContent}`);

  player.querySelector('#play').click();
  ok('pausing stops the reels and the record emblem',
    !disc.classList.contains('spin') &&
    !player.querySelector('#reelA').classList.contains('spin') &&
    !player.querySelector('#play').classList.contains('playing'));

  console.log(failures === 0 ? '\n✓ playlist UI tests passed' : `\n✗ ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
})();

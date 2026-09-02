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
window.YT = {
  Player: function () {},
  PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, CUED: 5 }
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

ok('top nav starts on the saved/default playlist',
  doc.querySelector('#navPlaylistName') && doc.querySelector('#navPlaylistName').textContent === 'Office (TCS)');
ok('drawer tabs are built for every playlist',
  doc.querySelectorAll('.drawer-tab').length === Object.keys(window.PLAYLISTS).length,
  `${doc.querySelectorAll('.drawer-tab').length} tabs`);

window.PlayerEngine.switchPlaylist('monsoon', false);
ok('switchPlaylist updates the top nav status',
  doc.querySelector('#navPlaylistName').textContent === 'Monsoon (90s)');
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
ok('clicking a track in another drawer playlist updates the nav status',
  doc.querySelector('#navPlaylistName').textContent === 'Latest Hits');
ok('clicked track becomes the now-playing title',
  doc.querySelector('#npTitle').textContent === firstLatestTrack.title,
  doc.querySelector('#npTitle').textContent);
ok('clicked track is highlighted in the refreshed sidebar',
  !!doc.querySelector('#tracks li.active'));

console.log(failures === 0 ? '\n✓ playlist UI tests passed' : `\n✗ ${failures} failure(s)`);
process.exit(failures ? 1 : 0);

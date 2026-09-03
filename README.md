# TCS Radio — 2000s Indian Retro Ambient Radio

**TCS Radio** (Total Chill Station) is a free 2000s Indian nostalgia ambient radio created and developed by **Umair**. It brings together iconic Indian soundscapes — IT corporate offices, auto rickshaws, highway trucks, monsoon rains, and roadside chai tapris — with nonstop Bollywood music and ambient sound.

## Developed By

**Umair** (`author: Umair`)

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

Deep-link nothing — there's exactly one, always-readable look: the classic
2000s amber **Retro Gold** palette with Baloo 2 / Inter typography.

### Checks

```bash
npm run check      # token graph + purity, render fidelity, contrast, player UI, rain UI
```

Three audits guard the design-token system:

- **`check:tokens`** resolves every `var(--x)` in `public/css/` and fails on any
  token that is never declared. It also enforces **token purity** — the seven
  token-driven component sheets must contain **zero** hardcoded `#hex` or
  `rgb()` literals. This is the guard that keeps an off-theme palette (the
  green-LCD/chrome deck this replaced) from ever slipping back in: a pasted hex
  passes both the render audit, which only reads the guarded sheets, and the
  resolver, which only checks that `var()` resolves.
- **`check:render`** resolves all declarations in the component CSS through both
  the current and the pre-refactor token graphs, so the classic **Retro Gold**
  look provably never drifts.
- **`check:contrast`** checks the pairs that carry meaning on screen — including
  the deck's amber LCD readout on its darkest glass stop (14.05:1) and the
  transport key labels on the deck wood (15.27:1).

## Auto-start

The station starts on its own — `PlayerEngine` asks for the opening track as
soon as the YouTube slot reports ready, with no click involved.

One thing no website can override: **every modern browser refuses to start
audible media before the visitor has interacted with the page.** That is a
platform rule (Chrome's autoplay policy, Safari, Firefox), not a setting this
app controls. So the engine handles both outcomes instead of guessing:

| Browser says | What TCS Radio does |
| --- | --- |
| audible start allowed | Plays out loud immediately. Nothing extra appears on screen. |
| audible start refused | Starts the same song **muted** — always permitted — and shows a **🔊 tap anywhere for sound** strip on the deck. The first `pointerdown`, `touchstart` or `keydown` anywhere on the page lifts the mute and restores the saved volume. |

Audible auto-start does succeed outright when the browser already trusts the
site: a high Media Engagement Index for the domain, an installed PWA, or a
returning listener on many mobile browsers.

The refusal is detected rather than assumed — `scheduleAutoStartCheck()` waits
`AUTOSTART_GRACE` (1.6 s) after the opening request and only falls back to
muted playback if the player never reached `PLAYING` on its own. A listener
who taps within that window is never shown the strip.

Auto-start never overrides a deliberate pause: the gesture handler only pushes
play while `userPaused` is false, so stopping the radio and then tapping
elsewhere on the page leaves it stopped.

## Features

| Feature | Notes |
| --- | --- |
| 7 Curated Playlists | 🏢 **Office (TCS)**, 🛺 **Auto (Jhankar)**, 🚚 **Truck (Highway)**, 🌧️ **Monsoon (90s Romance)**, ☕ **Chai Tapri (Golden Hits)**, 🎸 **Indipop & Cassette**, 🎧 **Latest Hits (2024–26)** — 12–13 hand-picked tracks per station (85+ official uploads in the library, fresh chartbusters like Saiyaara, Dhun, Gehra Hua & Border 2 on the Latest station) |
| 🎨 Playlist-Matched Backgrounds | Every radio playlist has its own retro hero artwork — Office tech park, Auto bazaar street, Highway truck, Monsoon rain, Chai tapri, Cassette rooftop and a neon rooftop gig for Latest Hits — that **crossfades instantly when you switch stations**, with a matching accent glow |
| ▶ Auto-Start On Arrival | The station starts by itself the moment the page opens — no play button to hunt for. Browsers never let a site begin **audible** sound before the visitor touches the page, so when that happens the deck keeps the song running **muted** and shows a **🔊 tap anywhere for sound** strip; the first tap, click or keypress anywhere lifts the mute. When the browser does allow audible media (high media-engagement, installed PWA, many mobile browsers) it simply plays out loud and the strip never appears |
| Auto-Play Next Playlist | When all songs in a playlist finish playing, TCS Radio automatically transitions to the next playlist in the cycle for endless uninterrupted streaming |
| Sidebar Playlist Browser | The hero stays uncluttered; use the player’s ☰ button to browse stations and songs in the slide-out sidebar |
| Song Add / Remove (Connect) | A compact action before the footer opens an enhanced form for artists, copyright holders, and listeners to suggest tracks or request removals directly with Umair |
| Audio-First Radio | The radio is already playing when the page finishes loading, and the controls stay visible; the full video deck stays out of the way in mini mode |
| Tactile Audio Controls | Golden glowing play button, prev/next, shuffle, custom volume with mute toggle, seekbar with real-time sync, keyboard shortcuts (`Space` / `←` / `→` / `M` = mute / `S` = shuffle / `D` = dock / `R` = rain) |
| 📼 Cassette-Deck Player | The player is a compact "Pocket Cassette" deck: a micro fascia strip under the signature gold beam, a one-line amber LCD with two mini take-up reels that turn only while a track plays, a hairline gold seek tape and warm paper transport keys — every colour resolves through the design tokens, so the deck carries the same Retro Gold palette (and per-station glow) as the rest of the page |
| 📻 Micro Radio Bar | One tap on the deck's 📻 key (or `D`) folds the whole deck into a single ~40px pill — spinning disc, live title, play/pause, next and the playlist ☰ all stay usable — and 🎛️ unfolds the full deck again. The choice is remembered between visits |
| 🌧️ Baarish Ambience | Built-in Web Audio API monsoon rain synthesizer with gentle distant thunder — plus a full on-screen rain overlay: falling drops, splash ripples and lightning flashes synced to the thunder, with intensity following the Baarish volume slider |
| 💼 TCS Careers | Light-hearted careers modal placed after Add / Remove Songs, with an anti-scam notice (no fake links!) |
| ❤️ Support Us | Support action joins Add / Remove Songs and TCS Careers in the strip after the content, right before the short footer; the station stays ad-free and is supported by sharing |
| Static FAQ | The FAQ ships as real HTML with 8 current answers — it renders even before (or without) JavaScript, and the YouTube engine now loads asynchronously so no third-party script can leave the page blank |
| Short footer | A small brand line, three useful links, and one ownership note — the longer promotional copy stays out of the footer |
| PWA & SEO | Installable Progressive Web App, service worker, manifest, SEO meta tags, sitemap.xml |

## Layout

```
server.js                    Express static server + /api/health, /sitemap.xml
public/index.html            Page markup & modals
public/style.css             Imports the modular stylesheets below, in cascade order
public/css/variables.css     ~224 design tokens + the classic Retro Gold values
public/css/{base,hero,player,…}.css  Component styles — token-driven
public/css/redesign.css      "Golden Hour Deck" language — gold beam, dashed dividers, shared hover grammar
public/css/player-redesign.css  Player deck layer (imported last) — the cassette-deck skin
public/css/rain.css          On-screen monsoon rain overlay
public/js/rain-ambient.js    Web Audio baarish synthesizer (rain + thunder)
public/js/rain-visual.js     Canvas rain overlay — drops, splashes, lightning
public/js/playlists-data.js  Song database: 7 playlists × 12–13 tracks, quotes, per-playlist hero artwork
public/js/player.js          Player engine, auto-start on arrival, auto-advance, backdrop crossfade
public/sw.js                 Service worker
public/img/hero-*.jpg        Per-playlist hero background artwork (office/auto/truck/monsoon/tapri/indipop/latest)
public/manifest.webmanifest
public/img/                  Banner artwork (tcs-banner.jpg), app icons (tcs-icon.png)
tools/                       The audits behind `npm run check`
```

## Credits

Inspired by deluxsalon.in • Built with ❤️ for Indian retro nostalgia by **Umair**.

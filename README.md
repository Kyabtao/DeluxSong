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
npm run check      # token graph, render fidelity, contrast, player UI
```

Three audits guard the design-token system — including one that resolves all
declarations in the component CSS through both the current and the pre-refactor
token graphs, so the classic **Retro Gold** look provably never drifts.

## Features

| Feature | Notes |
| --- | --- |
| 7 Curated Playlists | 🏢 **Office (TCS)**, 🛺 **Auto (Jhankar)**, 🚚 **Truck (Highway)**, 🌧️ **Monsoon (90s Romance)**, ☕ **Chai Tapri (Golden Hits)**, 🎸 **Indipop & Cassette**, 🎧 **Latest Hits (2024–26)** — 12–13 hand-picked tracks per station (85+ official uploads in the library, fresh chartbusters like Saiyaara, Dhun, Gehra Hua & Border 2 on the Latest station) |
| 🎨 Playlist-Matched Backgrounds | Every radio playlist has its own retro hero artwork — Office tech park, Auto bazaar street, Highway truck, Monsoon rain, Chai tapri, Cassette rooftop and a neon rooftop gig for Latest Hits — that **crossfades instantly when you switch stations**, with a matching accent glow |
| Auto-Play Next Playlist | When all songs in a playlist finish playing, TCS Radio automatically transitions to the next playlist in the cycle for endless uninterrupted streaming |
| Sidebar Playlist Browser | The hero stays uncluttered; use 📻 Choose a playlist or the player’s ☰ button to browse stations and songs in the slide-out sidebar |
| Song Add / Remove (Connect) | A compact action before the footer opens an enhanced form for artists, copyright holders, and listeners to suggest tracks or request removals directly with Umair |
| Audio-First Radio | The player appears after a song is chosen from the sidebar; video starts hidden for a distraction-free listening experience and can be expanded via 📺 |
| Tactile Audio Controls | Golden glowing play button, prev/next, shuffle, custom volume with mute toggle, seekbar with real-time sync, keyboard shortcuts (`Space` / `←` / `→` / `M` / `S` / `R` = rain) |
| 🌧️ Baarish Ambience | Built-in Web Audio API monsoon rain synthesizer with gentle distant thunder — plus a full on-screen rain overlay: falling drops, splash ripples and lightning flashes synced to the thunder, with intensity following the Baarish volume slider |
| 💼 TCS Careers | Light-hearted careers modal placed after Add / Remove Songs, with an anti-scam notice (no fake links!) |
| ❤️ Support Us | Support action placed after About with a short thank-you; the station stays ad-free and is supported by sharing |
| Short footer | A small brand line, three useful links, and one ownership note — the longer promotional copy stays out of the footer |
| PWA & SEO | Installable Progressive Web App, service worker, manifest, SEO meta tags, sitemap.xml |

## Layout

```
server.js                    Express static server + /api/health, /sitemap.xml
public/index.html            Page markup & modals
public/style.css             Imports the modular stylesheets below
public/css/variables.css     ~215 design tokens + the classic Retro Gold values
public/css/{base,hero,player,…}.css  Component styles — token-driven
public/css/rain.css          On-screen monsoon rain overlay
public/js/rain-ambient.js    Web Audio baarish synthesizer (rain + thunder)
public/js/rain-visual.js     Canvas rain overlay — drops, splashes, lightning
public/js/playlists-data.js  Song database: 7 playlists × 12–13 tracks, quotes, per-playlist hero artwork
public/js/player.js          Player engine, auto-advance, backdrop crossfade, station accent
public/sw.js                 Service worker
public/img/hero-*.jpg        Per-playlist hero background artwork (office/auto/truck/monsoon/tapri/indipop/latest)
public/manifest.webmanifest
public/img/                  Banner artwork (tcs-banner.jpg), app icons (tcs-icon.png)
tools/                       The audits behind `npm run check`
```

## Credits

Inspired by deluxsalon.in • Built with ❤️ for Indian retro nostalgia by **Umair**.

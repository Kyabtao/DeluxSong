# TCS Radio — 2000s Indian Retro Ambient Radio

**TCS Radio** (Total Chill Station / Tata Chai & Symphony) is a free 2000s Indian nostalgia ambient radio created and developed by **Umair**. It brings together iconic Indian soundscapes — IT corporate offices, auto rickshaws, highway trucks, monsoon rains, and roadside chai tapris — with nonstop Bollywood music and ambient sound.

## Developed By

**Umair** (`author: Umair`)

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

## Features

| Feature | Notes |
| --- | --- |
| 6 Curated Playlists | 🏢 **Office (TCS)**, 🛺 **Auto (Jhankar)**, 🚚 **Truck (Highway)**, 🌧️ **Monsoon (90s Romance)**, ☕ **Chai Tapri (Golden Hits)**, 🎸 **Indipop & Cassette** — now **12 hand-picked tracks each** (72+ official uploads in the library) |
| 🎨 Playlist-Matched Backgrounds | Every radio playlist has its own retro hero artwork — Office tech park, Auto bazaar street, Highway truck, Monsoon rain, Chai tapri and Cassette rooftop — that **crossfades instantly when you switch stations**, with a matching accent glow |
| Auto-Play Next Playlist | When all songs in a playlist finish playing, TCS Radio automatically transitions to the next playlist in the cycle for endless uninterrupted streaming |
| Song Add / Remove (Connect) | Enhanced connect form for artists, copyright holders, and listeners to suggest tracks or request removals directly with Umair instead of reporting — type-aware fields, validation, draft save, success panel, and one-tap copy of the request |
| Audio-First Radio | Video player starts hidden by default for lightweight distraction-free listening; expandable anytime via the 📺 button |
| Tactile Audio Controls | Golden glowing play button, prev/next, shuffle, custom volume with mute toggle, seekbar with real-time sync, keyboard shortcuts (`Space` / `←` / `→` / `M` / `S`) |
| 🌧️ Baarish Ambience | Built-in Web Audio API monsoon rain synthesizer with gentle distant thunder and dedicated volume slider |
| 💼 TCS Careers (Joke) | Humorous corporate job offer (*Role: Senior Timesheet Filler & Chai Break Lead*) with anti-scam notice (no fake links!) |
| ❤️ Support Us | Heartfelt (and short) thank-you from Umair with a playful expense breakdown — no QR, no UPI; ad-free radio supported by sharing |
| PWA & SEO | Installable Progressive Web App, service worker, manifest, SEO meta tags, sitemap.xml |

## Layout

```
server.js                 Express static server + /api/health, /sitemap.xml
public/index.html         Page markup & modals
public/style.css          Retro ambient theme (amber / cream / mahogany / gold)
public/js/playlists-data.js  Song database: 6 playlists × 12 tracks, quotes, per-playlist hero artwork
public/js/player.js          Player engine, auto-advance, playlist-backed backdrop crossfade
public/sw.js              Service worker
public/img/hero-*.jpg     Per-playlist hero background artwork (office/auto/truck/monsoon/tapri/indipop)
public/manifest.webmanifest
public/img/               Banner artwork (tcs-banner.jpg), app icons (tcs-icon.png)
```

## Credits

Inspired by deluxsalon.in • Built with ❤️ for Indian retro nostalgia by **Umair**.

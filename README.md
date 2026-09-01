# DeluxSong

**Deluxe Saloon** (डीलक्स सैलून) — a 2000s Indian saloon, rebuilt in sound. Free nonstop
Bollywood ambient radio: a working clone of [deluxsalon.in](https://deluxsalon.in/).

The site is a **multi-page static site at the repo root** — visiting the site serves
`index.html` (the landing page), not this README. Built **mobile-first**: thumb-sized
controls, hamburger nav, full-screen playlist/chat on phones, and a bottom mini-player
that carries your song across pages.

## Pages

| Page | File | What's on it |
| --- | --- | --- |
| **Home** | `index.html` | Hero, rotating barber quotes, "in the saloon now" preview, features, about + FAQ teasers |
| **Radio** | `radio.html` | The full player: YouTube IFrame radio, play/prev/next, seek, volume, shuffle, video toggle, playlist drawer, 🌧️ Baarish rain ambience, keyboard shortcuts |
| **Tracks** | `tracks.html` | All 12 curated 2000s Bollywood tracks — tap any to play it on the radio |
| **About** | `about.html` | The story, the experience, how it works under the hood, fair-use notes |
| **FAQ** | `faq.html` | Full question & answer accordion |
| **Support** | `support.html` | UPI QR support card, part-time earning, other ways to help |
| *404* | `404.html` | Theme-matched page-not-found |

## Features

- 📻 **Radio player** (YouTube IFrame API) — shuffle by default, auto-advance, seek with
  timings, volume, show/hide video, keyboard shortcuts (Space / ← / →), spinning record.
- 📋 **Playlist** — 12 curated 2000s Bollywood tracks; drawer on the radio page, grid on
  the Tracks page; click-to-play anywhere.
- 🌧️ **Baarish** — rain ambience synthesized in-browser with the Web Audio API
  (filtered noise + distant thunder) with its own volume slider.
- 💬 **Live Chat** — WebSocket room when served by the local server (`npm start`):
  200-message history, online counter, rate limiting, unread badge. On static hosting
  (e.g. GitHub Pages) it degrades to a read-only "offline" note; everything else works.
- 📲 **PWA** — manifest + service worker; installable to the home screen, offline shell.
- 📱 **Mobile-first** — responsive from 320px up, safe-area aware, install banner,
  Web Share with clipboard fallback.
- 📄 **SEO** — per-page meta/OG tags, `robots.txt`, `sitemap.xml`.

## Run locally

```bash
npm install
npm start        # http://localhost:3000  (static site + live chat at /ws)
```

Or serve the static files any way you like — the site needs no build step:

```bash
npx serve .      # or: python3 -m http.server
```

## Deploy

`deploy/github-pages.yml` publishes the **repo root** to GitHub Pages on push to `main`.
Enable Pages → "Deploy from a branch" → `main` / (root). Visiting the site then shows
`index.html`.

## Layout

```
index.html / radio.html / tracks.html / about.html / faq.html / support.html / 404.html
css/style.css          Mobile-first retro saloon theme (amber / cream / deep red)
js/app.js              Player, playlist, quotes, rain synth, chat, PWA, page logic
img/                   Banner artwork, app icons, UPI QR
sw.js                  Service worker (offline shell)
manifest.webmanifest   PWA manifest
server.js              Optional Express static server + /ws chat + /api/health
deploy/                GitHub Pages workflow
```

## Note on assets

Outbound network in the build sandbox was allowlisted, so the original site's HTML/CSS/JS
and images could not be downloaded. The page was rebuilt from the site's fully-rendered
content, with freshly generated banner/icon artwork in the same golden-hour barbershop
style and a locally generated placeholder UPI QR. Swap the files in `img/` to use the
originals.

Songs stream from YouTube and belong to their respective owners.

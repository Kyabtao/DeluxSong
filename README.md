# DeluxSong — a working clone of [deluxsalon.in](https://deluxsalon.in/)

**Deluxe Saloon** — a 2000s Indian neighbourhood barbershop, rebuilt in sound. A free ambient
radio that streams nonstop Bollywood nostalgia, with barber one-liners, rain ambience and a
live chat room, exactly in the spirit of the original site.

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

## What's implemented

| Feature | Notes |
| --- | --- |
| Retro saloon hero | Full-bleed illustrated storefront banner, Devanagari wordmark, rotating barber quotes |
| Radio player | YouTube IFrame API — play/pause, next/prev, seek, volume, shuffle, autoplay-next, keyboard shortcuts (Space / ← / →) |
| Playlist drawer | 12 curated 2000s Bollywood tracks, click to play, shuffle-aware ordering |
| 🌧️ Baarish | Rain ambience synthesized in the browser with the Web Audio API (filtered noise + distant thunder), with its own volume slider |
| 💬 Live Chat | Real WebSocket chat (`ws`), server-side history of the last 200 messages, online counter, "what's your name?" prompt before the first message, rate limiting |
| 💰 Part Time Earning | Modal with WhatsApp channel link |
| ❤️ Support | UPI QR modal with downloadable QR, auto-shown once per session |
| Share | Web Share API with clipboard fallback |
| PWA | Manifest, icons, service worker (offline shell), install prompt banner |
| Content | About section, three feature cards, FAQ accordion, footer — mirroring the original copy |
| SEO | Title/description/OG tags, `robots.txt`, generated `sitemap.xml` |

## Layout

```
server.js                 Express static server + /ws chat WebSocket + /api/health, /sitemap.xml
public/index.html         Page markup
public/style.css          Retro saloon theme (amber / cream / deep red)
public/app.js             Player, playlist, quotes, rain synth, modals, PWA, chat client
public/sw.js              Service worker
public/manifest.webmanifest
public/img/               Banner artwork, app icons, UPI QR
```

## Notes

- The sandbox this was built in had no outbound access to `deluxsalon.in`, so the original binary
  assets could not be downloaded. The banner and app icon here are freshly generated artwork in the
  same style, and the UPI QR is a placeholder generated locally — swap the files in `public/img/`
  to use the real ones.
- Songs stream from YouTube and remain the property of their respective owners (Ishtar Music etc.).
- Chat history is in-memory; restarting the server clears it. Swap the `messages` array in
  `server.js` for Redis/SQLite for persistence.

## Deploying

> This project is deployed to **GitHub Pages only** (see `deploy/github-pages.yml`). GitHub Pages is
> a static host, so there is **no Node/WebSocket chat server** in production. The live chat room
> degrades to a clean read-only "offline" state there — the chat input stays disabled and the
> "what's your name?" prompt is never shown, so users are never trapped by Send/Cancel.

### GitHub Pages (static — no live chat)

A ready-made workflow is provided at `deploy/github-pages.yml`. Copy it to `.github/workflows/pages.yml`
(this has to be done by a human account — app tokens can't create workflow files). It publishes the `public/` folder to GitHub Pages on every
push to `main`. Enable it once under **Settings → Pages → Build and deployment → Source: GitHub Actions**,
then the site is live at `https://<user>.github.io/DeluxSong/`.

All asset paths are relative, so it works from a project sub-path. Everything runs on Pages except
the live chat, which needs a WebSocket server — it degrades to a read-only "offline" state there.

To re-enable chat from the static build, host `server.js` somewhere (Render, Railway, Fly.io) and set
the endpoint before `app.js` loads:

```html
<script>window.DELUX_CHAT_URL = "wss://your-chat-host.example.com/ws";</script>
```

### Full site (with live chat)

Any Node host that supports WebSockets works — deploy the repo and run `npm start`
(the server binds `0.0.0.0` and honours `PORT`).

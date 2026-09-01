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

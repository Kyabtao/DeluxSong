# 🛡️ TCS Radio AdBlocker — Legal, Local, Lightweight

> **Is creating and using an ad blocker illegal? No.**  
> In India, US, EU and most jurisdictions, users have the legal right to filter content in their own browser. Ad blockers use standard web platform features (CSS, fetch interception, DOM filtering). This module does NOT hack YouTube, does NOT bypass paywalls, and does NOT modify YouTube's servers — it only controls what YOUR browser displays.

## What it blocks

| Type | How |
|------|-----|
| **Banner / overlay ads** | CSS `display:none !important` + MutationObserver hides them as they appear |
| **Tracking scripts** | `fetch`, `XHR`, `createElement` interception blocks known ad domains (doubleclick, googlesyndication, adnxs, taboola, etc.) |
| **Popups / popunders** | `window.open` override blocks ad popups |
| **YouTube ads in radio** | Detects ad via YT Player API heuristics (videoId mismatch, short duration, `isAd` flag) → mutes, seeks to end, speeds up, or reloads expected track |
| **Service Worker level** | `sw.js` returns 204 for ad requests even when page is offline-cached |

## Files

- `public/js/adblocker.js` — core engine, stats, UI, YouTube handling
- `public/css/adblocker.css` — pill button, modal, cosmetic hiding
- `public/sw.js` — SW-level request blocking (v19)
- `public/js/player.js` — hooks: emits `tcs:trackChange`, exposes `__tcs_getActivePlayer`
- `public/js/app.js` — initializes AdBlocker first

## Usage

The blocker is **ON by default**.

- Top bar: **🛡️ AdBlock** pill shows blocked count badge
- Click pill → opens stats modal with toggle, counter reset, legal note
- Right-click pill → quick toggle ON/OFF
- Toast appears when YouTube ad is muted/skipped

### Persistence

- `localStorage.tcs_adblock_enabled` — 1 = on, 0 = off
- `localStorage.tcs_adblock_count` — total blocked
- `localStorage.tcs_adblock_whitelist` — optional per-host whitelist (JSON array)

### API

```js
AdBlocker.isEnabled()        // boolean
AdBlocker.enable()           // turn on
AdBlocker.disable()          // turn off
AdBlocker.toggle()           // flip
AdBlocker.getBlockedCount()  // number
AdBlocker.getStats()         // { enabled, blockedCount, whitelisted }
AdBlocker.setExpectedVideo(videoId) // for YouTube ad detection
```

## YouTube Ad Handling — Technical Details

YouTube iframe is cross-origin, so we cannot click the skip button inside it directly. Instead:

1. PlayerEngine emits expected videoId on every `loadTrack`
2. AdBlocker polls every 600ms:
   - If `player.getVideoData().isAd` or `video_id !== expected` and duration < 90s → likely ad
   - Mute, `setPlaybackRate(2)`, `seekTo(duration)` to fast-forward
   - After 2 failed attempts, `loadVideoById(expected)` to force skip
   - Restore volume after ad ends
3. Shows "🛡️ Ad blocked — skipping…" on station badge temporarily

This is best-effort and respects YouTube ToS — it uses only public Player API methods.

## Legal Note

- **Creating** an ad blocker: legal (freedom to write software)
- **Using** an ad blocker: legal (freedom to control your device)
- **Websites** may detect and ask you to disable it, but cannot prosecute you for using it
- EU Court (2018) and US courts have upheld ad blocking as lawful

## Testing

```bash
npm run check          # existing audits — should still pass
# Manual:
# 1. Open http://localhost:3000
# 2. Check 🛡️ pill is ON, count increments if ad elements injected
# 3. Right-click pill to toggle OFF — ads should reappear if any
# 4. Open console: AdBlocker.getStats()
```

## Future Improvements

- Import EasyList / Peter Lowe filters (fetch + parse)
- Per-site whitelist UI
- Element picker (click to hide)
- uBlock-style logger

---
Built for TCS Radio by Umair — ad-free station stays ad-free, and now helps you stay ad-free everywhere on the page.

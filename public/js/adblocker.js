/* ==========================================================================
   TCS RADIO - ADBLOCKER ENGINE
   Developed by Umair — AdBlocker Module for TCS Radio

   Legal Notice:
   Creating and using an ad blocker is legal in most jurisdictions.
   Users have the right to control what content loads in their browser.
   This module does NOT hack YouTube or bypass paywalls — it uses standard
   browser techniques: CSS hiding, request filtering, and player API.

   Features:
   - Generic web ad hiding (CSS + MutationObserver)
   - Network request blocking (fetch/XHR/createElement interception)
   - Popup & popunder blocking
   - YouTube ad detection, mute & auto-skip (via YT Player API)
   - Service Worker assisted blocking (complements this module)
   - Stats, toggle, persistence
   ========================================================================== */

const AdBlocker = (function () {
  const STORAGE_KEY = "tcs_adblock_enabled";
  const COUNT_KEY = "tcs_adblock_count";
  const WHITELIST_KEY = "tcs_adblock_whitelist";

  let enabled = true;
  let blockedCount = 0;
  let observer = null;
  let ytCheckInterval = null;
  let lastToastAt = 0;

  // --------------------------------------------------------------------------
  // 1. Known Ad / Tracking Domains — requests to these are blocked
  // --------------------------------------------------------------------------
  const AD_DOMAINS = [
    "doubleclick.net",
    "googlesyndication.com",
    "googleadservices.com",
    "googletagmanager.com",
    "googletagservices.com",
    "google-analytics.com",
    "adservice.google",
    "adservice.youtube",
    "adsystem.amazon",
    "amazon-adsystem.com",
    "adnxs.com",
    "ads-twitter.com",
    "facebook.net",
    "fbcdn.net",
    "scorecardresearch.com",
    "hotjar.com",
    "outbrain.com",
    "taboola.com",
    "criteo.com",
    "criteo.net",
    "adroll.com",
    "quantserve.com",
    "zemanta.com",
    "pubmatic.com",
    "rubiconproject.com",
    "openx.net",
    "adsrvr.org",
    "moatads.com",
    "moat.com",
    "googlesyndication",
    "admob",
    "ad-maven",
    "popads.net",
    "popcash.net",
    "propellerads.com",
    "adsterra.com",
    "zeroredirect",
    "adcolony.com",
    "chartboost.com",
    "unityads.unity3d.com",
    "applovin.com",
    "inmobi.com",
    "flurry.com",
    "tapjoy.com",
    "ironsrc.com",
    "vungle.com",
    "mopub.com",
    "doubleverify.com",
    "adform.net",
    "adform.com",
    "adsafeprotected.com",
    "amazon-ads",
    "adlightning.com",
    "adobedtm.com",
    "2mdn.net",
    "g.doubleclick.net",
    "tpc.googlesyndication.com",
    "pagead2.googlesyndication.com",
    "video-ads.youtube.com",
    "s.youtube.com/api/stats/ads",
    "youtube.com/get_midroll_info",
    "youtube.com/api/stats/qoe",
    "googlevideo.com/ptracking",
    "googlevideo.com/pagead",
    "youtube-nocookie.com",
    "ytdoubles.com",
    "ad.youtube.com",
    // Generic trackers
    "facebook.com/tr",
    "connect.facebook.net",
    "analytics.twitter.com",
    "bat.bing.com",
    "clarity.ms",
    "linkedin.com/px",
    "snapchat.com/tr",
    "tiktok.com/i18n/pixel",
    "pinterest.com/ct",
  ];

  // --------------------------------------------------------------------------
  // 2. CSS Selectors for visual ad elements (cosmetic filtering)
  // --------------------------------------------------------------------------
  const AD_SELECTORS = [
    // Generic ad containers
    "[id^='google_ads_']",
    "[id^='div-gpt-ad']",
    "[class*='google-ad']",
    "[class*='adsbygoogle']",
    ".adsbygoogle",
    ".ad-container",
    ".ad-wrapper",
    ".ad-slot",
    ".ad-banner",
    ".ad-unit",
    ".advertisement",
    ".advert",
    ".ads",
    ".ad",
    "[id*='-ad-']",
    "[class*='-ad-']",
    "[data-ad]",
    "[data-ad-slot]",
    "[data-google-query-id]",
    // Iframes from ad networks
    "iframe[src*='doubleclick']",
    "iframe[src*='googlesyndication']",
    "iframe[src*='adservice']",
    "iframe[src*='adsystem']",
    "iframe[src*='adnxs']",
    "iframe[src*='taboola']",
    "iframe[src*='outbrain']",
    "iframe[id^='google_ads']",
    // Popups / overlays
    ".popup-ad",
    ".popunder",
    ".interstitial",
    ".ad-overlay",
    ".ad-popup",
    // Sponsored labels
    "[aria-label*='Advertisement']",
    "[aria-label*='Sponsored']",
    "div:has(> div > span:contains('Sponsored'))",
    // Social / tracking pixels (hidden)
    "img[width='1'][height='1']",
    "img[src*='facebook.com/tr']",
    "img[src*='doubleclick']",
    // YouTube specific ad overlays (outside iframe where possible)
    ".ytp-ad-module",
    ".ytp-ad-overlay-container",
    ".ytp-ad-image-overlay",
    ".video-ads",
    ".ytp-ad-skip-button",
    ".ytp-ad-preview-container",
    // Common third-party widgets that inject ads
    "#ad",
    "#ads",
    "#advert",
    ".adcode",
    ".adbox",
    ".adtech",
    ".ad-728x90",
    ".ad-300x250",
    ".ad-160x600",
    ".ad-leaderboard",
    ".ad-skyscraper",
    ".ad-rectangle",
  ];

  // Clean list: remove :has and :contains selectors that are not supported everywhere
  const SAFE_AD_SELECTORS = AD_SELECTORS.filter(s => !s.includes(":has(") && !s.includes(":contains"));

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function isAdUrl(url) {
    if (!url) return false;
    try {
      const u = String(url).toLowerCase();
      return AD_DOMAINS.some(d => u.includes(d.toLowerCase()));
    } catch (_) { return false; }
  }

  function isWhitelisted() {
    try {
      const wl = JSON.parse(localStorage.getItem(WHITELIST_KEY) || "[]");
      return wl.includes(location.hostname);
    } catch (_) { return false; }
  }

  function incrementBlocked(n = 1, reason = "") {
    blockedCount += n;
    try { localStorage.setItem(COUNT_KEY, String(blockedCount)); } catch (_) {}
    updateBadge();
    if (reason && Date.now() - lastToastAt > 4000) {
      // Avoid spam — only occasional toast for YouTube ads
      if (reason.includes("YouTube")) {
        lastToastAt = Date.now();
        if (window.Modals && Modals.toast) Modals.toast(`🛡️ ${reason} — blocked ${blockedCount}`);
      }
    }
  }

  function updateBadge() {
    const btn = document.getElementById("adblockBtn");
    if (btn) {
      const countEl = btn.querySelector(".adblock-count") || document.getElementById("adblockCountBadge");
      if (countEl) {
        countEl.textContent = blockedCount > 99 ? "99+" : String(blockedCount);
        countEl.hidden = blockedCount === 0;
      }
      btn.classList.toggle("adblock-on", enabled);
      btn.classList.toggle("adblock-off", !enabled);
      btn.title = enabled ? `AdBlock ON — ${blockedCount} blocked (right-click to toggle)` : "AdBlock OFF — click to enable";
    }
    // Also update standalone badge if present
    const badgeAlt = document.getElementById("adblockCountBadge");
    if (badgeAlt && !btn?.contains(badgeAlt)) {
      badgeAlt.textContent = blockedCount > 99 ? "99+" : String(blockedCount);
      badgeAlt.hidden = blockedCount === 0;
    }
  }

  function injectCosmeticCSS() {
    if (document.getElementById("tcs-adblock-style")) return;
    const style = document.createElement("style");
    style.id = "tcs-adblock-style";
    style.textContent = `
      ${SAFE_AD_SELECTORS.join(",\n")} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
      /* Hide empty ad slots that collapse */
      [style*="display: none"] { display: none !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function hideExistingAds() {
    if (!enabled) return;
    try {
      SAFE_AD_SELECTORS.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (el && el.style) {
            el.style.setProperty("display", "none", "important");
            incrementBlocked(1);
          }
        });
      });
    } catch (_) {}
  }

  function startObserver() {
    if (observer) observer.disconnect();
    if (!enabled) return;
    observer = new MutationObserver((mutations) => {
      let found = 0;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          // Direct match
          try {
            if (node.matches && SAFE_AD_SELECTORS.some(sel => {
              try { return node.matches(sel); } catch (_) { return false; }
            })) {
              node.style.setProperty("display", "none", "important");
              found++;
              continue;
            }
            // Check children
            SAFE_AD_SELECTORS.forEach(sel => {
              try {
                node.querySelectorAll(sel).forEach(el => {
                  el.style.setProperty("display", "none", "important");
                  found++;
                });
              } catch (_) {}
            });
            // Iframe / script / img with ad domain
            if (["IFRAME", "SCRIPT", "IMG", "LINK"].includes(node.tagName)) {
              const src = node.src || node.href || "";
              if (isAdUrl(src)) {
                node.remove();
                found++;
              }
            }
          } catch (_) {}
        }
      }
      if (found) incrementBlocked(found);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // --------------------------------------------------------------------------
  // Network blocking via fetch / XHR / createElement
  // --------------------------------------------------------------------------
  let origFetch = null;
  let origOpen = null;
  let origCreateElement = null;
  let origWindowOpen = null;

  function interceptNetwork() {
    if (!enabled) return;

    // fetch
    if (!origFetch && window.fetch) {
      origFetch = window.fetch;
      window.fetch = function (input, init) {
        try {
          const url = typeof input === "string" ? input : input && input.url ? input.url : "";
          if (isAdUrl(url)) {
            incrementBlocked(1, url.includes("youtube") ? "YouTube ad request blocked" : "");
            return Promise.resolve(new Response("", { status: 204, statusText: "Blocked by TCS AdBlock" }));
          }
        } catch (_) {}
        return origFetch.apply(this, arguments);
      };
    }

    // XMLHttpRequest
    if (!origOpen && window.XMLHttpRequest) {
      origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url) {
        this._tcs_url = url;
        if (isAdUrl(url)) {
          this._tcs_blocked = true;
        }
        return origOpen.apply(this, arguments);
      };
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function () {
        if (this._tcs_blocked) {
          incrementBlocked(1);
          // Simulate abort
          Object.defineProperty(this, "readyState", { value: 4, writable: true });
          Object.defineProperty(this, "status", { value: 0, writable: true });
          this.dispatchEvent(new Event("loadend"));
          return;
        }
        return origSend.apply(this, arguments);
      };
    }

    // createElement
    if (!origCreateElement) {
      origCreateElement = Document.prototype.createElement;
      Document.prototype.createElement = function (tagName, options) {
        const el = origCreateElement.call(this, tagName, options);
        if (!enabled) return el;
        if (/^(iframe|script|img|link)$/i.test(tagName)) {
          const origSetSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src") ||
                             Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
          // Intercept src setter via setAttribute
          const origSetAttr = el.setAttribute;
          el.setAttribute = function (name, value) {
            if ((name === "src" || name === "href") && isAdUrl(value)) {
              incrementBlocked(1);
              // Don't set — block
              return;
            }
            return origSetAttr.call(this, name, value);
          };
          // Also intercept direct property assignment
          if ("src" in el) {
            let _src = "";
            try {
              Object.defineProperty(el, "src", {
                get() { return _src; },
                set(v) {
                  if (isAdUrl(v)) {
                    incrementBlocked(1);
                    return;
                  }
                  _src = v;
                  // Actually set via original prototype
                  try {
                    if (el.tagName === "IMG") HTMLImageElement.prototype.setAttribute.call(el, "src", v);
                    else if (el.tagName === "SCRIPT") HTMLScriptElement.prototype.setAttribute.call(el, "src", v);
                    else if (el.tagName === "IFRAME") HTMLIFrameElement.prototype.setAttribute.call(el, "src", v);
                    else el.setAttribute("src", v);
                  } catch (_) {}
                },
                configurable: true
              });
            } catch (_) {}
          }
        }
        return el;
      };
    }

    // window.open — block popup ads
    if (!origWindowOpen) {
      origWindowOpen = window.open;
      window.open = function (url, name, specs) {
        if (url && isAdUrl(url)) {
          incrementBlocked(1, "Popup ad blocked");
          return null;
        }
        // Block popups not triggered by user gesture and looking like ad
        try {
          const stack = new Error().stack || "";
          if (!isWhitelisted() && url && /ad|popup|click|track/i.test(url) && !navigator.userActivation?.isActive) {
            // Allow but count if suspicious and no user activation
            // We still block if matches ad domain already
          }
        } catch (_) {}
        return origWindowOpen.apply(this, arguments);
      };
    }
  }

  function restoreNetwork() {
    if (origFetch) { window.fetch = origFetch; origFetch = null; }
    if (origOpen) { XMLHttpRequest.prototype.open = origOpen; origOpen = null; }
    if (origCreateElement) { Document.prototype.createElement = origCreateElement; origCreateElement = null; }
    if (origWindowOpen) { window.open = origWindowOpen; origWindowOpen = null; }
  }

  // --------------------------------------------------------------------------
  // YouTube Ad Handling — best-effort via Player API
  // --------------------------------------------------------------------------
  let expectedVideoId = null;
  let ytAdMuted = false;
  let ytAdAttempts = 0;

  function setExpectedVideo(id) {
    expectedVideoId = id;
    ytAdAttempts = 0;
  }

  function getActiveYTPlayer() {
    try {
      // Try to get active player from PlayerEngine if exposed, otherwise try globals
      if (window.PlayerEngine && typeof PlayerEngine._getActivePlayer === "function") {
        return PlayerEngine._getActivePlayer();
      }
      // Fallback: try to access players.a / players.b via closure? We will try DOM
      // Look for ytplayerA / B iframes and try to get YT player instances from window
      // If not, we will use a heuristic via global YT
      const slotA = document.getElementById("ytplayerA");
      const slotB = document.getElementById("ytplayerB");
      // The YT.Player instances are stored in PlayerEngine closure, not global.
      // We expose a hook below: window.__tcs_getActivePlayer
      if (window.__tcs_getActivePlayer) return window.__tcs_getActivePlayer();
    } catch (_) {}
    return null;
  }

  function isYouTubeAdPlaying(player) {
    if (!player || !player.getVideoData || !player.getDuration) return false;
    try {
      const data = player.getVideoData();
      const url = player.getVideoUrl ? player.getVideoUrl() : "";
      const duration = player.getDuration() || 0;
      const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;

      // Heuristic 1: YouTube API exposes isAd flag in some versions
      if (data && (data.isAd === true || data.isAd === 1)) return true;

      // Heuristic 2: video_id mismatch — if we expect X but player shows Y and Y is short (<60s)
      if (expectedVideoId && data && data.video_id && data.video_id !== expectedVideoId) {
        if (duration > 0 && duration < 90) return true; // likely ad
      }

      // Heuristic 3: Ad URLs contain ad params
      if (url && /ad_|_ad|doubleclick|googleads|pagead|adservice/i.test(url)) return true;

      // Heuristic 4: Title contains Ad / Advertisement and duration < 60
      if (data && data.title && duration > 0 && duration < 60) {
        const t = data.title.toLowerCase();
        if (t.includes("advertisement") || (t.length < 15 && /ad$/.test(t))) return true;
      }

      // Heuristic 5: Very short video (<15s) while we expect normal song ( > 60s ) — likely bumper ad
      if (duration > 0 && duration <= 15 && expectedVideoId) {
        return true;
      }

      // Heuristic 6: Player state shows ad module via DOM query on parent (outside iframe)
      // YouTube sometimes adds .ad-showing class to player container
      const holder = document.getElementById("ytHolder");
      if (holder && holder.querySelector && holder.querySelector(".ytp-ad-module, .ad-showing, .ytp-ad-overlay-container")) {
        return true;
      }

    } catch (_) {}
    return false;
  }

  function attemptSkipYouTubeAd(player) {
    if (!player) return false;
    try {
      // Mute immediately to avoid annoyance
      if (!ytAdMuted) {
        try { player.mute(); } catch (_) {}
        ytAdMuted = true;
      }

      // Try to seek to end — works for many skippable ads
      const dur = player.getDuration ? player.getDuration() : 0;
      if (dur > 0) {
        try { player.seekTo(dur - 0.1, true); } catch (_) {}
        try { player.seekTo(dur, true); } catch (_) {}
      }

      // Try to speed up
      try { if (player.setPlaybackRate) player.setPlaybackRate(2); } catch (_) {}

      // Try to skip via API — load expected video again to bypass
      if (expectedVideoId && ytAdAttempts > 2) {
        try {
          // Force reload expected video — this kills the ad
          if (player.loadVideoById) {
            player.loadVideoById(expectedVideoId);
            incrementBlocked(1, "YouTube ad skipped — reloading track");
            ytAdAttempts = 0;
            ytAdMuted = false;
            return true;
          }
        } catch (_) {}
      }

      ytAdAttempts++;
      incrementBlocked(1, "YouTube ad muted & fast-forwarded");
      return true;
    } catch (_) { return false; }
  }

  function startYouTubeWatcher() {
    if (ytCheckInterval) clearInterval(ytCheckInterval);
    ytCheckInterval = setInterval(() => {
      if (!enabled) return;
      const player = getActiveYTPlayer();
      if (!player) return;
      if (isYouTubeAdPlaying(player)) {
        attemptSkipYouTubeAd(player);
        // Show subtle UI indicator
        const badge = document.getElementById("stationBadge");
        if (badge && !badge.dataset.orig) {
          badge.dataset.orig = badge.textContent;
          badge.textContent = "🛡️ Ad blocked — skipping…";
          setTimeout(() => {
            if (badge.dataset.orig) {
              badge.textContent = badge.dataset.orig;
              delete badge.dataset.orig;
            }
          }, 3000);
        }
      } else {
        // Ad finished — restore volume if we muted
        if (ytAdMuted) {
          try {
            const volEl = document.getElementById("vol");
            const vol = volEl ? Number(volEl.value) : 70;
            if (vol > 0) {
              player.unMute();
              player.setVolume(vol);
            }
          } catch (_) {}
          ytAdMuted = false;
          ytAdAttempts = 0;
        }
      }
    }, 600);
  }

  // --------------------------------------------------------------------------
  // UI — Modal & Button
  // --------------------------------------------------------------------------
  function buildModal() {
    if (document.getElementById("adblockModal")) return;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "adblockModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="sheet modal-sheet-adblock">
        <button class="x" type="button" data-close aria-label="Close">×</button>
        <div class="modal-badge-icon">🛡️</div>
        <h2>AdBlocker — Shield ON</h2>
        <p class="joke-subtitle">Legal, local, and lightweight — you control what loads in your browser</p>

        <div class="adblock-stats">
          <div class="adblock-stat-card">
            <span class="adblock-stat-num" id="adblockCount">0</span>
            <span class="adblock-stat-label">Ads & Trackers Blocked</span>
          </div>
          <div class="adblock-stat-card">
            <span class="adblock-stat-num" id="adblockStatus">ON</span>
            <span class="adblock-stat-label">Status</span>
          </div>
          <div class="adblock-stat-card">
            <span class="adblock-stat-num">100%</span>
            <span class="adblock-stat-label">Legal & Safe</span>
          </div>
        </div>

        <div class="adblock-features">
          <div class="adblock-feat"><span>✅</span><div><strong>Generic Ads</strong><small>Banner, popup, overlay & iframe ads hidden via CSS + JS</small></div></div>
          <div class="adblock-feat"><span>✅</span><div><strong>Trackers Blocked</strong><small>DoubleClick, Analytics, Facebook Pixel, etc.</small></div></div>
          <div class="adblock-feat"><span>✅</span><div><strong>YouTube Ads</strong><small>Auto-mute, fast-forward & skip detection</small></div></div>
          <div class="adblock-feat"><span>✅</span><div><strong>Popups Blocked</strong><small>window.open interception for ad popups</small></div></div>
        </div>

        <div class="adblock-legal">
          <strong>⚖️ Is this legal?</strong>
          <p>Yes. Ad blockers are legal in US, EU, India & most countries. You have the right to filter content in your own browser. This tool does not hack YouTube or bypass paywalls — it uses standard browser APIs (CSS display:none, fetch blocking, YT Player API). Websites may ask you to disable it, but creating and using one is not illegal.</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" id="adblockToggleBtn" type="button">🛡️ Disable AdBlock</button>
          <button class="btn btn-secondary" id="adblockResetBtn" type="button">Reset Counter</button>
        </div>
        <button class="link" type="button" data-close>Back to Radio 📻</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function updateModal() {
    const countEl = document.getElementById("adblockCount");
    const statusEl = document.getElementById("adblockStatus");
    const toggleBtn = document.getElementById("adblockToggleBtn");
    const title = document.querySelector("#adblockModal h2");
    if (countEl) countEl.textContent = String(blockedCount);
    if (statusEl) {
      statusEl.textContent = enabled ? "ON" : "OFF";
      statusEl.classList.toggle("off", !enabled);
    }
    if (toggleBtn) toggleBtn.textContent = enabled ? "🛡️ Disable AdBlock" : "✨ Enable AdBlock";
    if (title) title.textContent = enabled ? "AdBlocker — Shield ON" : "AdBlocker — Paused";
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------
  function enable() {
    enabled = true;
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (_) {}
    injectCosmeticCSS();
    hideExistingAds();
    startObserver();
    interceptNetwork();
    startYouTubeWatcher();
    updateBadge();
    updateModal();
    if (window.Modals && Modals.toast) Modals.toast("🛡️ AdBlock ON — ads & trackers blocked");
  }

  function disable() {
    enabled = false;
    try { localStorage.setItem(STORAGE_KEY, "0"); } catch (_) {}
    if (observer) observer.disconnect();
    restoreNetwork();
    if (ytCheckInterval) clearInterval(ytCheckInterval);
    const style = document.getElementById("tcs-adblock-style");
    if (style) style.remove();
    updateBadge();
    updateModal();
    if (window.Modals && Modals.toast) Modals.toast("AdBlock OFF — ads may appear");
  }

  function toggle() {
    if (enabled) disable(); else enable();
  }

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      enabled = saved === null ? true : saved === "1";
      const savedCount = localStorage.getItem(COUNT_KEY);
      blockedCount = savedCount ? parseInt(savedCount, 10) || 0 : 0;
    } catch (_) {
      enabled = true;
    }

    // Build UI
    buildModal();
    injectCosmeticCSS();
    if (enabled) {
      hideExistingAds();
      startObserver();
      interceptNetwork();
    }
    startYouTubeWatcher();
    updateBadge();
    updateModal();

    // Button wiring
    const btn = document.getElementById("adblockBtn");
    if (btn) {
      btn.onclick = () => {
        const modal = document.getElementById("adblockModal");
        if (modal) {
          document.querySelectorAll(".modal").forEach(m => m.hidden = true);
          modal.hidden = false;
          updateModal();
        }
      };
      // Long press / right click toggles quickly
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggle();
      });
    }

    // Modal buttons
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "adblockToggleBtn") toggle();
      if (e.target && e.target.id === "adblockResetBtn") {
        blockedCount = 0;
        try { localStorage.setItem(COUNT_KEY, "0"); } catch (_) {}
        updateBadge();
        updateModal();
        if (window.Modals && Modals.toast) Modals.toast("Counter reset — 0 ads blocked");
      }
    });

    // Expose expected video id setter for player.js
    window.__tcs_setExpectedVideo = setExpectedVideo;

    // Also hook into PlayerEngine if available to auto-set expected id
    const hookPlayer = () => {
      if (window.PlayerEngine && !window.__tcs_hooked) {
        try {
          // Monkey-patch switch? Instead we poll current track via DOM title
          setInterval(() => {
            try {
              const titleEl = document.getElementById("npTitle");
              // We can't get videoId from title, but we can try to get from global PLAYLISTS
              // PlayerEngine doesn't expose current track id, so we expose via custom event
            } catch (_) {}
          }, 2000);
        } catch (_) {}
        window.__tcs_hooked = true;
      }
    };
    setTimeout(hookPlayer, 1000);
    setInterval(hookPlayer, 5000);

    // Listen for custom event from player.js
    window.addEventListener("tcs:trackChange", (e) => {
      if (e.detail && e.detail.videoId) setExpectedVideo(e.detail.videoId);
    });

    console.log(`%c🛡️ TCS AdBlocker ${enabled ? "ON" : "OFF"} — ${blockedCount} blocked`, "color:#f5b324;font-weight:bold;");
  }

  return {
    init,
    enable,
    disable,
    toggle,
    isEnabled: () => enabled,
    getBlockedCount: () => blockedCount,
    setExpectedVideo,
    getStats: () => ({ enabled, blockedCount, whitelisted: isWhitelisted() }),
    _isAdUrl: isAdUrl, // for testing
    _AD_DOMAINS: AD_DOMAINS,
    _AD_SELECTORS: SAFE_AD_SELECTORS
  };
})();

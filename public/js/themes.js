/* ==========================================================================
   TCS RADIO — THEME ENGINE
   Developed by Umair

   Seven switchable skins (Retro Gold, Synthwave '84, Monsoon Blue, Old Poster,
   Phosphor, Midnight Noir, Chai Daylight) plus a "Station Auto" mode that
   re-tints the active skin to match whichever radio playlist is playing.

   A theme is nothing more than a `data-theme` attribute on <html>: every skin
   re-maps the design tokens in css/variables.css through css/themes.css, so
   the player, drawer, modals and sections all follow along with zero
   per-component theming code.

   Bootstrapping happens from an inline <head> script (see index.html) so the
   saved skin is applied before first paint — no flash of the wrong theme.
   ========================================================================== */

const Themes = (function () {
  const STORE_KEY = "tcs_theme";
  const AUTO_KEY = "tcs_theme_auto";

  /* ------------------------------------------------------------------
     Registry — order defines the switcher order and the "T" cycle order.
     `channels` doubles as the swatch preview in the theme picker.
     ------------------------------------------------------------------ */
  const THEMES = [
    {
      id: "retro",
      name: "Retro Gold",
      emoji: "📻",
      desc: "Classic 2000s amber & mahogany",
      mode: "dark",
      metaColor: "#120904",
      channels: { accent: "245, 179, 36", bg: "#120a05", text: "#fbf1de" },
      fonts: null   // Baloo 2 + Inter are already linked statically in index.html
    },
    {
      id: "synthwave",
      name: "Synthwave '84",
      emoji: "🌆",
      desc: "Neon magenta, cyan grid & scanlines",
      mode: "dark",
      metaColor: "#0c0020",
      channels: { accent: "255, 61, 162", bg: "#0c0020", text: "#ecdfff" },
      fonts: "family=Bungee&family=Chakra+Petch:wght@400;500;600;700&family=Baloo+2:wght@700;800"
    },
    {
      id: "monsoon",
      name: "Monsoon Blue",
      emoji: "🌧️",
      desc: "Late-night rain cinema, cool indigo",
      mode: "dark",
      metaColor: "#060f1c",
      channels: { accent: "96, 165, 250", bg: "#060f1c", text: "#e2f0ff" },
      fonts: "family=Karla:wght@400;500;600;700&family=Baloo+2:wght@700;800"
    },
    {
      id: "poster",
      name: "Old Poster",
      emoji: "🎞️",
      desc: "Hand-painted 70s print, sepia grain",
      mode: "light",
      metaColor: "#f3e3c3",
      channels: { accent: "163, 74, 24", bg: "#f3e3c3", text: "#3a2618" },
      fonts: "family=Yatra+One&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Noto+Serif+Devanagari:wght@600;700"
    },
    {
      id: "phosphor",
      name: "Phosphor",
      emoji: "🟢",
      desc: "Green CRT terminal, scanline glow",
      mode: "dark",
      metaColor: "#03100a",
      channels: { accent: "51, 255, 148", bg: "#03100a", text: "#c6ffdb" },
      fonts: "family=VT323&family=Share+Tech+Mono&family=Noto+Sans+Devanagari:wght@600;700"
    },
    {
      id: "noir",
      name: "Midnight Noir",
      emoji: "🖤",
      desc: "High-contrast black & gold, sharp edges",
      mode: "dark",
      metaColor: "#08080a",
      channels: { accent: "240, 185, 66", bg: "#08080a", text: "#f5f5f5" },
      fonts: "family=Playfair+Display:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@600;700"
    },
    {
      id: "daylight",
      name: "Chai Daylight",
      emoji: "☀️",
      desc: "Bright warm day mode for sunny afternoons",
      mode: "light",
      metaColor: "#fdf4e3",
      channels: { accent: "196, 122, 12", bg: "#fdf4e3", text: "#2e2012" },
      fonts: "family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700"
    }
  ];

  const BY_ID = {};
  THEMES.forEach((t) => (BY_ID[t.id] = t));

  const DEFAULT_THEME = "retro";
  let current = DEFAULT_THEME;
  let autoStation = true;     // tint the skin to match the playing station
  let stationKey = null;      // playlist id the accent is currently tuned to
  let built = false;
  const fontLinks = {};

  /* ------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------ */
  const get = (sel, root) => (root || document).querySelector(sel);
  const storeGet = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const storeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { return false; } };

  function sanitize(id) {
    return BY_ID[id] ? id : DEFAULT_THEME;
  }

  function readStored() {
    // ?theme=synthwave is handy for previews, screenshots and sharing a skin
    try {
      const q = new URLSearchParams(location.search).get("theme");
      if (q && BY_ID[q]) return q;
    } catch (_) {}
    return sanitize(storeGet(STORE_KEY) || DEFAULT_THEME);
  }

  function readAuto() {
    const v = storeGet(AUTO_KEY);
    return v === null ? true : v === "1";
  }

  /* Theme fonts are fetched on demand so the default skin stays as light as
     it is today and no visitor pays for seven font families. */
  function loadFonts(theme) {
    if (!theme.fonts || fontLinks[theme.id]) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + theme.fonts + "&display=swap";
    link.dataset.themeFont = theme.id;
    document.head.appendChild(link);
    fontLinks[theme.id] = link;
  }

  function setMetaColor(hex) {
    const meta = get('meta[name="theme-color"]');
    if (meta && hex) meta.setAttribute("content", hex);
  }

  function syncThemeLabels(theme) {
    if (!theme) return;
    const pill = get("#themePillIcon");
    if (pill) pill.setAttribute("title", theme.name);
    const pillName = get("#themePillName");
    if (pillName) pillName.textContent = theme.name;
    const navBadge = get("#navThemeBadge");
    if (navBadge) navBadge.textContent = autoStation ? `${theme.name} • Station Auto` : `${theme.name} theme`;
  }

  /* ------------------------------------------------------------------
     Applying a theme
     ------------------------------------------------------------------ */
  function paint(themeId, opts) {
    const theme = BY_ID[themeId];
    if (!theme) return;
    const root = document.documentElement;
    const previous = current;

    root.setAttribute("data-theme", theme.id);
    root.setAttribute("data-theme-mode", theme.mode);
    current = theme.id;

    loadFonts(theme);
    setMetaColor(theme.metaColor);

    syncThemeLabels(theme);
    const btn = get("#themeBtn");
    if (btn) {
      btn.title = "Switch theme — current: " + theme.name;
      btn.setAttribute("aria-label", "Switch theme, current theme " + theme.name);
    }

    // Station Auto re-tints the freshly applied skin; with it off (or with no
    // known station) the inline tint is cleared so the theme's own accent wins.
    root.style.removeProperty("--accent-rgb");
    root.style.removeProperty("--pl-glow");
    if (autoStation) syncStationTint();

    markActive();
    storeSet(STORE_KEY, theme.id);

    if (previous !== theme.id) {
      document.dispatchEvent(new CustomEvent("tcs:themechange", {
        detail: { theme: theme.id, mode: theme.mode, auto: autoStation }
      }));
      if (opts && opts.announce && window.Modals && Modals.toast) {
        Modals.toast(theme.emoji + " " + theme.name + " theme on" +
          (autoStation ? " • accent follows the station" : ""));
      }
    }
  }

  function apply(themeId, opts) {
    const o = opts || {};
    const theme = BY_ID[sanitize(themeId)];

    if (o.animate !== false && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("theme-anim");
      clearTimeout(apply._t);
      apply._t = setTimeout(() => document.body.classList.remove("theme-anim"), 700);
    }
    paint(theme.id, o);
  }

  /* Called by the player on every station change. */
  function setStationAccent(accentHex, glow, key) {
    if (key) stationKey = key;
    if (!autoStation || !accentHex) return;
    const root = document.documentElement;
    const rgb = hexToChannels(accentHex);
    if (rgb) root.style.setProperty("--accent-rgb", rgb);
    if (glow) root.style.setProperty("--pl-glow", glow);
  }

  function setAuto(on) {
    autoStation = !!on;
    storeSet(AUTO_KEY, autoStation ? "1" : "0");
    const root = document.documentElement;
    root.style.removeProperty("--accent-rgb");
    root.style.removeProperty("--pl-glow");
    if (autoStation) syncStationTint();
    syncThemeLabels(BY_ID[current]);
    markActive();
  }

  function hexToChannels(hex) {
    if (!hex) return null;
    let h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ");
  }

  function cycle(dir) {
    const ids = THEMES.map((t) => t.id);
    const i = ids.indexOf(current);
    const next = ids[(i + (dir < 0 ? ids.length - 1 : 1)) % ids.length];
    apply(next, { announce: true });
    return next;
  }

  /* ------------------------------------------------------------------
     Switcher UI
     ------------------------------------------------------------------ */
  function build() {
    if (built || !get("#themeBtn")) return;
    built = true;

    // Texture overlay (scanlines / grain / vignette) — themes drive it by token
    if (!get(".fx-overlay")) {
      const fx = document.createElement("div");
      fx.className = "fx-overlay";
      fx.setAttribute("aria-hidden", "true");
      fx.innerHTML = '<div class="fx-vignette"></div>';
      document.body.appendChild(fx);
    }

    const panel = document.createElement("div");
    panel.className = "theme-panel";
    panel.id = "themePanel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Choose a radio theme");
    panel.innerHTML =
      '<div class="theme-panel-head">' +
        '<span class="theme-panel-title">🎨 Radio Theme</span>' +
        '<button class="theme-panel-x" type="button" id="themePanelClose" aria-label="Close theme picker">×</button>' +
      "</div>" +
      '<p class="theme-panel-hint">Skins only change colours, fonts &amp; texture — the music never stops.</p>' +
      '<div class="theme-grid" id="themeGrid" role="radiogroup" aria-label="Theme"></div>' +
      '<label class="theme-auto-row" id="themeAutoRow">' +
        '<input type="checkbox" id="themeAuto" />' +
        "<span>🔁 <strong>Station Auto</strong> — tint the theme to match the playlist you're on</span>" +
      "</label>" +
      '<p class="theme-panel-foot">Shortcut: press <kbd>T</kbd> to cycle themes.</p>';

    const grid = panel.querySelector("#themeGrid");
    grid.innerHTML = THEMES.map((t) =>
      '<button class="theme-card" type="button" role="radio" aria-checked="false" data-theme-id="' + t.id + '">' +
        '<span class="theme-swatch" aria-hidden="true">' +
          '<i style="background:rgb(' + t.channels.accent + ')"></i>' +
          '<i style="background:' + t.channels.bg + '"></i>' +
          '<i style="background:' + t.channels.text + '"></i>' +
        "</span>" +
        '<span class="theme-card-text">' +
          "<strong>" + t.emoji + " " + t.name + "</strong>" +
          "<small>" + t.desc + "</small>" +
        "</span>" +
        '<span class="theme-card-mode">' + (t.mode === "light" ? "☀️" : "🌙") + "</span>" +
      "</button>"
    ).join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".theme-card");
      if (!card) return;
      apply(card.dataset.themeId, { announce: true });
      const btn = get("#themeBtn");
      if (btn) btn.focus();
      close();
    });

    // Arrow-key navigation inside the radio group
    grid.addEventListener("keydown", (e) => {
      const cards = Array.from(grid.querySelectorAll(".theme-card"));
      const i = cards.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        cards[(i + 1) % cards.length].focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        cards[(i - 1 + cards.length) % cards.length].focus();
      } else if (e.key === "Escape") {
        close();
      }
    });

    document.body.appendChild(panel);

    const autoBox = get("#themeAuto");
    if (autoBox) {
      autoBox.checked = autoStation;
      autoBox.addEventListener("change", () => {
        setAuto(autoBox.checked);
        if (window.Modals && Modals.toast) {
          Modals.toast(autoBox.checked
            ? "🔁 Station Auto on — accent follows your playlist"
            : "🎨 Station Auto off — theme keeps its own accent");
        }
      });
    }

    const closeBtn = get("#themePanelClose");
    if (closeBtn) closeBtn.addEventListener("click", () => { close(); const b = get("#themeBtn"); if (b) b.focus(); });
    panel.addEventListener("click", (e) => { if (e.target === panel) close(); });
    document.addEventListener("click", (e) => {
      if (panel.hidden) return;
      if (panel.contains(e.target) || get("#themeBtn").contains(e.target)) return;
      close();
    });

    get("#themeBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      panel.hidden ? open() : close();
    });

    markActive();
  }

  function markActive() {
    document.querySelectorAll(".theme-card").forEach((c) => {
      const on = c.dataset.themeId === current;
      c.classList.toggle("active", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
      c.setAttribute("tabindex", on ? "0" : "-1");
    });
    const autoBox = get("#themeAuto");
    if (autoBox) autoBox.checked = autoStation;
  }

  function open() {
    const panel = get("#themePanel");
    if (!panel) return;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("open"));
    const active = panel.querySelector(".theme-card.active") || panel.querySelector(".theme-card");
    if (active) active.focus();
    get("#themeBtn").setAttribute("aria-expanded", "true");
  }

  function close() {
    const panel = get("#themePanel");
    if (!panel || panel.hidden) return;
    panel.classList.remove("open");
    panel.hidden = true;
    get("#themeBtn").setAttribute("aria-expanded", "false");
  }

  /* ------------------------------------------------------------------
     Boot — runs from the inline head script (pre-paint) and again on DOM
     ready to wire up the switcher.
     ------------------------------------------------------------------ */
  function boot() {
    autoStation = readAuto();
    current = readStored();
    const theme = BY_ID[current];
    const root = document.documentElement;
    root.setAttribute("data-theme", theme.id);
    root.setAttribute("data-theme-mode", theme.mode);
    loadFonts(theme);
    setMetaColor(theme.metaColor);
  }

  function init() {
    boot();
    // From <head> the topbar isn't parsed yet, so wait for it; if the switcher
    // is already in the DOM (deferred include, re-init, SPA-style mount) build
    // straight away and don't rely on readyState.
    if (get("#themeBtn")) {
      ready();
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ready);
    } else {
      ready();
    }
  }

  function ready() {
    // themes.js runs from <head>, before playlists-data.js defines the global
    // `$` helper, so this path deliberately sticks to document.querySelector.
    build();
    paint(current, { animate: false });
    syncStationTint();
  }

  /* Re-tune the accent to the playlist the player restored from storage. */
  function syncStationTint() {
    if (!window.PLAYLISTS) return;
    const key = storeGet("tcs_playlist") || "office";
    const pl = PLAYLISTS[key] || PLAYLISTS.office;
    if (pl) setStationAccent(pl.accent, pl.glow, pl.id);
  }

  return {
    THEMES,
    init,
    boot,
    apply,
    cycle,
    setAuto,
    setStationAccent,
    syncStationTint,
    current: () => current,
    theme: () => BY_ID[current],
    open,
    close
  };
})();

// Apply the saved skin before anything paints when this file is in <head>.
Themes.boot();

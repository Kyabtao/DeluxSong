/* ==========================================================================
   TCS RADIO - AUDIO PLAYER & AUTO-PLAY ENGINE
   Developed by Umair

   Dual-Buffer Gapless Engine:
   Two YouTube players (A/B) run side-by-side. While the ACTIVE player sounds
   the current track, the STANDBY player silently pre-buffers (cues) the next
   track. When the current track ends — on screen, in another tab, or on the
   lock screen — we instantly swap players, so the next song starts with no
   reload wait and no dead air.

   Note on ads: this app itself serves zero ads. Any advert is injected by
   YouTube inside its own embedded stream and cannot be removed, skipped or
   blocked by a website (YouTube Player API ToS). Pre-buffering keeps the
   hand-off instant whenever YouTube does not insert one.
   ========================================================================== */

const PlayerEngine = (function () {
  const SLOTS = ["a", "b"];
  let players = { a: null, b: null };      // YT.Player instances per slot
  let slotReady = { a: false, b: false };  // onReady fired per slot
  let cuedOn = { a: null, b: null };       // videoId each slot has pre-cued
  let activeSlot = "a";

  let currentPlaylistKey = storageGet("tcs_playlist") || "office";
  if (!PLAYLISTS[currentPlaylistKey]) currentPlaylistKey = "office";

  let activePlaylist = PLAYLISTS[currentPlaylistKey].tracks;
  let order = [];
  let pos = 0;
  let shuffle = true;
  let wantPlay = false;
  let userPaused = true;      // true until the listener first presses play
  let tick = null;
  let seeking = false;
  let skips = 0;
  let stallPokes = 0;         // watchdog counter for a wedged player
  let lastVol = 70;
  let activeDrawerFilter = currentPlaylistKey;

  /* ---------- Auto-start on arrival ----------
     The radio begins by itself as soon as the deck is ready. Browsers refuse
     to start *audible* media before the listener has touched the page, but
     they always allow muted media — so if the audible attempt is refused we
     start the song silently and lift the mute on the very first tap. The
     music is running from the first paint either way. */
  let autoStartArmed = true;   // we still owe the listener their first song
  let startedMuted = false;    // the browser held the audio back
  let autoStartCheck = null;
  const AUTOSTART_GRACE = 1600; // ms to wait for an audible start before falling back

  /* ---------- Tiny slot helpers ---------- */
  const standbySlot = () => (activeSlot === "a" ? "b" : "a");
  const active = () => players[activeSlot];
  const activeReady = () => !!(players[activeSlot] && slotReady[activeSlot]);

  /* ---------- Per-playlist hero backdrop (crossfading layers) ----------
     Two <img> layers crossfade. Every request is stamped with a token so a
     slow-loading backdrop that arrives after a newer station change can never
     paint over it — that stale-load race is what used to leave the hero stuck
     on the previous playlist's artwork when stations were switched quickly. */
  const bgLayers = { a: null, b: null };
  let bgNow = "a";
  let bgWanted = null;   // the backdrop the current station wants on screen
  let bgToken = 0;       // increments on every request; only the latest wins

  // Set playlist artwork + accent glow on the hero, crossfading between layers.
  function applyBackground(key) {
    const pl = PLAYLISTS[key];
    if (!pl) return;

    const hero = document.querySelector(".hero");
    if (hero) {
      if (pl.glow) hero.style.setProperty("--pl-glow", pl.glow);
      if (pl.accent) hero.style.setProperty("--pl-accent", pl.accent);
    }

    const url = pl.bg;
    if (!url || !bgLayers.a || !bgLayers.b) return;

    // Already showing (or already on its way to showing) this backdrop.
    if (bgWanted === url) return;
    bgWanted = url;

    const token = ++bgToken;
    const swap = () => {
      if (token !== bgToken) return; // a newer station change has taken over

      // Resolve the layers at paint time, not at request time, so overlapping
      // requests always crossfade from whatever is actually on screen now.
      const toHide = bgLayers[bgNow];
      const toShow = bgLayers[bgNow === "a" ? "b" : "a"];

      toShow.src = url;
      toShow.dataset.src = url;
      toShow.classList.add("in");
      toHide.classList.remove("in");
      toHide.dataset.src = toHide.getAttribute("src") || "";
      bgNow = bgNow === "a" ? "b" : "a";
    };

    const warm = new Image();
    warm.onload = swap;
    warm.onerror = swap; // even if a frame fails, keep the UI moving
    warm.src = url;
    // Cached images can resolve before the handlers are attached in some
    // engines — paint immediately when the decode is already done.
    if (warm.complete) swap();
  }

  // Warm the other playlist backdrops so switching stations is instant.
  function preloadBackgrounds() {
    Object.keys(PLAYLISTS).forEach((key) => {
      const url = PLAYLISTS[key].bg;
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }

  function buildOrder() {
    order = activePlaylist.map((_, i) => i);
    if (shuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
  }

  function currentTrack() {
    return activePlaylist[order[pos]] || activePlaylist[0];
  }

  function setDrawerOpen(isOpen) {
    const drawer = $("#drawer");
    if (drawer) {
      drawer.classList.toggle("open", isOpen);
      drawer.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    const listBtn = $("#listBtn");
    if (listBtn) listBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function updateStationButtons() {
    document.querySelectorAll(".station-btn").forEach((btn) => {
      const isActive = btn.dataset.playlist === currentPlaylistKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function syncDrawerState(renderList = true) {
    const drawerLabel = $("#drawerStnLabel");
    if (drawerLabel) drawerLabel.textContent = PLAYLISTS[activeDrawerFilter].name;

    document.querySelectorAll(".drawer-tab").forEach((tab) => {
      const isViewing = tab.dataset.filter === activeDrawerFilter;
      const isLive = tab.dataset.filter === currentPlaylistKey;
      tab.classList.toggle("active", isViewing);
      tab.classList.toggle("live", isLive);
      tab.setAttribute("aria-pressed", isViewing ? "true" : "false");
      if (isLive) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });

    if (renderList) renderTracks();
  }

  function resetBufferState() {
    cuedOn.a = null;
    cuedOn.b = null;
  }

  function activatePlaylist(playlistKey, opts = {}) {
    if (!PLAYLISTS[playlistKey]) return false;
    currentPlaylistKey = playlistKey;
    activeDrawerFilter = opts.drawerFilter || playlistKey;
    storageSet("tcs_playlist", playlistKey);

    activePlaylist = PLAYLISTS[playlistKey].tracks;
    buildOrder();
    if (opts.resetPosition !== false) pos = 0;
    resetBufferState();

    updateStationButtons();
    syncDrawerState(true);
    updateStationQuote();
    applyBackground(playlistKey);
    return true;
  }

  // The track that SHOULD be waiting pre-buffered on the standby player.
  function peekNextTrack() {
    if (pos >= order.length - 1) return null; // station change — handled by advanceToNextPlaylist
    return activePlaylist[order[pos + 1]] || null;
  }

  /* ==================================================================
     AUTO-START ON ARRIVAL
     ================================================================== */

  // The deck's "tap for sound" prompt. Only ever visible while the browser is
  // holding the audio back — never when the listener muted it themselves.
  function setUnmutePrompt(on) {
    const btn = $("#unmuteBtn");
    if (btn) btn.hidden = !on;
  }

  // Called once the active slot is live. If the browser let the song start out
  // loud, stand down. If it did not, fall back to muted playback — always
  // permitted — and offer sound on the first gesture.
  function scheduleAutoStartCheck() {
    clearTimeout(autoStartCheck);
    autoStartCheck = setTimeout(() => {
      if (!autoStartArmed) return;
      let state = null;
      try { state = active().getPlayerState(); } catch (_) { return; }
      if (state === YT.PlayerState.PLAYING) {
        autoStartArmed = false;      // audible auto-start worked — nothing to do
        return;
      }
      startedMuted = true;
      try { active().mute(); active().playVideo(); } catch (_) {}
      setUnmutePrompt(true);
    }, AUTOSTART_GRACE);
  }

  // Any real gesture unlocks audible media in every browser.
  function onFirstGesture() {
    clearTimeout(autoStartCheck);
    const wasMuted = startedMuted;
    autoStartArmed = false;
    startedMuted = false;
    if (wasMuted) {
      setUnmutePrompt(false);
      applyVolumeTo("a");
      applyVolumeTo("b");
    }
    // Only push play while the listener still wants music. Without this guard a
    // stray tap after a deliberate pause would restart the station.
    if (!userPaused) play();
  }

  function armAutoStart() {
    wantPlay = true;   // onSlotReady turns this into loadTrack(pos, true)

    const EVENTS = ["pointerdown", "touchstart", "keydown"];
    const unarm = () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, unarm));
      onFirstGesture();
    };
    EVENTS.forEach((ev) => window.addEventListener(ev, unarm, { passive: true }));

    const btn = $("#unmuteBtn");
    if (btn) btn.onclick = unarm;
  }

  /* ==================================================================
     YOUTUBE DUAL-BUFFER CORE
     ================================================================== */
  function initYouTubePlayer() {
    window.onYouTubeIframeAPIReady = function () {
      SLOTS.forEach((slot) => {
        players[slot] = new YT.Player(slot === "a" ? "ytplayerA" : "ytplayerB", {
          height: "180",
          width: "320",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            origin: location.origin
          },
          events: {
            onReady: () => onSlotReady(slot),
            onStateChange: (e) => onSlotState(slot, e),
            onError: (e) => onSlotError(slot, e)
          }
        });
      });
    };
  }

  /* Load the YouTube IFrame API asynchronously (the documented pattern). A
     synchronous <script src> here used to block EVERY later module — so one
     stalled third-party request could leave the FAQ empty and the player
     dead. Loading it this way, local UI always boots first. */
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady(); // API already available (tests, warm cache)
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => Modals.toast("Radio engine offline — check your connection and refresh 📻");
    document.head.appendChild(tag);
  }

  function onSlotReady(slot) {
    /* The IFrame API can fire onReady from inside the YT.Player constructor
       (warm cache / already-embedded iframe), i.e. before `players[slot]` has
       been assigned. Carrying on there would make activeReady() false, so the
       opening song would be *cued* instead of played and the radio would sit
       silent with nothing on screen to explain why. Defer one turn instead. */
    if (!players[slot]) {
      setTimeout(() => onSlotReady(slot), 0);
      return;
    }

    slotReady[slot] = true;
    applyVolumeTo(slot);

    if (slot === activeSlot) {
      // Engine is usable as soon as the ACTIVE slot is alive
      const play = wantPlay;
      wantPlay = false;
      loadTrack(pos, play);
      // The opening song was requested before the listener touched anything,
      // so watch whether the browser actually let it start out loud.
      if (play && autoStartArmed) scheduleAutoStartCheck();
    } else {
      // Standby woke up later — give it the next track to pre-buffer
      preloadNext();
    }
  }

  function onSlotState(slot, e) {
    // Only the audible player drives UI, timers and auto-advance.
    // (The standby player stays cued/silent and is ignored here.)
    if (slot !== activeSlot) return;

    if (e.data === YT.PlayerState.ENDED) {
      nextTrack(true);
      return;
    }

    const isPlaying = e.data === YT.PlayerState.PLAYING;
    setPlayingUI(isPlaying);
    BackgroundAudio.setPlaybackState(isPlaying ? "playing" : "paused");

    if (isPlaying) {
      skips = 0;
      stallPokes = 0;
      startTick();
      preloadNext(); // buffer the next melody while this one sings
    }
  }

  function onSlotError(slot, e) {
    const code = e && e.data;

    if (slot !== activeSlot) {
      // Pre-buffer failed on standby — clear the marker so the
      // watchdog / near-end tick retires it quietly. No toast spam.
      cuedOn[slot] = null;
      return;
    }

    if (code === 100 || code === 101 || code === 150) {
      skips++;
      if (skips >= activePlaylist.length) {
        skips = 0;
        advanceToNextPlaylist();
        return;
      }
      Modals.toast("Track unavailable — skipping to next melody…");
      setTimeout(() => nextTrack(false), 600);
      return;
    }
    Modals.toast("Player notification (" + (code || "?") + ") — tuning frequency…");
  }

  /* ---------- Buffering & instant swaps ---------- */

  // Ask the standby player to silently pre-buffer the upcoming track.
  function preloadNext() {
    const nxt = peekNextTrack();
    if (!nxt || !players[standbySlot()] || !slotReady[standbySlot()]) return;
    const st = standbySlot();
    if (cuedOn[st] === nxt.id) return; // already buffered
    try {
      players[st].cueVideoById(nxt.id);
      cuedOn[st] = nxt.id;
    } catch (_) {}
  }

  // Debounced pre-buffer kick used right after any track change.
  let preloadTimer = null;
  function preloadNextSoon() {
    clearTimeout(preloadTimer);
    preloadTimer = setTimeout(preloadNext, 800);
  }

  // Hand audio over to a player that already has this video pre-buffered.
  // This is the gapless path: no reload, near-zero wait.
  function activateSlot(slot) {
    const prev = activeSlot;
    activeSlot = slot;
    stallPokes = 0;

    applyVolumeTo(slot);
    try { players[slot].playVideo(); } catch (_) {}
    if (players[prev] && prev !== slot) {
      try { players[prev].stopVideo(); } catch (_) {}
    }

    cuedOn[slot] = null; // this slot is now PERFORMING, not waiting
    cuedOn[prev] = null;
    updateSlotVisibility();
    preloadNextSoon(); // start buffering the track that follows
  }

  // Cold path: load straight onto the active player (first play, manual
  // pick, previous, or station changes where nothing was pre-buffered).
  function playOnActive(videoId, play) {
    const st = standbySlot();
    cuedOn[st] = null;
    if (play) players[activeSlot].loadVideoById(videoId);
    else players[activeSlot].cueVideoById(videoId);
    updateSlotVisibility();
  }

  function updateSlotVisibility() {
    const elA = document.getElementById("ytSlotA");
    const elB = document.getElementById("ytSlotB");
    if (elA) elA.classList.toggle("on", activeSlot === "a");
    if (elB) elB.classList.toggle("on", activeSlot === "b");
  }

  function applyVolumeTo(slot) {
    const p = players[slot];
    if (!p || !slotReady[slot]) return;
    const v = Number($("#vol").value);
    try {
      p.setVolume(v);
      if (v === 0) p.mute(); else p.unMute();
    } catch (_) {}
  }

  /* ==================================================================
     TRACK LIFECYCLE
     ================================================================== */
  function loadTrack(i, play) {
    pos = (i + order.length) % order.length;
    const t = currentTrack();
    if (!t) return;

    $("#npTitle").textContent = t.title;
    $("#npCredit").textContent = t.credit;
    $("#stationBadge").textContent = PLAYLISTS[currentPlaylistKey].badge;

    const counter = $("#trackCounter");
    if (counter) counter.textContent = `Track ${pos + 1} / ${order.length}`;

    document.title = (play ? "▶ " : "") + t.title + " — TCS Radio";
    renderTracks();

    // Update Lock Screen & Control Center media metadata
    BackgroundAudio.updateMediaSession(t, PLAYLISTS[currentPlaylistKey].name);

    if (!activeReady()) {
      wantPlay = play;
      return;
    }

    if (play) userPaused = false;

    const st = standbySlot();
    if (play && players[st] && slotReady[st] && cuedOn[st] === t.id) {
      activateSlot(st);            // ← gapless: next song was pre-buffered
    } else {
      playOnActive(t.id, play);    // ← cold start fallback
      preloadNextSoon();
    }
  }

  function setPlayingUI(on) {
    const playBtn = $("#play");
    if (!playBtn) return;
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.title = on ? "Pause Track (Space)" : "Play Track (Space)";
    playBtn.classList.toggle("playing", on);
    $("#disc").classList.toggle("spin", on);
    const reelA = $("#reelA");
    const reelB = $("#reelB");
    if (reelA) reelA.classList.toggle("spin", on);
    if (reelB) reelB.classList.toggle("spin", on);
  }

  function startTick() {
    clearInterval(tick);
    tick = setInterval(() => {
      if (!activeReady() || seeking) return;
      let d = 0, c = 0;
      try {
        d = active().getDuration() || 0;
        c = active().getCurrentTime() || 0;
      } catch (_) { return; }
      $("#cur").textContent = fmt(c);
      $("#dur").textContent = fmt(d);
      if (d) {
        const pct = Math.round((c / d) * 1000) / 10;
        $("#seek").value = Math.round((c / d) * 1000);
        $("#seek").style.setProperty("--seek-pct", pct + "%");
      }

      BackgroundAudio.setPositionState(d, c);

      // Near-end safety net: make sure the next track is buffered even if
      // an earlier preload attempt was throttled in a background tab.
      if (d && d - c < 25) preloadNext();
    }, 500);
  }

  /* ==================================================================
     BACKGROUND WATCHDOG
     Browsers throttle background tabs; a wedged or never-started player
     would otherwise leave the radio silent. While the listener wants
     music, gently poke a stalled player — and hard-reload it only as a
     last resort.
     ================================================================== */
  function watchPlayback() {
    if (userPaused || !players.a) return;
    preloadNext(); // keep the pipeline fed — cheap when already buffered
    if (!activeReady()) return;

    let state;
    try { state = active().getPlayerState(); } catch (_) { return; }

    const IDLE = [YT.PlayerState.UNSTARTED, YT.PlayerState.PAUSED, YT.PlayerState.CUED];
    if (IDLE.indexOf(state) !== -1) {
      stallPokes++;
      try { active().playVideo(); } catch (_) {}
      if (stallPokes > 5) {
        // Player never woke up — reload the same track once.
        stallPokes = 0;
        const t = currentTrack();
        if (t) { try { active().loadVideoById(t.id); } catch (_) {} }
      }
    } else if (state === YT.PlayerState.PLAYING) {
      stallPokes = 0;
    }
  }
  setInterval(watchPlayback, 4000);

  /* ---------------- Playlist Completion & Auto-Play Next ---------------- */
  function advanceToNextPlaylist() {
    const playlistKeys = Object.keys(PLAYLISTS);
    const nextIdx = (playlistKeys.indexOf(currentPlaylistKey) + 1) % playlistKeys.length;
    const nextKey = playlistKeys[nextIdx];

    Modals.toast(`📻 ${PLAYLISTS[currentPlaylistKey].name} completed! Auto-playing: ${PLAYLISTS[nextKey].name} ✨`);
    switchPlaylist(nextKey, true);
  }

  function nextTrack(isEndedEvent = false) {
    if (pos >= order.length - 1) {
      advanceToNextPlaylist();
      return;
    }
    loadTrack(pos + 1, true);
  }

  function prevTrack() {
    if (activeReady()) {
      try {
        if (active().getCurrentTime() > 4) {
          active().seekTo(0, true);
          return;
        }
      } catch (_) {}
    }
    loadTrack(pos - 1, true);
  }

  function togglePlay() {
    if (!activeReady()) {
      wantPlay = true;
      Modals.toast(window.YT && window.YT.Player ? "📻 Tuning TCS Radio frequency…" : "Warming up player… please wait.");
      return;
    }
    const s = active().getPlayerState();
    if (s === YT.PlayerState.PLAYING) pause();
    else play();
  }

  function play() {
    userPaused = false;
    if (activeReady()) active().playVideo();
    else wantPlay = true;
  }

  function pause() {
    userPaused = true;
    if (activeReady()) active().pauseVideo();
  }

  function seekTo(seconds) {
    if (activeReady()) active().seekTo(seconds, true);
  }

  function toggleShuffle() {
    shuffle = !shuffle;
    $("#shuffle").classList.toggle("on", shuffle);
    const keep = currentTrack();
    buildOrder();
    pos = Math.max(0, order.indexOf(activePlaylist.indexOf(keep)));
    renderTracks();
    // Order changed — whatever was buffered is no longer the "next" song
    cuedOn[standbySlot()] = null;
    preloadNextSoon();
    Modals.toast(shuffle ? "🔀 Shuffle On" : "🔁 Playing in playlist order");
  }

  function switchPlaylist(playlistKey, shouldPlay = true) {
    if (!activatePlaylist(playlistKey)) return;
    loadTrack(0, shouldPlay);
  }

  function renderTracks() {
    const ol = $("#tracks");
    if (!ol) return;
    ol.innerHTML = "";

    const displayList = PLAYLISTS[activeDrawerFilter].tracks;
    const isCurrentActiveStation = activeDrawerFilter === currentPlaylistKey;

    displayList.forEach((track, i) => {
      const li = document.createElement("li");
      const isPlayingThis = isCurrentActiveStation && (activePlaylist[order[pos]] && activePlaylist[order[pos]].id === track.id);

      li.innerHTML = `<i>${String(i + 1).padStart(2, "0")}</i><span>${track.title}</span>`;
      if (isPlayingThis) li.classList.add("active");

      li.onclick = () => {
        if (activeDrawerFilter !== currentPlaylistKey) {
          activatePlaylist(activeDrawerFilter, { drawerFilter: activeDrawerFilter });
        }

        const targetIdx = order.indexOf(i);
        loadTrack(targetIdx !== -1 ? targetIdx : i, true);
        setDrawerOpen(false);
      };
      ol.appendChild(li);
    });
  }

  function buildDrawerTabs() {
    const container = $("#drawerTabs");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(PLAYLISTS).forEach((key) => {
      const p = PLAYLISTS[key];
      const btn = document.createElement("button");
      btn.className = "drawer-tab";
      btn.dataset.filter = key;
      btn.type = "button";
      btn.innerHTML = `<span class="drawer-tab-name">${p.name}</span><small>${p.tracks.length} tracks</small>`;
      btn.title = `${p.name} • ${p.tracks.length} tracks`;
      btn.onclick = () => {
        if (key === currentPlaylistKey) {
          // Re-browsing the live station just re-syncs the sidebar to it.
          activeDrawerFilter = key;
          syncDrawerState(true);
          return;
        }
        // Tuning to a different station switches the playlist immediately —
        // music, badge, accent and the hero backdrop all follow together.
        switchPlaylist(key, true);
        Modals.toast(`📻 Switched to ${p.name} Mode`);
      };
      container.appendChild(btn);
    });

    syncDrawerState(false);
  }

  let quoteIdx = 0;
  function updateStationQuote() {
    const q = $("#quote");
    if (!q) return;
    const quotes = PLAYLISTS[currentPlaylistKey].quotes;
    quoteIdx = (quoteIdx + 1) % quotes.length;
    q.style.opacity = 0;
    setTimeout(() => {
      q.textContent = quotes[quoteIdx];
      q.style.opacity = 0.95;
    }, 350);
  }

  function init() {
    buildOrder();
    buildDrawerTabs();
    updateStationButtons();

    // Set up the crossfading playlist backdrops
    bgLayers.a = document.getElementById("bgA");
    bgLayers.b = document.getElementById("bgB");
    if (bgLayers.a) {
      bgLayers.a.dataset.src = bgLayers.a.getAttribute("src") || "";
      bgNow = bgLayers.a.classList.contains("in") ? "a" : "b";
    }
    if (bgLayers.b) bgLayers.b.dataset.src = bgLayers.b.getAttribute("src") || "";
    // Whatever the markup ships as the visible layer is the backdrop we are
    // already showing, so a same-station boot does not fade to itself.
    bgWanted = bgLayers[bgNow] ? bgLayers[bgNow].dataset.src || null : null;
    applyBackground(currentPlaylistKey);
    setTimeout(preloadBackgrounds, 600);

    // Arm the auto-start before the API loads — loadYouTubeAPI() can fire
    // onReady synchronously on a warm cache, and wantPlay must already be set
    // by then for the opening song to be requested.
    armAutoStart();

    initYouTubePlayer();
    loadYouTubeAPI();
    updateSlotVisibility();

    // Setup Background Audio MediaSession controls
    BackgroundAudio.setupActionHandlers({
      onPlay: play,
      onPause: pause,
      onPrev: prevTrack,
      onNext: () => nextTrack(false),
      onSeek: (time) => seekTo(time)
    });

    // Seek input handlers
    $("#seek").addEventListener("input", () => (seeking = true));
    $("#seek").addEventListener("change", (e) => {
      seeking = false;
      if (activeReady()) {
        const d = active().getDuration() || 0;
        seekTo((e.target.value / 1000) * d);
      }
    });

    // Volume input handlers (applied to BOTH buffer slots)
    $("#vol").oninput = (e) => {
      const v = Number(e.target.value);
      if (v > 0) lastVol = v;
      applyVolumeTo("a");
      applyVolumeTo("b");
      const icon = $("#volIcon");
      if (v === 0) icon.textContent = "🔇";
      else if (v < 45) icon.textContent = "🔉";
      else icon.textContent = "🔊";
      storageSet("tcs_vol", v);
    };

    $("#volBtn").onclick = () => {
      const curVal = Number($("#vol").value);
      if (curVal > 0) {
        lastVol = curVal;
        $("#vol").value = 0;
        $("#vol").dispatchEvent(new Event("input"));
        Modals.toast("Muted 🔇");
      } else {
        $("#vol").value = lastVol || 70;
        $("#vol").dispatchEvent(new Event("input"));
        Modals.toast("Unmuted 🔊");
      }
    };

    const savedVol = storageGet("tcs_vol");
    if (savedVol !== null) {
      $("#vol").value = savedVol;
      $("#vol").dispatchEvent(new Event("input"));
    }

    // Video toggle (Default mini/hidden)
    const savedMini = storageGet("tcs_mini");
    const isMini = savedMini === null ? true : savedMini === "1";

    if (isMini) {
      $("#player").classList.add("mini");
      $("#videoBtn").classList.remove("on");
      $("#videoBtn").title = "Show Video (📺)";
    } else {
      $("#player").classList.remove("mini");
      $("#videoBtn").classList.add("on");
      $("#videoBtn").title = "Hide Video (📺)";
    }

    $("#videoBtn").onclick = (e) => {
      const mini = $("#player").classList.toggle("mini");
      e.currentTarget.classList.toggle("on", !mini);
      storageSet("tcs_mini", mini ? "1" : "0");
      e.currentTarget.title = mini ? "Show Video (📺)" : "Hide Video (📺)";
      Modals.toast(mini ? "Video hidden — audio-only radio mode 📻" : "Video player visible 📺");
    };

    // Deck size toggle: collapse the whole deck into a one-line micro bar.
    // Only the .dock class flips — every zone stays in the DOM, so the spin
    // hooks, the seek fill and the video slots keep working while docked.
    const setDock = (dock, announce) => {
      $("#player").classList.toggle("dock", dock);
      const btn = $("#dockBtn");
      btn.classList.toggle("on", dock);
      btn.textContent = dock ? "🎛️" : "📻";
      btn.title = dock ? "Expand Player (D)" : "Minimize Player (D)";
      btn.setAttribute("aria-label", dock ? "Expand the player" : "Minimize the player to a micro bar");
      btn.setAttribute("aria-expanded", dock ? "false" : "true");
      if (announce) {
        storageSet("tcs_dock", dock ? "1" : "0");
        Modals.toast(dock ? "Deck minimized — micro radio bar 📻" : "Full deck restored 🎛️");
      }
    };
    setDock(storageGet("tcs_dock") === "1", false);
    $("#dockBtn").onclick = () => setDock($("#player").classList.toggle("dock"), true);

    // Hero station switchers
    document.querySelectorAll(".station-btn").forEach((btn) => {
      btn.onclick = () => {
        const key = btn.dataset.playlist;
        if (key !== currentPlaylistKey) {
          switchPlaylist(key, true);
          Modals.toast(`📻 Switched to ${PLAYLISTS[key].name} Mode`);
        }
      };
    });

    // Control buttons — always visible and ready from the first load.
    $("#play").onclick = togglePlay;
    $("#next").onclick = () => nextTrack(false);
    $("#prev").onclick = prevTrack;
    $("#shuffle").onclick = toggleShuffle;

    // Drawer toggles — playlist browsing happens in the sidebar; it opens
    // with the ☰ button on the player deck.
    const openDrawer = () => {
      activeDrawerFilter = currentPlaylistKey;
      syncDrawerState(true);
      setDrawerOpen(true);
    };

    const listBtn = $("#listBtn");
    if (listBtn) {
      listBtn.title = "Open Playlist Sidebar";
      listBtn.setAttribute("aria-label", "Open Playlist Sidebar");
      listBtn.onclick = openDrawer;
    }

    const drawerClose = $("#drawerClose");
    if (drawerClose) drawerClose.onclick = () => setDrawerOpen(false);

    // Rotating quotes
    setInterval(updateStationQuote, 7000);
  }

  return {
    init,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    switchPlaylist
  };
})();

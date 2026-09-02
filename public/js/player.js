/* ==========================================================================
   TCS RADIO - AUDIO PLAYER & AUTO-PLAY ENGINE
   Developed by Umair
   ========================================================================== */

const PlayerEngine = (function () {
  let yt = null;
  let ready = false;
  let currentPlaylistKey = storageGet("tcs_playlist") || "office";
  if (!PLAYLISTS[currentPlaylistKey]) currentPlaylistKey = "office";

  let activePlaylist = PLAYLISTS[currentPlaylistKey].tracks;
  let order = [];
  let pos = 0;
  let shuffle = true;
  let wantPlay = false;
  let tick = null;
  let seeking = false;
  let skips = 0;
  let lastVol = 70;
  let activeDrawerFilter = currentPlaylistKey;

  /* ---------- Per-playlist hero backdrop (crossfading layers) ---------- */
  const bgLayers = { a: null, b: null };
  let bgNow = "a";

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
    const showLayer = bgLayers[bgNow];
    if (showLayer.dataset.src === url) return; // already showing this backdrop

    const toShow = bgLayers[bgNow === "a" ? "b" : "a"];
    const toHide = bgLayers[bgNow];

    const warm = new Image();
    const swap = () => {
      toShow.src = url;
      toShow.dataset.src = url;
      requestAnimationFrame(() => {
        toShow.classList.add("in");
        toHide.classList.remove("in");
        bgNow = bgNow === "a" ? "b" : "a";
      });
    };
    warm.onload = swap;
    warm.onerror = swap; // even if a frame fails, keep the UI moving
    warm.src = url;
  }

  // Warm the other five playlist backdrops so switching is instant.
  function preloadThemeBackgrounds() {
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

  function initYouTubePlayer() {
    window.onYouTubeIframeAPIReady = function () {
      yt = new YT.Player("ytplayer", {
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
          onReady: () => {
            ready = true;
            yt.setVolume(Number($("#vol").value));
            const play = wantPlay;
            wantPlay = false;
            loadTrack(pos, play);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              nextTrack(true);
            }
            
            const isPlaying = e.data === YT.PlayerState.PLAYING;
            setPlayingUI(isPlaying);
            BackgroundAudio.setPlaybackState(isPlaying ? "playing" : "paused");

            if (isPlaying) {
              skips = 0;
              startTick();
            }
          },
          onError: (e) => {
            const code = e && e.data;
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
        }
      });
    };
  }

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

    if (!ready) {
      wantPlay = play;
      return;
    }

    if (play) yt.loadVideoById(t.id);
    else yt.cueVideoById(t.id);
  }

  function setPlayingUI(on) {
    const playBtn = $("#play");
    if (!playBtn) return;
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.title = on ? "Pause Track (Space)" : "Play Track (Space)";
    playBtn.classList.toggle("playing", on);
    $("#disc").classList.toggle("spin", on);
  }

  function startTick() {
    clearInterval(tick);
    tick = setInterval(() => {
      if (!ready || seeking) return;
      const d = yt.getDuration() || 0, c = yt.getCurrentTime() || 0;
      $("#cur").textContent = fmt(c);
      $("#dur").textContent = fmt(d);
      if (d) $("#seek").value = Math.round((c / d) * 1000);

      BackgroundAudio.setPositionState(d, c);
    }, 500);
  }

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
    if (ready && yt.getCurrentTime() > 4) {
      yt.seekTo(0);
      return;
    }
    loadTrack(pos - 1, true);
  }

  function togglePlay() {
    if (!ready) {
      wantPlay = true;
      Modals.toast(window.YT && window.YT.Player ? "📻 Tuning TCS Radio frequency…" : "Warming up player… please wait.");
      return;
    }
    const s = yt.getPlayerState();
    if (s === YT.PlayerState.PLAYING) yt.pauseVideo();
    else yt.playVideo();
  }

  function play() {
    if (ready) yt.playVideo();
    else wantPlay = true;
  }

  function pause() {
    if (ready) yt.pauseVideo();
  }

  function seekTo(seconds) {
    if (ready) yt.seekTo(seconds, true);
  }

  function toggleShuffle() {
    shuffle = !shuffle;
    $("#shuffle").classList.toggle("on", shuffle);
    const keep = currentTrack();
    buildOrder();
    pos = Math.max(0, order.indexOf(activePlaylist.indexOf(keep)));
    renderTracks();
    Modals.toast(shuffle ? "🔀 Shuffle On" : "🔁 Playing in playlist order");
  }

  function switchPlaylist(playlistKey, shouldPlay = true) {
    if (!PLAYLISTS[playlistKey]) return;
    currentPlaylistKey = playlistKey;
    activeDrawerFilter = playlistKey;
    storageSet("tcs_playlist", playlistKey);

    activePlaylist = PLAYLISTS[playlistKey].tracks;
    buildOrder();
    pos = 0;

    // Update switcher buttons in hero
    document.querySelectorAll(".station-btn").forEach((btn) => {
      const isActive = btn.dataset.playlist === playlistKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });

    // Update drawer active label & tabs
    const drawerLabel = $("#drawerStnLabel");
    if (drawerLabel) drawerLabel.textContent = PLAYLISTS[playlistKey].name;

    document.querySelectorAll(".drawer-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.filter === playlistKey);
    });

    updateStationQuote();
    applyBackground(playlistKey);
    loadTrack(0, shouldPlay && ready);
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
          currentPlaylistKey = activeDrawerFilter;
          storageSet("tcs_playlist", currentPlaylistKey);
          activePlaylist = PLAYLISTS[currentPlaylistKey].tracks;
          buildOrder();

          document.querySelectorAll(".station-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.playlist === currentPlaylistKey);
          });
          updateStationQuote();
          applyBackground(currentPlaylistKey);
        }

        const targetIdx = order.indexOf(i);
        loadTrack(targetIdx !== -1 ? targetIdx : i, true);
        $("#drawer").classList.remove("open");
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
      btn.className = "drawer-tab" + (key === activeDrawerFilter ? " active" : "");
      btn.dataset.filter = key;
      btn.textContent = p.name;
      btn.onclick = () => {
        document.querySelectorAll(".drawer-tab").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        activeDrawerFilter = key;
        const drawerLabel = $("#drawerStnLabel");
        if (drawerLabel) drawerLabel.textContent = PLAYLISTS[activeDrawerFilter].name;
        renderTracks();
      };
      container.appendChild(btn);
    });
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

    // Set up the crossfading playlist backdrops
    bgLayers.a = document.getElementById("bgA");
    bgLayers.b = document.getElementById("bgB");
    if (bgLayers.a) {
      bgLayers.a.dataset.src = bgLayers.a.getAttribute("src") || "";
      bgNow = bgLayers.a.classList.contains("in") ? "a" : "b";
    }
    if (bgLayers.b) bgLayers.b.dataset.src = bgLayers.b.getAttribute("src") || "";
    applyBackground(currentPlaylistKey);
    setTimeout(preloadThemeBackgrounds, 600);

    initYouTubePlayer();

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
      if (ready) {
        const d = yt.getDuration() || 0;
        seekTo((e.target.value / 1000) * d);
      }
    });

    // Volume input handlers
    $("#vol").oninput = (e) => {
      const v = Number(e.target.value);
      if (v > 0) lastVol = v;
      if (ready) {
        yt.setVolume(v);
        if (v === 0) yt.mute(); else yt.unMute();
      }
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

    // Control buttons
    $("#play").onclick = togglePlay;
    $("#next").onclick = () => nextTrack(false);
    $("#prev").onclick = prevTrack;
    $("#shuffle").onclick = toggleShuffle;

    // Drawer toggles
    $("#listBtn").onclick = () => {
      activeDrawerFilter = currentPlaylistKey;
      document.querySelectorAll(".drawer-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.filter === currentPlaylistKey);
      });
      const drawerLabel = $("#drawerStnLabel");
      if (drawerLabel) drawerLabel.textContent = PLAYLISTS[currentPlaylistKey].name;
      renderTracks();
      $("#drawer").classList.toggle("open");
    };
    $("#drawerClose").onclick = () => $("#drawer").classList.remove("open");

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

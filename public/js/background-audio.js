/* ==========================================================================
   TCS RADIO - BACKGROUND PLAYBACK & MEDIA SESSION CONTROLLER
   Developed by Umair
   ========================================================================== */

const BackgroundAudio = (function () {
  let silentAudioEl = null;
  let isKeepAliveActive = false;

  // Initialize a silent background audio element for mobile & desktop keep-alive
  function initKeepAliveAudio() {
    if (silentAudioEl) return;
    try {
      // 1-second silent WAV base64 loop
      const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
      silentAudioEl = new Audio(silentWav);
      silentAudioEl.loop = true;
      silentAudioEl.volume = 0.01;
      silentAudioEl.setAttribute("playsinline", "true");
      silentAudioEl.setAttribute("webkit-playsinline", "true");
    } catch (e) {
      console.warn("Silent audio keepalive initialization:", e);
    }
  }

  function startKeepAlive() {
    if (!silentAudioEl) initKeepAliveAudio();
    if (silentAudioEl && !isKeepAliveActive) {
      silentAudioEl.play().then(() => {
        isKeepAliveActive = true;
      }).catch(() => {
        // Ignored on initial autoplay restrictions; activated on user gesture
      });
    }
  }

  function pauseKeepAlive() {
    if (silentAudioEl && isKeepAliveActive) {
      silentAudioEl.pause();
      isKeepAliveActive = false;
    }
  }

  // Update Media Session API for Lock Screen & Control Center
  function updateMediaSession(track, playlistName) {
    if (!("mediaSession" in navigator) || !track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: `${track.credit || "2000s Bollywood"} • ${playlistName || "TCS Radio"}`,
        album: "TCS Radio — 2000s Nostalgia",
        artwork: [
          { src: "img/tcs-icon.png", sizes: "96x96", type: "image/png" },
          { src: "img/tcs-icon.png", sizes: "128x128", type: "image/png" },
          { src: "img/tcs-icon.png", sizes: "192x192", type: "image/png" },
          { src: "img/tcs-icon.png", sizes: "512x512", type: "image/png" }
        ]
      });
    } catch (e) {
      console.warn("MediaSession metadata error:", e);
    }
  }

  function setPlaybackState(state) {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state; // 'playing' | 'paused' | 'none'
      if (state === "playing") {
        startKeepAlive();
      } else {
        pauseKeepAlive();
      }
    } catch (e) {}
  }

  function setPositionState(duration, position) {
    if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      if (duration && duration > 0 && position >= 0 && position <= duration) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 1),
          playbackRate: 1,
          position: Math.min(position, duration)
        });
      }
    } catch (e) {}
  }

  function setupActionHandlers(callbacks) {
    if (!("mediaSession" in navigator)) return;

    const actionMap = {
      play: callbacks.onPlay,
      pause: callbacks.onPause,
      previoustrack: callbacks.onPrev,
      nexttrack: callbacks.onNext,
      stop: callbacks.onPause,
      seekto: (details) => {
        if (details.seekTime !== undefined && callbacks.onSeek) {
          callbacks.onSeek(details.seekTime);
        }
      }
    };

    Object.keys(actionMap).forEach((action) => {
      try {
        if (actionMap[action]) {
          navigator.mediaSession.setActionHandler(action, actionMap[action]);
        }
      } catch (e) {}
    });
  }

  // Prevent background tab throttling from terminating playback
  document.addEventListener("visibilitychange", () => {
    // We intentionally keep the player running when document.hidden === true
    if (!document.hidden && isKeepAliveActive && silentAudioEl) {
      // Resume if needed
      if (silentAudioEl.paused) silentAudioEl.play().catch(() => {});
    }
  });

  return {
    init: initKeepAliveAudio,
    startKeepAlive,
    pauseKeepAlive,
    updateMediaSession,
    setPlaybackState,
    setPositionState,
    setupActionHandlers
  };
})();

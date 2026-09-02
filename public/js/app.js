/* ==========================================================================
   TCS RADIO - MASTER APPLICATION CONTROLLER
   Developed by Umair
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Background Audio Session
  BackgroundAudio.init();

  // Initialize Modals & Dialogs
  Modals.init();

  // Initialize Audio Player Engine
  PlayerEngine.init();

  // Monsoon Baarish Ambience Controls
  $("#rainBtn").onclick = (e) => {
    const isPlaying = RainAmbient.toggle($("#rainVol").value);
    e.currentTarget.classList.toggle("on", isPlaying);
    $("#rainRow").hidden = !isPlaying;
    Modals.toast(isPlaying ? "🌧️ Baarish on — Garam chai aur purane gaane ☕" : "Baarish sound off");
  };

  $("#rainVol").oninput = (e) => {
    RainAmbient.setVolume(e.target.value);
  };

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select|button)$/i.test(t.tagName))) return;
    if (e.code === "Space") {
      e.preventDefault();
      PlayerEngine.togglePlay();
    }
    if (e.code === "ArrowRight") PlayerEngine.nextTrack(false);
    if (e.code === "ArrowLeft") PlayerEngine.prevTrack();
    if (e.key === "m" || e.key === "M") $("#volBtn").click();
    if (e.key === "s" || e.key === "S") $("#shuffle").click();
  });

  // Share Button
  $("#shareBtn").onclick = async () => {
    const data = {
      title: "TCS Radio — 2000s Retro Indian Radio by Umair",
      text: "Tune into TCS Radio by Umair — nonstop 2000s Bollywood nostalgia with Office, Auto, Truck, and Monsoon playlists! 📻🏢🛺🚚",
      url: location.href
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(location.href);
        Modals.toast("🔗 Link copied to clipboard! Share the nostalgia ❤️");
      } catch (_) {
        Modals.toast("Share TCS Radio: " + location.href);
      }
    }
  };

  // PWA Install Prompt
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!storageGet("tcs_install_x")) $("#install").hidden = false;
  });

  $("#installBtn").onclick = async () => {
    if (!deferredPrompt) {
      Modals.toast("📱 Use your browser menu → Add to Home Screen");
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#install").hidden = true;
  };

  $("#installClose").onclick = () => {
    $("#install").hidden = true;
    storageSet("tcs_install_x", "1");
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});

/* ==========================================================================
   TCS RADIO - MODALS, DIALOGS & NOTIFICATION TOASTS
   Developed by Umair
   ========================================================================== */

const Modals = (function () {
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._t);
    t._t = setTimeout(() => (t.hidden = true), 3400);
  }

  function open(id) {
    document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
    const el = $(id);
    if (el) el.hidden = false;
  }

  function dismiss(modal) {
    if (!modal) return;
    modal.hidden = true;
  }

  function init() {
    // Dismiss on data-close and backdrop clicks
    document.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", (e) => dismiss(e.target.closest(".modal"))));

    document.querySelectorAll(".modal").forEach((m) =>
      m.addEventListener("click", (e) => {
        if (e.target === m) dismiss(m);
      }));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal:not([hidden])").forEach(dismiss);
      }
    });

    // Support Modal triggers
    $("#supportBtn").onclick = () => open("#supportModal");
    $("#supportLink").onclick = (e) => {
      e.preventDefault();
      open("#supportModal");
    };
    $("#chaiLoveBtn").onclick = () => {
      dismiss($("#supportModal"));
      toast("❤️ Dil se bohot bohot shukriya from Umair! Aapka pyaar hamesha bana rahe! ☕✨");
    };

    // Careers Joke Modal triggers
    $("#earnBtn").onclick = () => open("#earnModal");
    $("#applyJokeBtn").onclick = () => {
      dismiss($("#earnModal"));
      toast("🎉 Timesheet submitted! Hot cutting chai & samosa is on the way ☕🥟😂");
    };

    // Song Add / Removal Connect Modal triggers
    $("#requestBtn").onclick = () => open("#requestModal");
    $("#requestFooterLink").onclick = (e) => {
      e.preventDefault();
      open("#requestModal");
    };

    const drawerConnect = $("#drawerConnectBtn");
    if (drawerConnect) {
      drawerConnect.onclick = () => {
        $("#drawer").classList.remove("open");
        open("#requestModal");
      };
    }

    // Connect form submit
    $("#requestForm").onsubmit = (e) => {
      e.preventDefault();
      const type = $("#reqType").value;
      const name = $("#reqName").value.trim();
      const song = $("#reqSong").value.trim();

      dismiss($("#requestModal"));

      if (type === "remove") {
        toast(`🛡️ Thank you ${name || "Creator"}! Your removal request has been received. Umair will verify and remove it within 24 hours.`);
      } else {
        toast(`🎵 Thank you ${name}! Your song suggestion (${song}) has been sent directly to Umair.`);
      }

      $("#requestForm").reset();
    };

    // Render FAQ Accordion
    const acc = $("#acc");
    if (acc) {
      acc.innerHTML = FAQ_DATA.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");
    }

    // Gentle support prompt
    let supportTimer = null;
    function maybeSupport() {
      if (sessionGet("tcs_support")) return;
      const busy = document.querySelector(".modal:not([hidden])");
      if (document.hidden || busy) {
        supportTimer = setTimeout(maybeSupport, 15000);
        return;
      }
      open("#supportModal");
      sessionSet("tcs_support", "1");
    }
    supportTimer = setTimeout(maybeSupport, 70000);
  }

  return {
    init,
    open,
    dismiss,
    toast
  };
})();

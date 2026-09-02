/* ==========================================================================
   TCS RADIO - MODALS, DIALOGS & NOTIFICATION TOASTS
   Enhanced Connect Form: type-aware, draft save, validation, success panel
   Developed by Umair
   ========================================================================== */

const Modals = (function () {
  const REQ_DRAFT_KEY = "tcs_req_draft";
  const MAX_MSG = 500;

  const REQ_META = {
    add: {
      typeName: "Add Song",
      submit: "🚀 Send Add Request",
      songLabel: "Song title &amp; YouTube link to add",
      songPlaceholder: "e.g. KK — Kya Mujhe Pyaar Hai (YouTube link)",
      hint: "Suggest an iconic 2000s melody — we'll add it to the right playlist. 🎧",
      successTitle: "Song suggestion received! 🎵",
      successBody: (name, song) =>
        `Thanks ${name}! “${song}” is queued for Umair — if it fits the 2000s vibe, it lands on the radio soon.`,
      copyBody: (name, song, msg) =>
        `TCS Radio request — Add Song\n👤 ${name}\n🎵 ${song}\n💬 ${msg || "—"}`,
      requires: { name: true, song: true, message: false }
    },
    remove: {
      typeName: "Remove Song",
      submit: "🛡️ Send Removal Request",
      songLabel: "Song title &amp; YouTube link to remove",
      songPlaceholder: "e.g. KK — Kya Mujhe Pyaar Hai (YouTube link)",
      hint: "Copyright holder or artist? Share the link — removal happens within 24 hours. 🕊️",
      successTitle: "Removal request received! 🛡️",
      successBody: (name, song) =>
        `Thanks ${name}! “${song}” has been flagged for review — Umair will remove it within 24 hours.`,
      copyBody: (name, song, msg) =>
        `TCS Radio request — Remove Song\n👤 ${name}\n🎵 ${song}\n💬 ${msg || "—"}`,
      requires: { name: true, song: true, message: false }
    },
    other: {
      typeName: "Message for Umair",
      submit: "💬 Send Message",
      songLabel: "Topic (optional)",
      songPlaceholder: "What is it about? (optional)",
      hint: "Feedback, dedication, hi, ya ek chai break ka invite — sab welcome! ☕",
      successTitle: "Message sent! 💌",
      successBody: (name) =>
        `Thanks ${name}! Your message is with Umair — expect a reply within 24 hours.`,
      copyBody: (name, song, msg) =>
        `TCS Radio request — Message\n👤 ${name}\n📌 ${song || "—"}\n💬 ${msg || "—"}`,
      requires: { name: true, song: false, message: true }
    }
  };

  let reqType = "add";
  let lastRequest = null;

  function toast(msg) {
    const t = $(".toast") || $("#toast");
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

  /* ------------------------- Share helper ------------------------- */
  async function shareTCS() {
    const data = {
      title: "TCS Radio — 2000s Retro Indian Radio by Umair",
      text: "Tune into TCS Radio by Umair — nonstop 2000s Bollywood nostalgia with Office, Auto, Truck & Monsoon playlists! 📻🏢🛺🚚",
      url: location.href
    };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (_) { return; }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast("🔗 Link copied — share the nostalgia! ❤️");
    } catch (_) {
      toast("Share TCS Radio: " + location.href);
    }
  }

  /* ==================== CONNECT FORM (ENHANCED) ==================== */

  function getForm() {
    return {
      name: $("#reqName") ? $("#reqName").value.trim() : "",
      song: $("#reqSong") ? $("#reqSong").value.trim() : "",
      message: $("#reqMessage") ? $("#reqMessage").value.trim() : ""
    };
  }

  function setInvalid(input, invalid) {
    if (!input) return;
    input.classList.toggle("invalid", invalid);
    if (!invalid) input.removeAttribute("aria-invalid");
    else input.setAttribute("aria-invalid", "true");
  }

  function updateCount() {
    const ta = $("#reqMessage");
    const c = $("#reqCount");
    if (!ta || !c) return;
    const len = ta.value.length;
    c.textContent = `${len} / ${MAX_MSG}`;
    c.classList.toggle("full", len >= MAX_MSG);
  }

  function syncReqUI() {
    const meta = REQ_META[reqType];
    document.querySelectorAll(".req-type-btn").forEach((b) => {
      const on = b.dataset.reqType === reqType;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    const hint = $("#reqHint");
    if (hint) hint.textContent = meta.hint;

    const reqMsgOpt = $("#reqMsgOpt");
    if (reqMsgOpt) reqMsgOpt.textContent = reqType === "other" ? "(required)" : "(optional)";

    const submit = $("#reqSubmit");
    if (submit) submit.textContent = meta.submit;

    const songGroup = $("#reqSongGroup");
    const songInput = $("#reqSong");
    const songLabel = $("#reqSongLabel");
    // Show the song field for add/remove; hide it entirely for plain feedback.
    if (songGroup) songGroup.hidden = reqType === "other";
    if (songInput && songLabel) {
      songLabel.innerHTML = meta.songLabel;
      songInput.placeholder = meta.songPlaceholder;
    }

    const nameInput = $("#reqName");
    const msgInput = $("#reqMessage");
    setInvalid(nameInput, false);
    setInvalid(songInput, false);
    setInvalid(msgInput, false);
  }

  function saveDraft() {
    try {
      const v = getForm();
      localStorage.setItem(REQ_DRAFT_KEY, JSON.stringify({ type: reqType, ...v }));
    } catch (_) { /* storage blocked — drafts are a bonus, not required */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(REQ_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d && REQ_META[d.type]) reqType = d.type;
      const name = $("#reqName"), song = $("#reqSong"), msg = $("#reqMessage");
      if (name) name.value = (d && d.name) || "";
      if (song) song.value = (d && d.song) || "";
      if (msg) msg.value = (d && d.message) || "";
      updateCount();
      syncReqUI();
    } catch (_) {}
  }

  function clearDraft() {
    try { localStorage.removeItem(REQ_DRAFT_KEY); } catch (_) {}
  }

  function showForm(keepType) {
    const form = $("#requestForm");
    const success = $("#requestSuccess");
    if (form) form.hidden = false;
    if (success) success.hidden = true;
    if (!keepType) reqType = "add";
    syncReqUI();
  }

  function openRequest() {
    open("#requestModal");
    showForm(true);
    loadDraft();
    setInvalid($("#reqName"), false);
    setInvalid($("#reqSong"), false);
    setInvalid($("#reqMessage"), false);
  }

  function composeCopyText() {
    if (!lastRequest) return "";
    const meta = REQ_META[lastRequest.type];
    return meta.copyBody(lastRequest.name, lastRequest.song, lastRequest.message);
  }

  async function copyRequest() {
    const text = composeCopyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast("📋 Request copied — paste it anywhere to send!");
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("📋 Request copied!"); }
      catch (_) { toast("Copy didn't work — request shown above ☝️"); }
      document.body.removeChild(ta);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const meta = REQ_META[reqType];
    const { name, song, message } = getForm();
    let ok = true;

    if (meta.requires.name && !name) {
      setInvalid($("#reqName"), true);
      $("#reqName").focus();
      toast("Please add your name or channel 😊");
      ok = false;
    }
    if (ok && meta.requires.song && !song) {
      setInvalid($("#reqSong"), true);
      $("#reqSong").focus();
      toast("Add the song title + YouTube link 🙂");
      ok = false;
    }
    if (ok && meta.requires.message && !message) {
      setInvalid($("#reqMessage"), true);
      $("#reqMessage").focus();
      toast("Ek chhota message likh do — Umair ko samajh aayega 😉");
      ok = false;
    }
    if (!ok) return;

    lastRequest = { type: reqType, name, song, message };

    // Success panel
    const form = $("#requestForm");
    const success = $("#requestSuccess");
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      const title = $("#successTitle");
      const summary = $("#successSummary");
      if (title) title.textContent = meta.successTitle;
      if (summary) summary.textContent = meta.successBody(name, song);
      success.classList.remove("pop");
      void success.offsetWidth; /* restart pop animation */
      success.classList.add("pop");
    }

    clearDraft();
    const resetInputs = ["#reqName", "#reqSong", "#reqMessage"];
    resetInputs.forEach((s) => { const el = $(s); if (el) el.value = ""; });
    setInvalid($("#reqName"), false);
    setInvalid($("#reqSong"), false);
    setInvalid($("#reqMessage"), false);
    updateCount();
  }

  /* ==================== INIT ==================== */

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

    /* ---------- Support modal ---------- */
    const supportBtn = $("#supportBtn");
    if (supportBtn) supportBtn.onclick = () => open("#supportModal");

    const supportLink = $("#supportLink");
    if (supportLink) {
      supportLink.onclick = (e) => {
        e.preventDefault();
        open("#supportModal");
      };
    }

    const chaiLoveBtn = $("#chaiLoveBtn");
    if (chaiLoveBtn) {
      chaiLoveBtn.onclick = () => {
        dismiss($("#supportModal"));
        shareTCS();
      };
    }

    /* ---------- Careers modal ---------- */
    const earnBtn = $("#earnBtn");
    if (earnBtn) earnBtn.onclick = () => open("#earnModal");

    const applyJokeBtn = $("#applyJokeBtn");
    if (applyJokeBtn) {
      applyJokeBtn.onclick = () => {
        dismiss($("#earnModal"));
        toast("🎉 Timesheet submitted! Cutting chai & samosa is on the way ☕🥟😂");
      };
    }

    /* ---------- Connect (Add / Remove) modal triggers ---------- */
    const requestBtn = $("#requestBtn");
    if (requestBtn) requestBtn.onclick = openRequest;

    const requestFooterLink = $("#requestFooterLink");
    if (requestFooterLink) {
      requestFooterLink.onclick = (e) => {
        e.preventDefault();
        openRequest();
      };
    }
    const drawerConnect = $("#drawerConnectBtn");
    if (drawerConnect) {
      drawerConnect.onclick = () => {
        const drawer = $("#drawer");
        if (drawer) {
          drawer.classList.remove("open");
          drawer.setAttribute("aria-hidden", "true");
        }
        const listBtn = $("#listBtn");
        if (listBtn) listBtn.setAttribute("aria-expanded", "false");
        openRequest();
      };
    }

    /* ---------- Enhanced request form ---------- */
    document.querySelectorAll(".req-type-btn").forEach((b) => {
      b.addEventListener("click", () => {
        reqType = b.dataset.reqType || "add";
        syncReqUI();
        saveDraft();
      });
    });

    const form = $("#requestForm");
    if (form) {
      form.addEventListener("submit", handleSubmit);
      ["#reqName", "#reqSong", "#reqMessage"].forEach((s) => {
        const el = $(s);
        if (!el) return;
        el.addEventListener("input", () => {
          if (s === "#reqMessage") updateCount();
          setInvalid(el, false);
          saveDraft();
        });
      });
      // Re-validate eagerly once the user starts typing after an error
      form.addEventListener("input", () => {
        const meta = REQ_META[reqType];
        if (meta.requires.song && $("#reqSong") && $("#reqSong").value.trim()) setInvalid($("#reqSong"), false);
      });
    }

    const copyBtn = $("#copyReqBtn");
    if (copyBtn) copyBtn.addEventListener("click", copyRequest);
    const againBtn = $("#againReqBtn");
    if (againBtn) {
      againBtn.addEventListener("click", () => {
        showForm(false);
        const name = $("#reqName");
        if (name) name.focus();
      });
    }

    /* ---------- FAQ accordion ---------- */
    const acc = $("#acc");
    if (acc) {
      acc.innerHTML = FAQ_DATA.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");
    }

    /* ---------- Gentle support prompt ---------- */
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
    supportTimer = setTimeout(maybeSupport, 90000);
  }

  return {
    init,
    open,
    dismiss,
    toast,
    share: shareTCS
  };
})();

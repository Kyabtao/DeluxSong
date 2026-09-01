/* DeluxSong — Deluxe Saloon front-end
   Multi-page, mobile-first build. 2000s Indian retro ambient saloon radio. */

/* ---------------- data ---------------- */
const PLAYLIST = [
  { id: "ioWh9vMixyw", title: "Tu Shayar Hai Main Teri Shayari | Saajan | Alka Yagnik", credit: "Ishtar Music" },
  { id: "_YjSmLlmqLM", title: "Aisi Deewangi | Deewana | Shahrukh Khan, Divya Bharti", credit: "Ishtar Music" },
  { id: "PqiddY3o3aY", title: "Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu, Alka Yagnik", credit: "Ishtar Music" },
  { id: "LtIJuk5te9E", title: "Pehli Baar Mile Hain | Saajan | S P Balasubramaniam", credit: "Ishtar Music" },
  { id: "Yqj1_V90KJo", title: "Chura Ke Dil Mera | Main Khiladi Tu Anari | Kumar Sanu, Alka Yagnik", credit: "Ishtar Music" },
  { id: "mNSYPtzpfd4", title: "Jab Koi Baat Bigad Jaaye | Kumar Sanu & Sadhna Sargam", credit: "Ishtar Music" },
  { id: "thjRNwjmAdQ", title: "Tumse Milne Ki Tamanna Hai | Saajan | Salman Khan, Madhuri", credit: "Ishtar Music" },
  { id: "plB0ytzIlqI", title: "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu, Alka Yagnik", credit: "Ishtar Music" },
  { id: "bBjVLCAAM1A", title: "Dekha Hai Pehli Baar (Duet) | Saajan | Alka Yagnik, S P B", credit: "Ishtar Music" },
  { id: "x_a2ZVkYw_o", title: "Tumse Milne Ki Tamanna Hai | Saajan | S P Balasubramaniam", credit: "Ishtar Music" },
  { id: "PUO7_Gi6ipg", title: "Baazigar O Baazigar | Baazigar | Shahrukh Khan, Kajol", credit: "Ishtar Music" },
  { id: "qGOTe3KmCdY", title: "Kitna Haseen Chehra | Dilwale | Ajay Devgan, Raveena Tandon", credit: "Ishtar Music" }
];

const QUOTES = [
  "हमारे यहाँ हर स्टाइल की कटिंग की जाती है!",
  "हमारे यहाँ सलमान खान की राखी भैया स्टाइल कटिंग बनाई जाती है!",
  "भैया, थोड़ा और छोटा कर दो… शादी है घर में।",
  "मालिश करा लो साहब, दिमाग हल्का हो जाएगा।",
  "कृपया शोर न करें — रेडियो चल रहा है।",
  "चाय आ रही है, आप बैठिए… दो मिनट।",
  "Old is Gold — यहाँ सिर्फ पुराने गाने बजते हैं।",
  "सिर्फ ₹30 में हेयर कटिंग, बाकी बातें फ्री।"
];

const FAQ = [
  ["What is Deluxe Saloon?",
   "Deluxe Saloon — also written Deluxe Salon or Delux Salon — is a free ambient radio website that recreates the sound and mood of a classic 2000s Indian neighbourhood barbershop, complete with nostalgic Bollywood tunes and barber chatter."],
  ["Is Deluxe Saloon free to use?",
   "Yes. Deluxe Saloon streams entirely for free in your browser, with no sign-up required, on both desktop and mobile."],
  ["Does it work on a mobile phone?",
   "Yes — the whole site is built mobile-first. Controls are sized for thumbs, the playlist and chat go full-screen on phones, and you can install it to your home screen so it opens like an app. No account, no downloads of songs — everything streams."],
  ["What kind of music plays on Deluxe Saloon?",
   "Deluxe Saloon plays a curated 2000s Indian Bollywood playlist — the kind of songs you'd have heard on the radio inside a saloon back then. The same playlist is also available on YouTube, linked in the footer."],
  ["Why does the music pause when I open another page?",
   "Each page is a real static page, so switching pages reboots the little radio. The song you were on is remembered — tap the player bar at the bottom of any page to pick right back up where you left off."],
  ["Can I listen in the rain?",
   "Yes. On the Radio page there is a 🌧️ Baarish toggle — real rain ambience synthesized in your browser (filtered noise + the odd distant thunder), with its own volume slider. Perfect while the 2000s loop plays on."],
  ["Is this the official Deluxe Salon website?",
   "No. This is a working clone built for demonstration. The original Deluxe Saloon ambient radio experience lives at deluxsalon.in, along with its full library of 2000s Bollywood tracks and retro barbershop artwork."],
  ["Where can I listen to the Deluxe Salon songs?",
   "All the songs stream directly in your browser — just press play, no download or sign-up needed. The same tracks are also on YouTube, linked in the footer."]
];

/* ---------------- utils ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  s = Math.floor(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2600);
}
const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

const PAGE = document.body.dataset.page || "home";
const IS_RADIO = PAGE === "radio";

/* ---------------- radio state (shared across pages) ---------------- */
let order, pos, shuffle, vol, savedState = null;
try { savedState = JSON.parse(localStorage.getItem("ds_state")) || null; } catch {}

function freshOrder() {
  const o = PLAYLIST.map((_, i) => i);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}
if (savedState && Array.isArray(savedState.order) && savedState.order.length === PLAYLIST.length) {
  order = savedState.order; pos = Math.min(savedState.pos | 0, order.length - 1);
  shuffle = !!savedState.shuffle; vol = savedState.vol | 0;
} else {
  order = freshOrder(); pos = 0; shuffle = true;
  vol = Number(localStorage.getItem("ds_vol") || 70);
  saveState(); // persist so every page starts on the same song
}
function saveState() {
  try {
    localStorage.setItem("ds_state", JSON.stringify({ order, pos, shuffle, vol }));
    localStorage.setItem("ds_vol", vol);
  } catch {}
}
const current = () => PLAYLIST[order[pos]];

/* ---------------- youtube player ---------------- */
let yt = null, ready = false, wantPlay = false, tick = null, seeking = false;
const mountId = IS_RADIO ? "ytplayer" : "ytplayer-mini";

window.onYouTubeIframeAPIReady = function () {
  yt = new YT.Player(mountId, {
    height: "180", width: "320",
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: location.origin },
    events: {
      onReady: () => {
        ready = true;
        yt.setVolume(vol);
        updateNowPlaying();
        renderTracks();
        const want = IS_RADIO ? new URLSearchParams(location.search).get("track") : null;
        if (want !== null) load(Number(want) | 0, true);
        else if (wantPlay) load(pos, true);
        else yt.cueVideoById(current().id);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) next();
        setPlayingUI(e.data === YT.PlayerState.PLAYING);
        if (e.data === YT.PlayerState.PLAYING) startTick();
      },
      onError: () => { toast("Track unavailable — skipping…"); setTimeout(next, 600); }
    }
  });
};

function load(i, play) {
  pos = (i + order.length) % order.length;
  updateNowPlaying();
  saveState();
  if (!ready) { wantPlay = play; return; }
  if (play) yt.loadVideoById(current().id);
  else yt.cueVideoById(current().id);
}
function updateNowPlaying() {
  const t = current();
  const titleEl = IS_RADIO ? $("#npTitle") : $("#miniTitle");
  const creditEl = IS_RADIO ? $("#npCredit") : $("#miniCredit");
  if (titleEl) titleEl.textContent = t.title;
  if (creditEl) creditEl.textContent = t.credit;
  if (IS_RADIO) document.title = t.title + " — Deluxe Saloon";
  renderTracks();
}
function setPlayingUI(on) {
  if (IS_RADIO) {
    const p = $("#play");
    if (p) { p.textContent = on ? "❚❚" : "▶"; p.title = on ? "Pause" : "Play"; p.setAttribute("aria-label", p.title); }
    const d = $("#disc"); if (d) d.classList.toggle("spin", on);
  }
  const mi = $("#miniPlayIcon"), md = $("#miniDisc");
  if (mi) mi.textContent = on ? "❚❚" : "▶";
  if (md) md.classList.toggle("spin", on);
  if (on) startTick();
}
function startTick() {
  if (!IS_RADIO) return;
  clearInterval(tick);
  tick = setInterval(() => {
    if (!ready || seeking) return;
    const d = yt.getDuration() || 0, c = yt.getCurrentTime() || 0;
    const cur = $("#cur"), dur = $("#dur"), seek = $("#seek");
    if (cur) cur.textContent = fmt(c);
    if (dur) dur.textContent = fmt(d);
    if (seek && d) seek.value = Math.round((c / d) * 1000);
  }, 500);
}

function next() { load(pos + 1, true); }
function prev() {
  if (ready && (yt.getCurrentTime() || 0) > 4) { yt.seekTo(0); return; }
  load(pos - 1, true);
}
function togglePlay() {
  if (!ready) { wantPlay = true; toast("Warming up the radio…"); return; }
  const s = yt.getPlayerState();
  if (s === YT.PlayerState.PLAYING) yt.pauseVideo();
  else yt.playVideo();
}

/* ---------------- full player (radio page) ---------------- */
if (IS_RADIO) {
  const play = $("#play");
  if (play) play.onclick = togglePlay;
  const nx = $("#next"); if (nx) nx.onclick = next;
  const pv = $("#prev"); if (pv) pv.onclick = prev;

  const sh = $("#shuffle");
  if (sh) {
    sh.classList.toggle("on", shuffle);
    sh.onclick = (e) => {
      shuffle = !shuffle;
      e.currentTarget.classList.toggle("on", shuffle);
      const keep = current();
      order = shuffle ? freshOrder() : PLAYLIST.map((_, i) => i);
      pos = order.indexOf(PLAYLIST.indexOf(keep));
      if (pos < 0) pos = 0;
      renderTracks(); saveState();
      toast(shuffle ? "Shuffle on" : "Shuffle off — playing in order");
    };
  }

  const volEl = $("#vol");
  if (volEl) {
    volEl.value = vol;
    volEl.oninput = (e) => {
      vol = Number(e.target.value);
      if (ready) { yt.setVolume(vol); vol === 0 ? yt.mute() : yt.unMute(); }
      const ic = $("#volIcon"); if (ic) ic.textContent = vol === 0 ? "🔇" : vol < 45 ? "🔉" : "🔊";
      saveState();
    };
  }

  const seekEl = $("#seek");
  if (seekEl) {
    seekEl.addEventListener("input", () => (seeking = true));
    seekEl.addEventListener("change", (e) => {
      seeking = false;
      if (ready) { const d = yt.getDuration() || 0; yt.seekTo((e.target.value / 1000) * d, true); }
    });
  }

  const vb = $("#videoBtn");
  if (vb) {
    const mini = localStorage.getItem("ds_mini");
    if (mini) $("#player").classList.add("mini"); else vb.classList.add("on");
    vb.onclick = (e) => {
      const isMini = $("#player").classList.toggle("mini");
      e.currentTarget.classList.toggle("on", !isMini);
      localStorage.setItem("ds_mini", isMini ? "1" : "");
    };
  }

  const listBtn = $("#listBtn");
  if (listBtn) listBtn.onclick = () => $("#drawer").classList.add("open");
  const drawerClose = $("#drawerClose");
  if (drawerClose) drawerClose.onclick = () => $("#drawer").classList.remove("open");

  document.addEventListener("keydown", (e) => {
    if (/input|textarea/i.test(e.target.tagName)) return;
    if (e.code === "Space") { e.preventDefault(); play.click(); }
    if (e.code === "ArrowRight") next();
    if (e.code === "ArrowLeft") prev();
  });
}

/* ---------------- playlist drawer (radio page) ---------------- */
function renderTracks() {
  const ol = $("#tracks");
  if (!ol) return;
  ol.innerHTML = "";
  order.forEach((idx, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<i>${String(i + 1).padStart(2, "0")}</i><span>${esc(PLAYLIST[idx].title)}</span>`;
    if (i === pos) li.classList.add("active");
    li.onclick = () => { load(i, true); $("#drawer").classList.remove("open"); };
    ol.appendChild(li);
  });
}

/* ---------------- tracks page grid ---------------- */
if (PAGE === "tracks") {
  const grid = $("#trackGrid");
  if (grid) {
    grid.innerHTML = "";
    PLAYLIST.forEach((t, i) => {
      const a = document.createElement("a");
      const active = order[pos] === i;
      a.className = "track-card" + (active ? " active" : "");
      a.href = "radio.html?track=" + i;
      a.innerHTML =
        `<span class="tc-num">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="tc-body"><strong>${esc(t.title)}</strong><small>${esc(t.credit)}</small></span>` +
        `<span class="tc-play" aria-hidden="true">${active ? "📻" : "▶"}</span>`;
      grid.appendChild(a);
    });
  }
}

/* ---------------- mini player (global, hidden on radio page) ---------------- */
(function initMini() {
  const mini = $("#mini");
  if (!mini) return;
  const t = current();
  const titleEl = $("#miniTitle"), creditEl = $("#miniCredit");
  if (titleEl) titleEl.textContent = t.title;
  if (creditEl) creditEl.textContent = t.credit;
  mini.hidden = false;
  const mp = $("#miniPlay");
  if (mp) { mp.onclick = togglePlay; mp.setAttribute("aria-label", "Play " + t.title); }
  const mn = $("#miniNext"); if (mn) mn.onclick = next;
})();

/* ---------------- home playlist preview ---------------- */
(function initHomePreview() {
  const list = $("#homeTracks");
  if (!list) return;
  list.innerHTML = "";
  PLAYLIST.slice(0, 4).forEach((t, i) => {
    const a = document.createElement("a");
    a.className = "track-row";
    a.href = "radio.html?track=" + i;
    a.innerHTML =
      `<span class="tl-num">${String(i + 1).padStart(2, "0")}</span>` +
      `<span class="tl-body"><strong>${esc(t.title)}</strong><small>${esc(t.credit)}</small></span>` +
      `<span class="tl-play" aria-hidden="true">▶</span>`;
    list.appendChild(a);
  });
})();

/* ---------------- FAQ ---------------- */
function renderFaq(root, items) {
  root.innerHTML = items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
}
if (PAGE === "faq" && $("#acc")) renderFaq($("#acc"), FAQ);
if (PAGE === "home" && $("#accTeaser")) renderFaq($("#accTeaser"), FAQ.slice(0, 3));

/* ---------------- barber quotes ---------------- */
(function initQuotes() {
  const q = $("#quote");
  if (!q) return;
  let qi = 0;
  setInterval(() => {
    q.style.opacity = 0;
    setTimeout(() => { qi = (qi + 1) % QUOTES.length; q.textContent = QUOTES[qi]; q.style.opacity = .92; }, 400);
  }, 7000);
})();

/* ---------------- baarish (rain) via WebAudio — radio page ---------------- */
(function initRain() {
  const btn = $("#rainBtn");
  if (!btn) return;
  let actx = null, rainGain = null, rainOn = false;
  function makeRain() {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const len = actx.sampleRate * 3;
    const buf = actx.createBuffer(1, len, actx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {                    // brown-ish noise = rain hiss
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2 + w * 0.25;
    }
    const src = actx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 220;
    rainGain = actx.createGain(); rainGain.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(actx.destination);
    src.start();
    // occasional distant thunder
    setInterval(() => {
      if (!rainOn || Math.random() > 0.25) return;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.value = 55 + Math.random() * 30;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 3.2);
    }, 18000);
  }
  btn.onclick = () => {
    if (!actx) makeRain();
    if (actx.state === "suspended") actx.resume();
    rainOn = !rainOn;
    const rv = $("#rainVol");
    rainGain.gain.setTargetAtTime(rainOn ? Number(rv.value) / 100 * 0.5 : 0, actx.currentTime, .4);
    btn.classList.toggle("on", rainOn);
    const row = $("#rainRow"); if (row) row.hidden = !rainOn;
    toast(rainOn ? "Baarish on ☔ — chai le aao" : "Baarish off");
  };
  const rv = $("#rainVol");
  if (rv) rv.oninput = (e) => {
    if (rainGain && rainOn) rainGain.gain.setTargetAtTime(Number(e.target.value) / 100 * 0.5, actx.currentTime, .1);
  };
})();

/* ---------------- share ---------------- */
(function initShare() {
  const btn = $("#shareBtn");
  if (!btn) return;
  btn.onclick = async () => {
    const data = {
      title: "Deluxe Saloon",
      text: "2000s Indian saloon radio — nonstop Bollywood nostalgia.",
      url: location.origin + location.pathname.split("/").slice(0, 2).join("/") + "radio.html"
    };
    if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
    else {
      try { await navigator.clipboard.writeText(data.url); toast("Link copied!"); }
      catch { toast("Copy the address bar to share"); }
    }
  };
})();

/* ---------------- mobile menu ---------------- */
(function initMenu() {
  const btn = $("#menuBtn"), nav = $("#mainNav"), backdrop = $("#navBackdrop");
  if (!btn || !nav) return;
  const close = () => {
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.hidden = true;
  };
  btn.onclick = () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
  };
  if (backdrop) backdrop.onclick = close;
  $$(".main-nav a").forEach((a) => a.addEventListener("click", close));
})();

/* ---------------- modals ---------------- */
$$("[data-close]").forEach((b) =>
  b.addEventListener("click", () => { const m = b.closest(".modal"); if (m) m.hidden = true; }));
$$(".modal").forEach((m) =>
  m.addEventListener("click", (e) => { if (e.target === m) m.hidden = true; }));

/* ---------------- PWA install ---------------- */
(function initPwa() {
  let deferred = null;
  const bar = $("#install");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferred = e;
    if (bar && !localStorage.getItem("ds_install_x")) bar.hidden = false;
  });
  const ib = $("#installBtn");
  if (ib) ib.onclick = async () => {
    if (!deferred) { toast("Use your browser menu → Add to Home Screen"); return; }
    deferred.prompt(); await deferred.userChoice; deferred = null;
    if (bar) bar.hidden = true;
  };
  const ic = $("#installClose");
  if (ic) ic.onclick = () => { if (bar) bar.hidden = true; localStorage.setItem("ds_install_x", "1"); };
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();

/* ---------------- live chat (websocket) ---------------- */
(function initChat() {
  const openBtn = $("#chatOpen");
  if (!openBtn) return;
  let ws = null, myName = localStorage.getItem("ds_name") || "", pending = null,
      unread = 0, chatOpen = false, chatTries = 0;
  const msgs = $("#msgs"), chat = $("#chat"), input = $("#chatInput");

  function addMsg(m) {
    const el = document.createElement("div");
    el.className = "msg" + (m.sys ? " sys" : "") + (m.name === myName && !m.sys ? " me" : "");
    const time = new Date(m.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
    el.innerHTML = m.sys ? esc(m.text) : `<b>${esc(m.name)}</b>${esc(m.text)}<time>${time}</time>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    if (!chatOpen && !m.sys) { unread++; const b = $("#chatCount"); b.hidden = false; b.textContent = unread; }
  }

  // Chat needs the Node server (server.js). On a static host (e.g. GitHub Pages) there is no
  // WebSocket endpoint, so the room degrades to a read-only "offline" note instead of erroring.
  const CHAT_URL = window.DELUX_CHAT_URL ||
    (location.protocol.startsWith("http") && !/github\.io/.test(location.hostname)
      ? `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`
      : null);

  function chatOffline() {
    const dot = $("#liveDot"); if (dot) dot.style.background = "#c2321f";
    const on = $("#online"); if (on) on.textContent = "offline";
    input.disabled = true;
    input.placeholder = "Live chat is offline on this build";
    if (!msgs.querySelector(".sys")) {
      addMsg({ sys: true, text: "Live chat needs the Deluxe Saloon server (npm start). Everything else works right here.", ts: Date.now() });
    }
  }
  function connect() {
    if (!CHAT_URL) { chatOffline(); return; }
    try { ws = new WebSocket(CHAT_URL); } catch { chatOffline(); return; }
    ws.onmessage = (ev) => {
      let d; try { d = JSON.parse(ev.data); } catch { return; }
      if (d.type === "history") { msgs.innerHTML = ""; d.messages.forEach(addMsg); }
      else if (d.type === "msg") addMsg(d.message);
      else if (d.type === "online") { const on = $("#online"); if (on) on.textContent = d.count + " online"; }
    };
    ws.onopen = () => {
      chatTries = 0;
      const dot = $("#liveDot"); if (dot) dot.style.background = "#3fbf6a";
      input.disabled = false;
    };
    ws.onclose = () => {
      const dot = $("#liveDot"); if (dot) dot.style.background = "#c2321f";
      if (++chatTries > 3) { chatOffline(); return; }
      setTimeout(connect, 3000);
    };
  }
  connect();

  openBtn.onclick = () => {
    chatOpen = true; unread = 0;
    const b = $("#chatCount"); b.hidden = true; b.textContent = 0;
    chat.hidden = false; input.focus();
    msgs.scrollTop = msgs.scrollHeight;
  };
  $("#chatClose").onclick = () => { chatOpen = false; chat.hidden = true; };

  $("#chatForm").onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    if (!myName) {
      pending = text;
      $("#pendingMsg").textContent = text;
      $("#nameModal").hidden = false;
      $("#nameInput").focus();
      return;
    }
    send(text);
  };
  function send(text) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "msg", name: myName, text }));
    else toast("Reconnecting to chat…");
  }
  const nameSend = $("#nameSend");
  if (nameSend) nameSend.onclick = () => {
    const n = $("#nameInput").value.trim();
    if (!n) return;
    myName = n; localStorage.setItem("ds_name", n);
    $("#nameModal").hidden = true;
    if (pending) { send(pending); pending = null; }
  };
  const nameInput = $("#nameInput");
  if (nameInput) nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") nameSend.click(); });
})();

/* ---------------- initial render (all pages) ---------------- */
updateNowPlaying();
renderTracks();

/* ---------------- support page extras ---------------- */
(function initSupport() {
  if (PAGE !== "support") return;
  const earnBtn = $("#earnBtn");
  if (earnBtn) earnBtn.onclick = () => { toast("Opening WhatsApp…"); };
})();

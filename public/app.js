/* Deluxe Saloon — front-end
   2000s Indian retro ambient saloon radio (working clone of deluxsalon.in) */

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
  ["What kind of music plays on Deluxe Saloon?",
   "Deluxe Saloon plays a curated 2000s Indian Bollywood playlist — the kind of songs you'd have heard on the radio inside a saloon back then. The same playlist is also available on YouTube, linked in the footer below."],
  ["Is this the official Deluxe Salon website?",
   "This is a working clone built for demonstration. The original Deluxe Saloon ambient radio experience lives at deluxsalon.in, along with its full library of 2000s Bollywood tracks and retro barbershop artwork."],
  ["Where can I listen to the Deluxe Salon songs?",
   "All the songs stream directly in your browser — just press play, no download or sign-up needed. The same tracks are also on YouTube, linked in the footer."],
  ["Is there a Deluxe Salon playlist I can follow?",
   "Yes. The playlist plays automatically in shuffle here, and you can follow the same playlist on YouTube via the link in the footer."]
];

const $ = (s) => document.querySelector(s);
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  s = Math.floor(s);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2600);
}
// Storage can be blocked in privacy mode / sandboxed frames. Never let a
// storage exception stop a button from working.
function storageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); } catch (_) { return false; } }
function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } }
function sessionSet(key, val) { try { sessionStorage.setItem(key, val); } catch (_) {} }

/* ---------------- radio ---------------- */
let yt = null, ready = false, order = [], pos = 0, shuffle = true, wantPlay = false, tick = null, seeking = false, skips = 0;

function buildOrder() {
  order = PLAYLIST.map((_, i) => i);
  if (shuffle) for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
}
buildOrder();

function current() { return PLAYLIST[order[pos]]; }

window.onYouTubeIframeAPIReady = function () {
  yt = new YT.Player("ytplayer", {
    height: "180", width: "320",
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: location.origin },
    events: {
      onReady: () => {
        ready = true;
        yt.setVolume(Number($("#vol").value));
        // Honour a play press that happened while the API was still loading.
        const play = wantPlay; wantPlay = false;
        load(pos, play);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) next();
        setPlayingUI(e.data === YT.PlayerState.PLAYING);
        if (e.data === YT.PlayerState.PLAYING) { skips = 0; startTick(); }
      },
      onError: (e) => {
        const code = e && e.data;
        // 100 = video removed/not found, 101/150 = embedding disabled for this video.
        // Those are per-video problems, so skip ahead — but cap it so a bad batch
        // never spins forever.
        if (code === 100 || code === 101 || code === 150) {
          skips++;
          if (skips >= PLAYLIST.length) {
            skips = 0;
            toast("Every track is unavailable right now — please try again later.");
            return;
          }
          toast("Track unavailable — skipping…");
          setTimeout(next, 600);
          return;
        }
        // 2 = invalid params, 5 = HTML5 player error, 153 = player config/referrer issue.
        // These are systemic — advancing won't help, so stop and say why.
        toast("Player error " + (code || "?") + " — try disabling your ad-blocker and reload.");
      }
    }
  });
};

function load(i, play) {
  pos = (i + order.length) % order.length;
  const t = current();
  $("#npTitle").textContent = t.title;
  $("#npCredit").textContent = t.credit;
  document.title = (play ? "▶ " : "") + t.title + " — Deluxe Saloon";
  renderTracks();
  if (!ready) { wantPlay = play; return; }
  if (play) yt.loadVideoById(t.id); else yt.cueVideoById(t.id);
}

function setPlayingUI(on) {
  $("#play").textContent = on ? "❚❚" : "▶";
  $("#play").title = on ? "Pause" : "Play";
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
  }, 500);
}

function next() { load(pos + 1, true); }
function prev() {
  if (ready && yt.getCurrentTime() > 4) { yt.seekTo(0); return; }
  load(pos - 1, true);
}

$("#play").onclick = () => {
  if (!ready) {
    wantPlay = true;
    toast(window.YT && window.YT.Player ? "Warming up the radio…" : "Loading YouTube player… if this sticks, disable your ad-blocker and reload.");
    return;
  }
  const s = yt.getPlayerState();
  if (s === YT.PlayerState.PLAYING) yt.pauseVideo();
  else yt.playVideo();
};
$("#next").onclick = next;
$("#prev").onclick = prev;
$("#shuffle").onclick = (e) => {
  shuffle = !shuffle;
  e.currentTarget.classList.toggle("on", shuffle);
  const keep = current();
  buildOrder();
  pos = Math.max(0, order.indexOf(PLAYLIST.indexOf(keep)));
  renderTracks();
  toast(shuffle ? "Shuffle on" : "Shuffle off — playing in order");
};
$("#shuffle").classList.add("on");

$("#vol").oninput = (e) => {
  const v = Number(e.target.value);
  if (ready) { yt.setVolume(v); v === 0 ? yt.mute() : yt.unMute(); }
  $("#volIcon").textContent = v === 0 ? "🔇" : v < 45 ? "🔉" : "🔊";
  storageSet("ds_vol", v);
};
const savedVol = storageGet("ds_vol");
if (savedVol !== null) { $("#vol").value = savedVol; $("#vol").dispatchEvent(new Event("input")); }

$("#seek").addEventListener("input", () => (seeking = true));
$("#seek").addEventListener("change", (e) => {
  seeking = false;
  if (ready) { const d = yt.getDuration() || 0; yt.seekTo((e.target.value / 1000) * d, true); }
});

function renderTracks() {
  const ol = $("#tracks");
  ol.innerHTML = "";
  order.forEach((idx, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<i>${String(i + 1).padStart(2, "0")}</i><span>${PLAYLIST[idx].title}</span>`;
    if (i === pos) li.classList.add("active");
    li.onclick = () => { load(i, true); $("#drawer").classList.remove("open"); };
    ol.appendChild(li);
  });
}
renderTracks();

$("#videoBtn").onclick = (e) => {
  const mini = $("#player").classList.toggle("mini");
  e.currentTarget.classList.toggle("on", !mini);
  storageSet("ds_mini", mini ? "1" : "");
};
if (storageGet("ds_mini")) $("#player").classList.add("mini");
else $("#videoBtn").classList.add("on");

$("#listBtn").onclick = () => $("#drawer").classList.toggle("open");
$("#drawerClose").onclick = () => $("#drawer").classList.remove("open");

document.addEventListener("keydown", (e) => {
  if (/input|textarea/i.test(e.target.tagName)) return;
  if (e.code === "Space") { e.preventDefault(); $("#play").click(); }
  if (e.code === "ArrowRight") next();
  if (e.code === "ArrowLeft") prev();
});

/* ---------------- barber quotes ---------------- */
let qi = 0;
setInterval(() => {
  const q = $("#quote");
  q.style.opacity = 0;
  setTimeout(() => { qi = (qi + 1) % QUOTES.length; q.textContent = QUOTES[qi]; q.style.opacity = .92; }, 400);
}, 7000);

/* ---------------- baarish (rain) via WebAudio ---------------- */
let actx = null, rainGain = null, rainOn = false;
function makeRain() {
  actx = new (window.AudioContext || window.webkitAudioContext)();
  const len = actx.sampleRate * 3;
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {                       // brown-ish noise = rain hiss
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
    g.gain.exponentialRampToValueAtTime(0.25 * (rainGain.gain.value / 0.45 || 1), actx.currentTime + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 3.2);
  }, 18000);
}
$("#rainBtn").onclick = (e) => {
  if (!actx) makeRain();
  if (actx.state === "suspended") actx.resume();
  rainOn = !rainOn;
  rainGain.gain.setTargetAtTime(rainOn ? Number($("#rainVol").value) / 100 * 0.5 : 0, actx.currentTime, .4);
  e.currentTarget.classList.toggle("on", rainOn);
  $("#rainRow").hidden = !rainOn;
  toast(rainOn ? "Baarish on ☔ — chai le aao" : "Baarish off");
};
$("#rainVol").oninput = (e) => {
  if (rainGain && rainOn) rainGain.gain.setTargetAtTime(Number(e.target.value) / 100 * 0.5, actx.currentTime, .1);
};

/* ---------------- modals ---------------- */
function open(id) {
  // Never stack two modals on top of each other. If a pop-up is already showing,
  // close it first so the new one is the one the user is actually interacting with.
  document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
  $(id).hidden = false;
  const first = $(id).querySelector("input");
  if (first) first.focus();
}
function close(id) { $(id).hidden = true; }
function dismiss(modal) {
  if (!modal) return;
  modal.hidden = true;
  if (modal.id === "nameModal") cancelName();
}
document.querySelectorAll("[data-close]").forEach((b) =>
  b.addEventListener("click", (e) => dismiss(e.target.closest(".modal"))));
document.querySelectorAll(".modal").forEach((m) =>
  m.addEventListener("click", (e) => { if (e.target === m) dismiss(m); }));
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".modal:not([hidden])").forEach(dismiss);
});

$("#earnBtn").onclick = () => open("#earnModal");
$("#supportLink").onclick = (e) => { e.preventDefault(); open("#supportModal"); };
// The support pop-up is polite, not a hostage. Show it only when no other pop-up is
// open and chat is not visible; otherwise retry a bit later.
let supportTimer = null;
function maybeSupport() {
  if (sessionGet("ds_support")) return;
  const busy = document.querySelector(".modal:not([hidden])") || !$("#chat").hidden;
  if (document.hidden || busy) { supportTimer = setTimeout(maybeSupport, 12000); return; }
  open("#supportModal");
  sessionSet("ds_support", "1");
}
supportTimer = setTimeout(maybeSupport, 45000);

$("#shareBtn").onclick = async () => {
  const data = { title: "Deluxe Saloon", text: "2000s Indian saloon radio — nonstop Bollywood nostalgia.", url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
  else { await navigator.clipboard.writeText(location.href); toast("Link copied!"); }
};

/* ---------------- FAQ ---------------- */
$("#acc").innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");

/* ---------------- PWA install ---------------- */
let deferred = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); deferred = e;
  if (!storageGet("ds_install_x")) $("#install").hidden = false;
});
$("#installBtn").onclick = async () => {
  if (!deferred) { toast("Use your browser menu → Add to Home Screen"); return; }
  deferred.prompt(); await deferred.userChoice; deferred = null; $("#install").hidden = true;
};
$("#installClose").onclick = () => { $("#install").hidden = true; storageSet("ds_install_x", "1"); };
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------------- live chat (websocket) ---------------- */
let ws = null, myName = storageGet("ds_name") || "", pending = null, unread = 0, chatOpen = false;

function addMsg(m) {
  const box = $("#msgs");
  const el = document.createElement("div");
  el.className = "msg" + (m.sys ? " sys" : "") + (m.name === myName && !m.sys ? " me" : "");
  const time = new Date(m.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  el.innerHTML = m.sys
    ? esc(m.text)
    : `<b>${esc(m.name)}</b>${esc(m.text)}<time>${time}</time>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  if (!chatOpen && !m.sys) { unread++; $("#chatCount").textContent = unread; }
}
function esc(s) { return String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }

// Chat needs the Node server (server.js). On a static host (e.g. GitHub Pages) there is no
// WebSocket endpoint, so the room degrades to a read-only "offline" state instead of erroring.
// Point CHAT_URL at a hosted chat server to switch it back on from a static deployment.
const CHAT_URL = window.DELUX_CHAT_URL ||
  (location.protocol.startsWith("http") && !/github\.io$/.test(location.hostname)
    ? `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`
    : null);
let chatTries = 0;

function chatOffline() {
  $("#liveDot").style.background = "#c2321f";
  $("#online").textContent = "offline";
  $("#chatInput").disabled = true;
  $("#chatInput").placeholder = "Live chat is offline on this build";
  if (!$("#msgs").querySelector(".sys")) {
    addMsg({ sys: true, text: "Live chat needs the Deluxe Saloon server (npm start). Everything else works right here.", ts: Date.now() });
  }
}

function connect() {
  if (!CHAT_URL) { chatOffline(); return; }
  try { ws = new WebSocket(CHAT_URL); } catch { chatOffline(); return; }
  ws.onmessage = (ev) => {
    const d = JSON.parse(ev.data);
    if (d.type === "history") { $("#msgs").innerHTML = ""; d.messages.forEach(addMsg); }
    else if (d.type === "msg") addMsg(d.message);
    else if (d.type === "online") $("#online").textContent = d.count + " online";
  };
  ws.onopen = () => { chatTries = 0; $("#liveDot").style.background = "#3fbf6a"; $("#chatInput").disabled = false; };
  ws.onclose = () => {
    $("#liveDot").style.background = "#c2321f";
    if (++chatTries > 3) { chatOffline(); return; }
    setTimeout(connect, 3000);
  };
}
connect();

$("#chatOpen").onclick = () => {
  chatOpen = true; unread = 0; $("#chatCount").textContent = 0;
  $("#chat").hidden = false; $("#chatInput").focus();
  $("#msgs").scrollTop = $("#msgs").scrollHeight;
};
$("#chatClose").onclick = () => { chatOpen = false; $("#chat").hidden = true; };

$("#chatForm").onsubmit = (e) => {
  e.preventDefault();
  const text = $("#chatInput").value.trim();
  if (!text) return;
  if (!myName) {
    pending = text;
    $("#pendingMsg").textContent = text;
    $("#chatInput").value = "";
    open("#nameModal");
    return;
  }
  if (send(text)) $("#chatInput").value = "";
  else toast("Live chat isn't connected yet — keep your message in the box");
};
function send(text) {
  if (ws && ws.readyState === 1) { ws.send(JSON.stringify({ type: "msg", name: myName, text })); return true; }
  toast("Live chat isn't connected yet");
  return false;
}
$("#nameSend").onclick = () => {
  const n = $("#nameInput").value.trim();
  if (!n) { $("#nameInput").focus(); toast("Please enter a name first"); return; }
  const text = pending; pending = null;
  myName = n; storageSet("ds_name", n);
  // If the socket isn't ready the message is still the user's: put it back in the
  // chat box instead of silently deleting it.
  if (text && !send(text)) {
    $("#chatInput").value = text;
    toast("Your name is saved — press Send again once chat is connected");
  }
  $("#pendingMsg").textContent = "";
  close("#nameModal");
};
// Cancel / backdrop / Escape: drop the pending message back into the chat box
// so nothing the user typed is lost.
function cancelName() {
  const text = pending; pending = null;
  $("#pendingMsg").textContent = "";
  $("#nameModal").hidden = true;
  if (text) {
    $("#chatInput").value = text;
    $("#chat").hidden = false;
    toast("Message cancelled — it's back in the box");
  }
}
$("#nameInput").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("#nameSend").click(); } });

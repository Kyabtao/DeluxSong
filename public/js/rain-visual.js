/* ==========================================================================
   TCS RADIO - ON-SCREEN MONSOON RAIN OVERLAY
   Developed by Umair

   Pairs with js/rain-ambient.js (the Web Audio baarish synthesizer). When the
   🌧️ "Baarish?" pill is toggled on, this module makes rain fall across the
   whole website on a fixed, click-through <canvas>:

     • depth-layered rain streaks (far drops are thin & slow, near ones fat
       & fast) with a gentle gusting slant
     • splash ripples where drops meet the bottom edge
     • a soft distant-lightning flicker that syncs with the thunder rumble
       (rain-ambient.js fires a `tcs:thunder` window event)
     • the Baarish Volume slider also drives the visual downpour via
       setIntensity(0..1)

   Respectful defaults: the canvas never intercepts clicks, it sits below the
   modal dialogs, and visitors who prefer reduced motion get the calm monsoon
   tint with a single static frame — no animation, no lightning.
   ========================================================================== */

const RainVisual = (function () {
  let canvas = null;
  let ctx = null;
  let on = false;            // logical state (button says "rain on")
  let raf = 0;               // animation frame id (0 = idle)
  let lastT = 0;             // last frame timestamp for dt
  let W = 0, H = 0, dpr = 1; // canvas metrics
  let intensity = 0.45;      // 0..1 — follows the Baarish volume slider
  let drops = [];
  let splashes = [];
  let flash = 0;             // lightning brightness 0..1
  let flashTimer = 0;        // second strike of the double-flicker
  let gustT = 0;             // slow clock behind the wind gusts
  let fadeHold = null;       // timeout id that stops the loop after fade-out
  const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- depth-layered drops ---------- */
  function targetCount() {
    const area = Math.max(W * H, 1);
    const base = area / 11000;                       // ~130 drops on a 1366×768
    return Math.max(50, Math.min(340, Math.round(base * (0.45 + intensity * 1.25))));
  }

  function newDrop(fromTop) {
    const depth = Math.random();                     // 0 = far, 1 = near
    return {
      depth,
      x: rand(-60, W + 20),
      y: fromTop ? rand(-80, -10) : rand(-40, H),
      len: 9 + depth * 15 + intensity * 6,           // near drops streak longer
      speed: (520 + depth * 640) * (0.65 + intensity * 0.7),
      w: 0.8 + depth * 1.3,
      a: 0.14 + depth * 0.22
    };
  }

  function syncDropCount() {
    const want = targetCount();
    while (drops.length < want) drops.push(newDrop(false));
    if (drops.length > want) drops.length = want;
  }

  /* ---------- splash ripples ---------- */
  function spawnSplash(x) {
    if (splashes.length > 42) return;
    splashes.push({ x, y: H - rand(1, 5), r: 1, maxR: rand(5, 13), life: 1 });
  }

  /* ---------- canvas plumbing ---------- */
  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncDropCount();
  }

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.getElementById("rainCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "rainCanvas";
      canvas.className = "rain-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", resize);
    resize();
  }

  /* ---------- frame ---------- */
  function drawFrame(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // distant lightning — a translucent cool wash that decays fast
    if (flash > 0.008) {
      ctx.fillStyle = "rgba(224, 236, 255, " + (flash * 0.26).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
      flash *= Math.pow(0.0025, dt);                  // exponential decay
    } else {
      flash = 0;
    }

    // gusting wind: a slow sine so the slant drifts like real baarish
    gustT += dt;
    const wind = 0.16 + Math.sin(gustT * 0.5) * 0.06 + Math.sin(gustT * 1.7) * 0.03;

    // rain streaks
    ctx.lineCap = "round";
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y += d.speed * dt;
      d.x += d.speed * wind * dt;
      if (d.y > H) {
        if (d.depth > 0.55) spawnSplash(d.x);         // only near drops splash
        d.y = rand(-90, -20);
        d.x = rand(-60, W + 20);
        continue;
      }
      if (d.x > W + 40) d.x = -50;
      ctx.strokeStyle = "rgba(202, 222, 250, " + d.a.toFixed(3) + ")";
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * wind, d.y - d.len);
      ctx.stroke();
    }

    // splashes — tiny rising droplets that fade
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= dt * 2.4;
      if (s.life <= 0) { splashes.splice(i, 1); continue; }
      s.r = s.maxR * (1 - s.life);
      ctx.strokeStyle = "rgba(210, 228, 252, " + (s.life * 0.35).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }

  function loop(t) {
    if (!on && flash <= 0.008 && canvas.style.opacity !== "1") {
      raf = 0;
      return;                                        // fade-out finished — rest
    }
    const dt = Math.min((t - lastT) / 1000 || 0.016, 0.05);
    lastT = t;
    drawFrame(dt);
    raf = requestAnimationFrame(loop);
  }

  function kickLoop() {
    if (raf || reduced) return;
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- lightning sync (fired by rain-ambient.js) ---------- */
  function onThunder(e) {
    if (!on || reduced) return;
    const power = e && e.detail ? Math.max(0.4, Math.min(1, Number(e.detail.power) || 1)) : 1;
    flash = Math.max(flash, 0.4 + 0.35 * power);
    clearTimeout(flashTimer);                        // classic double flicker
    flashTimer = setTimeout(() => { flash = Math.max(flash, 0.28 * power); }, 130);
    kickLoop();
  }

  /* ---------- public API ---------- */
  function start() {
    ensureCanvas();
    on = true;
    clearTimeout(fadeHold);
    canvas.classList.add("rain-on");
    syncDropCount();
    if (reduced) {
      drawFrame(0);                                  // calm static frame, no loop
    } else {
      kickLoop();
    }
  }

  function stop() {
    on = false;
    splashes.length = 0;
    flash = 0;
    if (!canvas) return;
    canvas.classList.remove("rain-on");
    if (reduced && ctx) {
      ctx.clearRect(0, 0, W, H);
      return;
    }
    // let the CSS fade-out finish, then park the loop
    clearTimeout(fadeHold);
    fadeHold = setTimeout(() => {
      if (!on && ctx) {
        ctx.clearRect(0, 0, W, H);
        drops = [];
      }
    }, 1400);
    kickLoop();                                      // keep clearing during fade
  }

  function setIntensity(pct) {
    intensity = Math.max(0, Math.min(1, Number(pct) || 0));
    if (canvas) syncDropCount();
    if (on && reduced && ctx) drawFrame(0);          // refresh the static frame
  }

  function isOn() {
    return on;
  }

  window.addEventListener("tcs:thunder", onThunder);

  return {
    start,
    stop,
    setIntensity,
    isOn
  };
})();

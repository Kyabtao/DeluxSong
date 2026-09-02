/* ==========================================================================
   TCS RADIO - MONSOON RAIN & THUNDER WEBAUDIO AMBIENCE
   Developed by Umair
   ========================================================================== */

const RainAmbient = (function () {
  let actx = null, rainGain = null, rainOn = false;

  function makeRain() {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const len = actx.sampleRate * 3;
    const buf = actx.createBuffer(1, len, actx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2 + w * 0.25;
    }
    
    const src = actx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    
    const hp = actx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 220;
    
    rainGain = actx.createGain();
    rainGain.gain.value = 0;
    
    src.connect(hp);
    hp.connect(lp);
    lp.connect(rainGain);
    rainGain.connect(actx.destination);
    src.start();

    // Occasional distant gentle thunder
    setInterval(() => {
      if (!rainOn || Math.random() > 0.25) return;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine";
      o.frequency.value = 55 + Math.random() * 30;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25 * (rainGain.gain.value / 0.45 || 1), actx.currentTime + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3);
      o.connect(g);
      g.connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + 3.2);
    }, 18000);
  }

  function toggle(volumePercent) {
    if (!actx) makeRain();
    if (actx.state === "suspended") actx.resume();
    rainOn = !rainOn;
    
    const targetGain = rainOn ? (Number(volumePercent) / 100) * 0.5 : 0;
    rainGain.gain.setTargetAtTime(targetGain, actx.currentTime, 0.4);
    return rainOn;
  }

  function setVolume(volumePercent) {
    if (rainGain && rainOn && actx) {
      rainGain.gain.setTargetAtTime((Number(volumePercent) / 100) * 0.5, actx.currentTime, 0.1);
    }
  }

  function isPlaying() {
    return rainOn;
  }

  return {
    toggle,
    setVolume,
    isPlaying
  };
})();

// Hop Hop Runner: Sound effects, the tune, its fx and the drum loops (Web Audio).

// ---------- sound effects, synthesised with Web Audio ----------
const sfx = (() => {
  let ctx = null, master = null, noiseBuf = null, hum = null, roar = null;
  let on = true;
  try { on = localStorage.getItem('hopRunnerSound') !== 'off'; } catch (e) {}
  function unlock() {
    // iPad Safari only lets sound start inside a tap
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = on ? 0.55 : 0;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      loadLoop();
    }
    if (ctx.state === 'suspended') ctx.resume();
  }
  function tone(type, f0, f1, dur, vol = 0.3, delay = 0, dest = null) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, freq, vol = 0.3, q = 1, type = 'bandpass', delay = 0, dest = null) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || master);
    src.start(t); src.stop(t + dur + 0.05);
  }
  // a bouncy little tune (C, A minor, F, G) that speeds up as she runs faster
  let musicGain = null, musicTimer = null, musicStep = 0, musicNext = 0, musicBpm = 120, musicSparkle = false;
  // the faster she runs, the more the music goes wobbly: a 64-bar pitch sweep of up to an octave,
  // and a stereo ping-pong delay (dotted 1/8) fed through a wandering frequency shifter
  let muffler = null, muffled = false; // the music sounds muffled under the sea
  let musicFx = 0, fxAmt = 0, fxSend = null, delayL = null, delayR = null;
  // Dad's drum loops (4 bars at 148 bpm), locked to the music's bars and played at its tempo.
  // role 'zoom' comes in while she zooms; 'extra' loops drift in now and then (sometimes quiet, sometimes full)
  // and during the jetpack and rainbow star; 'magnet' plays quietly through a dotted-1/8 ping-pong echo
  // while the magnet is on. To add a loop, add another entry to LOOPS.
  const LOOPS = [
    { name: 'elixir_Init_kit_148bpm_4bar_1', role: 'zoom', src: 'audio/elixir_Init_kit_148bpm_4bar_1.mp3' },
    { name: 'elixir_Init_kit_148bpm_4bar_2', role: 'extra', src: 'audio/elixir_Init_kit_148bpm_4bar_2.mp3' },
    { name: 'elixir_Init_kit_148bpm_4bar_3', role: 'extra', src: 'audio/elixir_Init_kit_148bpm_4bar_3.mp3' },
    { name: 'elixir_Init_kit_148bpm_4bar_4', role: 'magnet', src: 'audio/elixir_Init_kit_148bpm_4bar_4.mp3' },
    { name: 'elixir_Init_kit_148bpm_4bar_5', role: 'extra', src: 'audio/elixir_Init_kit_148bpm_4bar_5.mp3' },
  ];
  const LOOP_BPM = 148, LOOP_BEATS = 16, LOOP_VOL = 0.5, LOOP_QUIET = 0.18;
  const loopBufs = [], loopOffsets = [];
  const layers = { zoom: { want: null, cur: null }, extra: { want: null, cur: null }, magnet: { want: null, cur: null } };
  let loopMagnet = false, magnetIn = null, magDelayL = null, magDelayR = null;
  const roleIdx = (r) => LOOPS.findIndex(L => L.role === r);
  let loopZoom = false, loopPower = false, ambient = null, ambientBars = 12, powerPick = -1;
  // the loop files start downloading straight away, so they're ready by the first tap
  // (the one-file build bakes them in as data: URLs instead)
  const loopFiles = LOOPS.map(L => L.src.startsWith('data:') ? null : fetch(L.src).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null));
  function loopBytes(L, idx) {
    if (loopFiles[idx]) return loopFiles[idx];
    const bin = atob(L.src.split(',')[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return Promise.resolve(bytes.buffer);
  }
  function loadLoop() {
    LOOPS.forEach((L, idx) => {
      const done = (b) => {
        loopBufs[idx] = b;
        // skip any silence the mp3 encoder put at the front, so the loop stays tight
        const d = b.getChannelData(0);
        let i = 0;
        while (i < d.length && Math.abs(d[i]) < 0.1) i++;
        loopOffsets[idx] = i < b.sampleRate * 0.2 ? i / b.sampleRate : 0;
      };
      let got;
      try { got = loopBytes(L, idx); } catch (e) { return; } // a bad loop never stops the game
      got.then(buf => {
        if (!buf) return;
        const pr = ctx.decodeAudioData(buf, done, () => {});
        if (pr && pr.catch) pr.catch(() => {});
      });
    });
  }
  const extraPick = () => {
    const pool = LOOPS.map((L, i) => L.role === 'extra' ? i : -1).filter(i => i >= 0);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : 0;
  };
  function stopLayer(layer) {
    if (!layer.cur) return;
    const l = layer.cur; layer.cur = null;
    l.g.gain.cancelScheduledValues(ctx.currentTime);
    l.g.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    l.src.stop(ctx.currentTime + 2);
  }
  function startLayer(layer, at) {
    const w = layer.want, buf = loopBufs[w.idx];
    if (!buf) return;
    const off = loopOffsets[w.idx] || 0;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf; src.loop = true;
    src.loopStart = off; src.loopEnd = off + LOOP_BEATS * 60 / LOOP_BPM;
    src.playbackRate.value = musicBpm / LOOP_BPM;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(w.vol, at + 0.6);
    src.connect(g); g.connect(layer === layers.magnet && magnetIn ? magnetIn : musicGain);
    src.start(at, off);
    layer.cur = { src, g, idx: w.idx, vol: w.vol };
  }
  function updateLayers() {
    // what should be playing: the zoom loop wins, then a power-up loop, then the odd quiet or loud one
    if (loopPower && powerPick < 0) powerPick = extraPick();
    if (!loopPower) powerPick = -1;
    layers.zoom.want = loopZoom ? { idx: Math.max(0, roleIdx('zoom')), vol: LOOP_VOL } : null;
    layers.magnet.want = loopMagnet && roleIdx('magnet') >= 0 ? { idx: roleIdx('magnet'), vol: LOOP_QUIET } : null;
    layers.extra.want = loopZoom ? null : loopPower ? { idx: powerPick, vol: LOOP_VOL } : ambient;
    for (const k in layers) {
      const L = layers[k];
      if (L.cur && (!L.want || L.want.idx !== L.cur.idx)) stopLayer(L);
      if (L.cur) {
        L.cur.src.playbackRate.setTargetAtTime(musicBpm / LOOP_BPM, ctx.currentTime, 0.1);
        if (L.want.vol !== L.cur.vol) { L.cur.vol = L.want.vol; L.cur.g.gain.setTargetAtTime(L.cur.vol, ctx.currentTime, 0.8); }
      }
    }
  }
  function onBar(at) {
    // every so often a loop drifts in for 8-16 bars, then rests for 8-20
    if (--ambientBars <= 0) {
      if (ambient) { ambient = null; ambientBars = 8 + 4 * Math.floor(Math.random() * 4); }
      else { ambient = { idx: extraPick(), vol: Math.random() < 0.5 ? LOOP_QUIET : LOOP_VOL }; ambientBars = 8 + 4 * Math.floor(Math.random() * 3); }
      updateLayers();
    }
    for (const k in layers) if (layers[k].want && !layers[k].cur) startLayer(layers[k], at);
  }
  const SHIFTER = `
    const A1 = [0.6923878, 0.9360654322959, 0.9882295226860, 0.9987488452737].map(a => a * a);
    const A2 = [0.4021921162426, 0.8561710882420, 0.9722909545651, 0.9952884791278].map(a => a * a);
    const mk = () => ({ s1: A1.map(() => [0, 0, 0, 0]), s2: A2.map(() => [0, 0, 0, 0]), d: 0 });
    function ap(st, A, x) {
      for (let k = 0; k < 4; k++) { const q = st[k]; const y = A[k] * (x + q[3]) - q[1]; q[1] = q[0]; q[0] = x; q[3] = q[2]; q[2] = y; x = y; }
      return x;
    }
    class Shifter extends AudioWorkletProcessor {
      constructor() { super(); this.ph = 0; this.f = 0; this.target = 0; this.t = 0; this.st = []; }
      process(inputs, outputs) {
        const inp = inputs[0], out = outputs[0];
        this.t -= 128 / sampleRate;
        if (this.t <= 0) { this.target = (Math.random() * 2 - 1) * 40; this.t = 0.4 + Math.random() * 0.9; }
        let ph = this.ph, f = this.f;
        for (let c = 0; c < out.length; c++) {
          const i = inp[c] || inp[0], o = out[c];
          if (!i) { o.fill(0); continue; }
          const st = this.st[c] || (this.st[c] = mk());
          ph = this.ph; f = this.f;
          for (let n = 0; n < o.length; n++) {
            f += (this.target - f) * 0.00006;
            const re = ap(st.s1, A1, i[n]), I = st.d; st.d = re;
            const Q = ap(st.s2, A2, i[n]);
            ph += 2 * Math.PI * f / sampleRate;
            o[n] = I * Math.cos(ph) - Q * Math.sin(ph);
          }
        }
        this.ph = ph % (2 * Math.PI); this.f = f;
        return true;
      }
    }
    registerProcessor('hop-shifter', Shifter);`;
  function buildFx() {
    fxSend = ctx.createGain(); fxSend.gain.value = 0;
    delayL = ctx.createDelay(2); delayR = ctx.createDelay(2);
    const fb = ctx.createGain(); fb.gain.value = 0.45;
    const merge = ctx.createChannelMerger(2);
    const wet = ctx.createGain(); wet.gain.value = 0.8;
    musicGain.connect(fxSend);
    fxSend.connect(delayL);
    delayL.connect(delayR); delayR.connect(fb); fb.connect(delayL); // bounces left, right, left...
    delayL.connect(merge, 0, 0); delayR.connect(merge, 0, 1);
    merge.connect(wet); wet.connect(master);
    // the magnet loop's own ping-pong echo
    magnetIn = ctx.createGain();
    magDelayL = ctx.createDelay(2); magDelayR = ctx.createDelay(2);
    const mfb = ctx.createGain(); mfb.gain.value = 0.4;
    const mmerge = ctx.createChannelMerger(2), mwet = ctx.createGain(); mwet.gain.value = 0.7;
    magnetIn.connect(musicGain);
    magnetIn.connect(magDelayL);
    magDelayL.connect(magDelayR); magDelayR.connect(mfb); mfb.connect(magDelayL);
    magDelayL.connect(mmerge, 0, 0); magDelayR.connect(mmerge, 0, 1);
    mmerge.connect(mwet); mwet.connect(musicGain);
    if (ctx.audioWorklet && window.Blob && window.URL) {
      ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([SHIFTER], { type: 'application/javascript' }))).then(() => {
        const shift = new AudioWorkletNode(ctx, 'hop-shifter', { outputChannelCount: [2] });
        merge.disconnect();
        merge.connect(shift); shift.connect(wet);
      }).catch(() => {}); // no shifter: the plain ping-pong delay still works
    }
  }
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const SONG = [72, 0, 76, 79, 76, 0, 72, 74, 76, 0, 72, 69, 72, 0, 76, 0, 77, 0, 76, 74, 72, 0, 69, 72, 74, 0, 71, 74, 79, 0, 77, 74];
  const ROOTS = [48, 45, 41, 43];
  function musicTick() {
    if (!ctx) return;
    if (musicNext < ctx.currentTime) musicNext = ctx.currentTime + 0.05;
    const eighth = 30 / musicBpm;
    fxAmt += (musicFx - fxAmt) * 0.02; // glides in and out over a couple of seconds
    if (fxSend) {
      fxSend.gain.setTargetAtTime(fxAmt * 0.55, ctx.currentTime, 0.3);
      delayL.delayTime.setTargetAtTime(eighth * 1.5, ctx.currentTime, 0.2);
      delayR.delayTime.setTargetAtTime(eighth * 1.5, ctx.currentTime, 0.2);
      magDelayL.delayTime.setTargetAtTime(eighth * 1.5, ctx.currentTime, 0.2); // dotted 1/8
      magDelayR.delayTime.setTargetAtTime(eighth * 1.5, ctx.currentTime, 0.2);
    }
    updateLayers();
    while (musicNext < ctx.currentTime + 0.15) {
      const d = musicNext - ctx.currentTime, k = musicStep % 32;
      if (k % 8 === 0) onBar(musicNext); // loops start on a bar
      const lfo = Math.pow(2, fxAmt * 0.5 * (1 - Math.cos(2 * Math.PI * (musicStep / 8) / 64))); // up an octave and back over 64 bars
      const bass = midi(ROOTS[k >> 3] + (k % 2 ? 12 : 0)) * lfo;
      tone('triangle', bass, bass, eighth * 0.8, 0.13, d, musicGain);
      if (SONG[k]) { const f = midi(SONG[k] + (musicSparkle ? 12 : 0)) * lfo; tone('square', f, f, eighth * 0.75, 0.045, d, musicGain); }
      if (musicSparkle && k % 2) { const f = midi(SONG[(k + 31) % 32] || 79) * 2 * lfo; tone('sine', f, f, eighth * 0.5, 0.04, d, musicGain); }
      if (k % 4 === 0) tone('sine', 150, 45, 0.16, 0.3, d, musicGain);
      if (k % 4 === 2) noise(0.1, 1800, 0.1, 0.8, 'bandpass', d, musicGain);
      if (k % 2) noise(0.04, 8000, 0.05, 0.7, 'highpass', d, musicGain);
      musicNext += eighth; musicStep++;
    }
  }
  return {
    unlock,
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem('hopRunnerSound', on ? 'on' : 'off'); } catch (e) {}
      if (master) master.gain.value = on ? 0.55 : 0;
      if (!on) { this.hum(false); this.roar(false); }
      return on;
    },
    music(play) {
      if (!ctx) return;
      if (play && !musicTimer) {
        if (!musicGain) { musicGain = ctx.createGain(); musicGain.gain.value = 0.55; muffler = ctx.createBiquadFilter(); muffler.type = 'lowpass'; muffler.frequency.value = muffled ? 900 : 20000; musicGain.connect(muffler); muffler.connect(master); buildFx(); }
        musicStep = 0;
        musicNext = ctx.currentTime + 0.1;
        musicTimer = setInterval(musicTick, 40);
      } else if (!play && musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
        loopZoom = loopPower = loopMagnet = false; ambient = null; ambientBars = 12;
        updateLayers();
      }
    },
    get loops() { return { zoom: layers.zoom.cur && layers.zoom.cur.vol, extra: layers.extra.cur && [layers.extra.cur.idx, layers.extra.cur.vol], magnet: layers.magnet.cur && [layers.magnet.cur.idx, layers.magnet.cur.vol], decoded: loopBufs.filter(Boolean).length }; }, // for testing
    muffle(on) { muffled = on; if (muffler) muffler.frequency.setTargetAtTime(on ? 900 : 20000, ctx.currentTime, 0.3); },
    splash() { noise(0.6, 900, 0.35, 0.6); [600, 800, 1000, 1300, 900, 1500].forEach((f, k) => tone('sine', f, f * 1.6, 0.09, 0.08, 0.1 + k * 0.07)); },
    blub(delay = 0) { tone('sine', 500 + Math.random() * 500, 1400, 0.08, 0.05, delay); },
    setMusic(bpm, sparkle, fx = 0, zoom = false, power = false, magnet = false) { musicBpm = bpm; musicSparkle = sparkle; musicFx = fx; loopZoom = zoom; loopPower = power; loopMagnet = magnet; },
    jump() { tone('square', 330, 660, 0.14, 0.12); },
    lane() { noise(0.12, 1400, 0.12, 0.8); },
    coin(n = 1) {
      // each coin in a chain rings a note higher
      const k = Math.pow(2, [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][(n - 1) % 10] / 12);
      tone('sine', 988 * k, 988 * k, 0.08, 0.2); tone('sine', 1319 * k, 1319 * k, 0.2, 0.2, 0.06);
    },
    combo() { [784, 988, 1175, 1568, 1976, 2349].forEach((f, k) => tone('square', f, f, 0.1, 0.07, k * 0.05)); tone('triangle', 523, 1047, 0.4, 0.12); },
    land(v) { noise(0.09, 260, Math.min(0.3, 0.04 + v * 0.012), 0.7, 'lowpass'); },
    smash() { noise(0.25, 1200, 0.35, 0.6); tone('square', 900, 200, 0.18, 0.08); tone('sine', 1568, 2637, 0.15, 0.08, 0.05); },
    jetGo() { noise(0.8, 700, 0.3, 0.5); tone('sawtooth', 110, 440, 0.6, 0.08); tone('sine', 300, 1200, 0.5, 0.1, 0.1); },
    starGo() { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, k) => tone('triangle', f, f, 0.12, 0.12, k * 0.045)); },
    bounce() { tone('sine', 180, 720, 0.35, 0.3); },
    launch() { noise(0.4, 900, 0.18, 0.6); tone('triangle', 300, 900, 0.35, 0.15); },
    stumble() { noise(0.18, 220, 0.5, 0.7, 'lowpass'); tone('triangle', 420, 160, 0.35, 0.2, 0.03); },
    whistle() { for (let k = 0; k < 4; k++) tone('square', k % 2 ? 2100 : 2500, k % 2 ? 2100 : 2500, 0.11, 0.07, k * 0.11); },
    bonk() { noise(0.3, 160, 0.6, 0.8, 'lowpass'); tone('sine', 300, 70, 0.5, 0.35); },
    caught() { this.whistle(); tone('sawtooth', 500, 200, 0.6, 0.08, 0.5); },
    portal() { tone('sine', 300, 1600, 0.7, 0.2); tone('triangle', 450, 2400, 0.7, 0.12, 0.08); noise(0.7, 3000, 0.08, 0.5, 'highpass'); },
    cheer() { [523, 659, 784, 1047, 1319].forEach((f, k) => tone('square', f, f, 0.12, 0.07, k * 0.08)); },
    twirl() { tone('triangle', 500, 1400, 0.45, 0.12); },
    quack(delay = 0) { tone('sawtooth', 620, 330, 0.16, 0.09, delay); tone('square', 900, 500, 0.12, 0.04, delay); },
    huff() { noise(0.35, 700, 0.12, 0.8, 'lowpass'); tone('triangle', 300, 220, 0.25, 0.04, 0.05); }, // a cross 'hmph!'
    jingle() { [523, 659, 784, 659, 784, 1047, 988, 1047].forEach((f, k) => tone('triangle', f, f, 0.14, 0.06, k * 0.12)); }, // a fairground organ tune
    woof() { tone('square', 440, 250, 0.07, 0.05); tone('square', 400, 230, 0.09, 0.05, 0.13); },
    meow() { tone('triangle', 650, 1050, 0.14, 0.05); tone('triangle', 1050, 560, 0.3, 0.05, 0.13); },
    boo() { tone('sine', 320, 520, 0.5, 0.07); tone('sine', 520, 300, 0.7, 0.06, 0.45); tone('triangle', 640, 1040, 0.5, 0.025); },
    liftoff() { noise(2.2, 260, 0.22, 0.5, 'lowpass'); tone('sawtooth', 70, 160, 2, 0.05); },
    tunnel() { noise(1.2, 300, 0.2, 0.5, 'lowpass'); },
    magnet() { tone('sine', 220, 440, 0.25, 0.2); tone('sine', 440, 880, 0.25, 0.15, 0.12); tone('square', 880, 880, 0.08, 0.06, 0.3); },
    boardGet() { [523, 659, 784, 1047].forEach((f, k) => tone('triangle', f, f, 0.14, 0.18, k * 0.07)); },
    zoom() { noise(0.9, 600, 0.25, 0.4, 'bandpass'); tone('sawtooth', 120, 900, 0.8, 0.1); tone('sine', 400, 2000, 0.6, 0.12, 0.1); },
    mystery() { [784, 988, 1175, 1568, 1976].forEach((f, k) => tone('sine', f, f, 0.18, 0.15, k * 0.05)); noise(0.3, 6000, 0.08, 0.5, 'highpass'); },
    boardBreak() { noise(0.35, 1800, 0.4, 0.6); tone('square', 600, 120, 0.3, 0.1); },
    roar(start) {
      // the jetpack's rumble
      if (!ctx) return;
      if (start && on && !roar) {
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = noiseBuf; src.loop = true;
        f.type = 'lowpass'; f.frequency.value = 520;
        g.gain.value = 0.09;
        src.connect(f); f.connect(g); g.connect(master);
        src.start();
        roar = { src, g };
      } else if (!start && roar) {
        const r = roar; roar = null;
        r.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        r.src.stop(ctx.currentTime + 0.5);
      }
    },
    hum(start) {
      if (!ctx) return;
      if (start && on && !hum) {
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = 70;
        o2.type = 'sine'; o2.frequency.value = 140;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
        g.gain.value = 0.05;
        o.connect(f); o2.connect(f); f.connect(g); g.connect(master);
        o.start(); o2.start();
        hum = { o, o2, g };
      } else if (!start && hum) {
        const h = hum; hum = null;
        h.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        h.o.stop(ctx.currentTime + 0.3); h.o2.stop(ctx.currentTime + 0.3);
      }
    },
  };
})();

/* SND — one unified sound system: page BGM (wav), per-world chiptune songs (in-browser sequencer),
   and game SFX: one switch, persisted as localStorage 'sound-on'.
   小八's spider sounds are separate: they play after the first gesture anywhere, with their own switch ('spider-sound'). */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var on = localStorage.getItem('sound-on') === '1', stageGain = null, stageLevel = 1;
  var spOn = localStorage.getItem('spider-sound') !== '0', spListeners = [];
  var duck = null, lowFx = false;
  /* measured music RMS per world (audit/audio_bal.json) -> gain that brings every song to about -24 dBFS */
  var NORM = { home: 1.02, park: 0.89, market: 1.02, xian: 1.2, ink: 1.22, sakura: 1.2, cyber: 0.9, bit8: 0.86, steam: 0.89, desert: 1.11, court: 1.06, sea: 1.1,
    skycity: 1.04, volcano: 0.79, space: 1.08, mirror: 0.94, candy: 0.91, haunt: 1.26, snow: 1.15, cabin: 1.22, ridge: 0.81, cave: 1.33, peak: 0.75, lake: 1.05 };
  var ctx = null, master, musicBus, sfxBus, spiderBus, pageGain, pageEl = null, pageSrc = null, noiseBuf = null, waves = {};
  var players = [], gameState = 'title', wantWorld = -1, pageTimer = null, listeners = [];
  var PAGE = { bpm: 92, root: 60, scale: [0, 2, 4, 5, 7, 9, 11] }; /* matches tools/compose_loop.py (C major, 92 BPM) */

  function init() {
    if (ctx || !AC) return !!ctx;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = on ? 1 : 0;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    stageGain = ctx.createGain(); stageGain.gain.value = on ? stageLevel : 0; master.connect(stageGain); stageGain.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.55; duck = ctx.createGain(); duck.gain.value = 1; musicBus.connect(duck); duck.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 1.42; sfxBus.connect(master); /* +4 dB: jump / shard used to sit under the music */
    spiderBus = ctx.createGain(); spiderBus.gain.value = 0.42; spiderBus.connect(comp); /* not under master: the SOUND switch doesn't mute 小八 */
    pageGain = ctx.createGain(); pageGain.gain.value = 0; pageGain.connect(musicBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(pump, 25);
    return true;
  }
  function pulseWave(duty) {
    if (waves[duty]) return waves[duty];
    var n = 48, re = new Float32Array(n), im = new Float32Array(n);
    for (var k = 1; k < n; k++) re[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty);
    return (waves[duty] = ctx.createPeriodicWave(re, im));
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function tone(dest, type, f, t, dur, vol, opt) {
    opt = opt || {};
    var o = ctx.createOscillator(), v = ctx.createGain();
    if (typeof type === 'number') o.setPeriodicWave(pulseWave(type)); else o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (opt.slide) o.frequency.exponentialRampToValueAtTime(opt.slide, t + (opt.slideT || dur));
    if (opt.vib && dur > 0.25) { var l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + dur); l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    var a = opt.a || 0.004, sus = opt.sus === undefined ? 0.65 : opt.sus;
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(vol, t + a);
    v.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * sus), t + a + Math.min(0.12, dur * 0.5));
    v.gain.setValueAtTime(Math.max(0.0001, vol * sus), t + dur);
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur + (opt.rel || 0.05));
    o.connect(v); v.connect(dest); o.start(t); o.stop(t + dur + (opt.rel || 0.05) + 0.02);
  }
  function noise(dest, t, dur, vol, ftype, freq, q) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
    s.buffer = noiseBuf; f.type = ftype || 'highpass'; f.frequency.value = freq || 6000; if (q) f.Q.value = q;
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(v); v.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    return f;
  }

  /* ---------- songs: one per world ----------
     mel: 8 bars x 8 eighth-notes. char -> scale step: '0'=-2 '1'=-1 '2'=root ... '9'=octave, 'a'.. above; '.' rest, '-' hold.
     ch: chord degree per bar on harmony scale. bass: pump|oct|half|walk. dr: drum pattern name. */
  var MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], HMIN = [0, 2, 3, 5, 7, 8, 11];
  var PENT = [0, 2, 4, 7, 9], MPENT = [0, 3, 5, 7, 10], INS = [0, 1, 5, 7, 8], PHRD = [0, 1, 4, 5, 7, 8, 10], LYD = [0, 2, 4, 6, 7, 9, 11];
  var SONGS = {
    home:    { bpm: 132, root: 60, sc: MAJ, duty: 0.25, ch: '15641545', bass: 'oct', dr: 'pop', arp: 1, mel: '6-9-8-6- 5-6-5-3- 4-6-9-b- a-9-8--- 6-9-8-6- 5-6-9-a- b-a-9-8- 9-----..' },
    park:    { bpm: 126, root: 67, sc: MAJ, duty: 0.5, ch: '14156451', bass: 'walk', dr: 'pop', arp: 0, mel: '2-4-6-4- 5-7-9-7- 6-5-4-5- 6---3--- 4-6-9-6- 7-5-4-2- 3-4-5-3- 2-----..' },
    market:  { bpm: 112, root: 64, sc: MIN, duty: 0.25, ch: '16714651', bass: 'pump', dr: 'swing', arp: 1, mel: '2.2.4-5- 6-9-8-6- 8-6-5-4- 5-6-2--- 9-9.8-6- 5-6-8-9- 8-6-5-4- 2-----..' },
    xian:    { bpm: 100, root: 62, sc: PENT, hs: MAJ, duty: 0.125, ch: '16451645', bass: 'half', dr: 'half', arp: 1, mel: '5-6-7--- 8-7-6-5- 4-5-6--- 5-4-2--- 5-6-7-9- 8---7-6- 5-6-4-3- 2-------' },
    court:   { bpm: 88, root: 65, sc: PENT, hs: MAJ, duty: 0.5, ch: '14361451', bass: 'walk', dr: 'swing', arp: 1, mel: '4-5-6--- 7-6-5--- 4-5-3-2- 3------- 6-7-8-7- 6-5-4--- 5-4-3-4- 2-------' },
    ink:     { bpm: 84, root: 57, sc: MPENT, hs: MIN, duty: 0.5, ch: '14651465', bass: 'half', dr: 'none', arp: 0, mel: '2---4-5- 6---5-4- 5-4-2--- 1-2----- 6-7-8--- 7-6-5-4- 5---4-2- 2-----..' },
    sakura:  { bpm: 96, root: 64, sc: INS, hs: MIN, duty: 0.25, ch: '14151465', bass: 'half', dr: 'half', arp: 1, mel: '2-3-4--- 2-3-4--- 5-4-3-2- 3-1-2--- 4-5-6--- 7-6-5-4- 5-4-3-2- 2-------' },
    cyber:   { bpm: 140, root: 57, sc: MIN, duty: 0.125, ch: '16371637', bass: 'oct', dr: 'four', arp: 1, mel: '2-2-9-8- 6-5-6-4- 2-2-9-8- a-9-8-9- b-a-9-8- 6-8-9-6- 5-4-5-6- 2---.2..' },
    bit8:    { bpm: 150, root: 60, sc: MAJ, duty: 0.5, ch: '11441545', bass: 'pump', dr: 'pop', arp: 0, mel: '9-9-.-9- .-7-9--- b---.--- 6---.--- 7-..6-.. 4-..6-7- 8-7-6-9- b-c-a-b-' },
    steam:   { bpm: 116, root: 62, sc: HMIN, duty: 0.25, ch: '14511451', bass: 'walk', dr: 'rock', arp: 1, mel: '2-4-6-9- 8-6-8--- 5-7-9-c- b-9-b--- 9-8-7-6- 7-6-5-4- 5-4-3-1- 2-------' },
    desert:  { bpm: 104, root: 64, sc: PHRD, duty: 0.25, ch: '12171217', bass: 'pump', dr: 'swing', arp: 1, mel: '2-3-4--- 5-4-3-2- 4-5-6-7- 6---.--- 9-8-7-6- 7-6-5-4- 3-4-3-2- 2-------' },
    sea:     { bpm: 92, root: 65, sc: MAJ, duty: 0.5, ch: '13642511', bass: 'half', dr: 'half', arp: 1, mel: '6---5-4- 5---4-2- 3-4-5-6- 4------- 6---9-8- 6---5-4- 5-4-3-1- 2-------' },
    skycity: { bpm: 120, root: 67, sc: LYD, duty: 0.25, ch: '12121245', bass: 'oct', dr: 'pop', arp: 1, mel: '2-4-5-6- 9---6--- 5-6-8-9- a---9--- b-a-9-6- 5-6-9-8- 6-5-4-5- 2-------' },
    volcano: { bpm: 160, root: 64, sc: HMIN, duty: 0.125, ch: '16571657', bass: 'oct', dr: 'rock', arp: 0, mel: '2.2.2.3. 4.4.4.5. 6.6.5.4. 3.4.1... 9.9.8.9. 7.6.5.6. 4.3.4.1. 2...2...' },
    space:   { bpm: 100, root: 62, sc: LYD, duty: 0.5, ch: '12121265', bass: 'half', dr: 'half', arp: 1, mel: '2---6--- 9-----8- 6---5--- 6------- 4---6--- 9---a--- b---a-9- 6-------' },
    mirror:  { bpm: 128, root: 59, sc: MIN, duty: 0.25, ch: '16371645', bass: 'oct', dr: 'four', arp: 1, mel: '9-8-6-8- 9-b-a-9- 8-6-5-6- 8------- 6-5-4-5- 6-8-9-6- 5-4-3-4- 2-------' },
    candy:   { bpm: 138, root: 65, sc: MAJ, duty: 0.25, ch: '16251625', bass: 'pump', dr: 'pop', arp: 1, mel: '2-4-6-4- 9-6-4-6- 3-5-7-5- 8-7-6--- 2-4-6-9- b-a-9-6- 7-6-5-3- 2---2---' },
    haunt:   { bpm: 96, root: 62, sc: HMIN, duty: 0.125, ch: '14651455', bass: 'half', dr: 'half', arp: 1, mel: '2---5--- 4-3-2-1- 2---6--- 5-----.. 9---8--- 7-6-5-4- 3-2-1-0- 1-------' },
    snow:    { bpm: 108, root: 62, sc: MAJ, duty: 0.5, ch: '15641451', bass: 'walk', dr: 'half', arp: 1, mel: '6-5-4-5- 6---6--- 5-4-3-4- 5------- 6-8-9-8- 6-5-4-3- 4-3-2-1- 2-------' },
    cabin:   { bpm: 84, root: 55, sc: MAJ, duty: 0.5, ch: '14151451', bass: 'half', dr: 'none', arp: 1, mel: '4---5-4- 2---0--- 1-2-4-5- 4------- 6---7-6- 4---2--- 3-4-5-3- 2-------' },
    ridge:   { bpm: 132, root: 60, sc: MIN, duty: 0.25, ch: '16471645', bass: 'oct', dr: 'rock', arp: 0, mel: '2-2-5-2- 6-2-5-4- 2-2-5-2- 7-6-5-4- 9-8-6-5- 6-5-4-3- 4-5-6-8- 9-------' },
    cave:    { bpm: 76, root: 57, sc: MIN, duty: 0.5, ch: '14161465', bass: 'half', dr: 'none', arp: 1, mel: '2---.--- 4---3--- 1---.--- 2------- 5---6--- 4---3--- 2---1--- 2-------' },
    peak:    { bpm: 168, root: 64, sc: HMIN, duty: 0.125, ch: '16451655', bass: 'oct', dr: 'rock', arp: 1, mel: '2.9.2.8. 2.6.2.5. 4.b.4.a. 4.9.4.8. 6.d.6.c. 6.b.6.a. 5.9.8.9. 2.2.2...' },
    lake:    { bpm: 104, root: 62, sc: MAJ, duty: 0.25, ch: '15641451', bass: 'walk', dr: 'pop', arp: 1, mel: '6-9-8-9- a-9-8-6- 5-6-8-6- 5-4-3--- 4-6-9-6- 8-7-6-5- 6-4-3-4- 2-------' }
  };
  var DRUMS = {
    pop: ['k...s...k.k.s...', '..h...h...h...h.'], four: ['k...k...k...k...', '..h.s.h...h.s.hh'],
    rock: ['k.k.s...k.kks...', 'h.h.h.h.h.h.h.h.'], swing: ['k.....k.s.......', '..h..h....h..h.h'],
    half: ['k.......s.......', '....h.......h...'], none: ['................', '................']
  };
  Object.keys(SONGS).forEach(function (k) {
    var s = SONGS[k]; s.key = k; s.hs = s.hs || s.sc; s.mel = s.mel.split(' ').map(function (b) { return (b + '--------').slice(0, 8); }).join('');
  });
  function stepNote(sc, root, idx) { var n = sc.length, o = Math.floor(idx / n); return root + o * 12 + sc[((idx % n) + n) % n]; }
  function chordTones(s, bar) { var d = +s.ch[bar % 8] - 1; return [0, 2, 4].map(function (k) { return stepNote(s.hs, s.root, d + k); }); }

  function Player(song, t0) {
    this.s = song; this.t = t0; this.step = 0; this.out = ctx.createGain(); this.out.gain.value = 0.0001;
    this.echo = ctx.createDelay(1); this.echo.delayTime.value = 60 / song.bpm * 0.75; this.eg = ctx.createGain(); this.eg.gain.value = 0.22;
    if (lowFx) this.eg.gain.value = 0;
    this.norm = ctx.createGain(); this.norm.gain.value = NORM[song.key] || 1;
    this.echo.connect(this.eg); this.eg.connect(this.out); this.out.connect(this.norm); this.norm.connect(musicBus); this.stopAt = Infinity;
  }
  Player.prototype.play = function (step, t) {
    var s = this.s, sx = 60 / s.bpm / 4, bar = Math.floor(step / 16), b16 = step % 16, ct = chordTones(s, bar), o = this.out;
    if (step % 2 === 0) {
      var c = s.mel[step / 2];
      if (c && c !== '-' && c !== '.') {
        var len = 1; while (s.mel[step / 2 + len] === '-' && step / 2 + len < 64) len++;
        var m = stepNote(s.sc, s.root + 12, parseInt(c, 36) - 2), dur = len * sx * 2 * 0.92;
        tone(o, s.duty, hz(m), t, dur, 0.09, { vib: 1, rel: 0.06 });
        tone(this.echo, s.duty, hz(m), t, dur * 0.6, 0.05);
      }
    }
    if (s.arp && b16 % 1 === 0) tone(o, 0.25, hz(ct[b16 % 3] + 12), t, sx * 0.7, 0.025, { sus: 0.3 });
    var r = ct[0] - 24, bp = s.bass;
    if (bp === 'pump' && step % 2 === 0) tone(o, 'triangle', hz(r), t, sx * 1.6, 0.16, { sus: 0.8 });
    if (bp === 'oct' && step % 2 === 0) tone(o, 'triangle', hz(r + (step % 4 ? 12 : 0)), t, sx * 1.6, 0.16, { sus: 0.8 });
    if (bp === 'half' && b16 % 8 === 0) tone(o, 'triangle', hz(r + (b16 ? 7 : 0)), t, sx * 7.5, 0.16, { sus: 0.9 });
    if (bp === 'walk' && b16 % 4 === 0) tone(o, 'triangle', hz([ct[0], ct[1], ct[2], ct[1]][b16 / 4] - 24), t, sx * 3.6, 0.16, { sus: 0.85 });
    var dp = DRUMS[s.dr], k = dp[0][b16], h = dp[1][b16];
    if (k === 'k') tone(o, 'sine', 150, t, 0.09, 0.32, { slide: 40, slideT: 0.09, sus: 1 });
    if (k === 's') { noise(o, t, 0.12, 0.14, 'bandpass', 1800, 0.7); tone(o, 'triangle', 220, t, 0.05, 0.08, { slide: 120 }); }
    if (h === 'h') noise(o, t, 0.03, 0.05, 'highpass', 7000);
  };
  function pump() {
    if (!ctx || !on) return;
    var ahead = ctx.currentTime + 0.15;
    players = players.filter(function (p) {
      while (p.t < ahead && p.t < p.stopAt) { if (p.t >= ctx.currentTime - 0.05) p.play(p.step, p.t); p.t += 60 / p.s.bpm / 4; p.step = (p.step + 1) % 128; }
      if (p.t >= p.stopAt && ctx.currentTime > p.stopAt + 0.5) { p.out.disconnect(); p.norm.disconnect(); return false; }
      return true;
    });
  }
  var BIOME_KEYS = null;
  function songFor(i) { var k = BIOME_KEYS ? BIOME_KEYS[i] : null; return SONGS[k] || SONGS.home; }
  function cur() { for (var i = players.length - 1; i >= 0; i--) if (players[i].stopAt === Infinity) return players[i]; return null; }
  function startWorld(i, hard) {
    var song = songFor(i), c = cur();
    if (c && c.s === song) return;
    var now = ctx.currentTime;
    if (!c || hard) {
      players.forEach(function (p) { p.stopAt = now + 0.3; p.out.gain.setTargetAtTime(0.0001, now, 0.08); });
      var p = new Player(song, now + 0.06); p.out.gain.setTargetAtTime(1, now + 0.06, 0.15); players.push(p); return;
    }
    /* musical bridge: switch on the next bar of the old song, with a noise riser on the last beat and a 1-bar crossfade */
    var sx = 60 / c.s.bpm / 4, toBar = (16 - c.step % 16) % 16 || 16, at = c.t + toBar * sx;
    if (at - now > 2.6) at = c.t + ((4 - c.step % 4) % 4 || 4) * sx; /* slow song: next beat instead */
    var beat = sx * 4, f = noise(c.out, Math.max(now, at - beat), beat, 0.08, 'bandpass', 800, 2);
    f.frequency.setValueAtTime(600, Math.max(now, at - beat)); f.frequency.exponentialRampToValueAtTime(7000, at);
    tone(c.out, 0.5, hz(song.root + 12), at - beat / 2, beat / 2, 0.05, { slide: hz(song.root + 24) });
    c.stopAt = at + beat * 4; c.out.gain.setValueAtTime(1, at); c.out.gain.linearRampToValueAtTime(0.0001, at + beat * 3);
    var np = new Player(song, at); np.out.gain.setValueAtTime(0.0001, now); np.out.gain.setValueAtTime(0.3, at); np.out.gain.linearRampToValueAtTime(1, at + beat * 2);
    tone(np.out, 'sine', 120, at, 0.15, 0.3, { slide: 40 }); noise(np.out, at, 0.5, 0.06, 'highpass', 5000);
    players.push(np);
  }
  function stopGameMusic(fade) {
    if (!ctx) return; var now = ctx.currentTime;
    players.forEach(function (p) { p.stopAt = Math.min(p.stopAt, now + fade); p.out.gain.cancelScheduledValues(now); p.out.gain.setTargetAtTime(0.0001, now, fade / 4); });
  }

  /* ---------- page BGM (the wav), routed through the same master ---------- */
  function page(play) {
    if (!pageEl) {
      pageEl = new Audio('music/feline-neon-loop-v3.wav'); pageEl.loop = true; pageEl.preload = 'auto';
      try { pageSrc = ctx.createMediaElementSource(pageEl); pageSrc.connect(pageGain); } catch (e) { pageSrc = null; }
    }
    var now = ctx.currentTime;
    pageGain.gain.cancelScheduledValues(now);
    if (play && on) {
      if (pageEl.paused) pageEl.play().catch(function () { });
      pageGain.gain.setTargetAtTime(pageSrc ? 0.35 : 0, now, 0.3);
      if (!pageSrc) pageEl.volume = 0.12 * stageLevel;
    } else {
      pageGain.gain.setTargetAtTime(0.0001, now, 0.15);
      clearTimeout(pageTimer); pageTimer = setTimeout(function () { if (pageEl && (!on || gameState === 'play' || gameState === 'paused')) pageEl.pause(); }, 700);
    }
  }
  function apply() {
    if (!ctx) return;
    var now = ctx.currentTime;
    master.gain.cancelScheduledValues(now); master.gain.setTargetAtTime(on ? 1 : 0.0001, now, 0.05);
    if (!on) { if (pageEl) pageEl.pause(); stopGameMusic(0.1); return; }
    if (ctx.state === 'suspended') ctx.resume();
    if (gameState === 'play' || gameState === 'paused' || gameState === 'dying') { page(false); if (wantWorld >= 0) startWorld(wantWorld, true); musicBus.gain.setTargetAtTime(gameState === 'paused' ? 0.18 : 0.55, now, 0.1); }
    else { musicBus.gain.setTargetAtTime(0.55, now, 0.1); page(true); }
  }

  /* ---------- 小八: little musical voice, quantised to the current music grid and key (free-running when the music is off) ---------- */
  function grid() {
    var c = on && (gameState === 'play' || gameState === 'paused') ? cur() : null, now = ctx.currentTime;
    if (c) { var sx = 60 / c.s.bpm / 4, e = sx * 2, k = (c.step % 2) ? sx : 0; return { next: c.t + k > now + 0.01 ? c.t + k : c.t + k + e, e: e, root: c.s.root, sc: c.s.sc, bar: Math.floor(c.step / 16) % 8, song: c.s }; }
    var e2 = 60 / PAGE.bpm / 2, playing = on && pageEl && !pageEl.paused, pos = playing ? pageEl.currentTime : now, n = Math.ceil((pos + 0.02) / e2) * e2;
    return { next: playing ? now + (n - pos) : now + 0.01, e: e2, root: PAGE.root, sc: PAGE.scale, bar: Math.floor(pos / (e2 * 8)) % 8 };
  }
  var webIdx = 0, stepIdx = 0, danceIdx = 0, lastKind = {}, recent = [];
  /* rate limits (ms): per kind, plus at most 7 sounds in any second so it never gets noisy */
  var GAP = { step: 120, snore: 1600, pop: 400, dance: 230, web: 170, swing: 800, dig: 150, hop: 300, whee: 1400, bonk: 350, squeak: 220, babble: 700, chirp: 300, wave: 700, dizzy: 1500 };
  var MOTIFS = [[0, 2, 4, 7], [4, 2, 4, 5, 7], [7, 5, 4, 2, 0], [0, 4, 2, 5, 4, 7], [2, 4, 7, 9, 7]];
  function spider(kind, opt) {
    if (!spOn || !AC) return;
    if (!ctx) { if (!gestured) return; init(); }
    if (ctx.state === 'suspended') ctx.resume();
    var nowMs = performance.now();
    if (nowMs - (lastKind[kind] || 0) < (GAP[kind] || 200)) return;
    recent = recent.filter(function (t0) { return nowMs - t0 < 1000; }); if (recent.length >= 7 && kind !== 'whee' && kind !== 'squeak') return;
    lastKind[kind] = nowMs; recent.push(nowMs);
    var G = grid(), t = G.next, sc = G.sc, r = G.root, B = spiderBus, now = ctx.currentTime + 0.01;
    var penta = sc.length === 5 ? sc : [sc[0], sc[1], sc[2], sc[4], sc[5]];
    function pn(i, o) { return hz(stepNote(penta, r + (o === undefined ? 12 : o), i)); }
    if (kind === 'step') { /* tippy-taps: alternating high notes + a tiny click */
      var k = stepIdx++ % 4; tone(B, 'triangle', pn([4, 2, 3, 2][k], 24), t, 0.025, 0.028, { sus: 0.2, rel: 0.02 }); noise(B, t, 0.012, 0.025, 'highpass', 7000);
    } else if (kind === 'snore') { /* breathe in (rising hiss) … out (low sigh) */
      var f = noise(B, now, 0.9, 0.022, 'bandpass', 500, 3); f.frequency.setValueAtTime(350, now); f.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
      tone(B, 'sine', pn(0, 0), now + 1.0, 0.9, 0.05, { slide: pn(0, -12), a: 0.2, sus: 0.8, rel: 0.3 });
    } else if (kind === 'pop') { tone(B, 'sine', 380, now, 0.05, 0.06, { slide: 1700, slideT: 0.05, sus: 1, rel: 0.02 });
    } else if (kind === 'dance') { /* a little motif on the beat, a new one each time */
      var m = MOTIFS[danceIdx++ % MOTIFS.length]; m.forEach(function (st, i) { tone(B, 0.25, pn(st, 12), t + i * G.e * 0.5, G.e * 0.45, 0.04, { sus: 0.4, rel: 0.05 }); });
    } else if (kind === 'web') { /* plucked silk: rising pentatonic harp */
      var wi = webIdx++ % 10; tone(B, 0.125, pn(wi, 12), t, G.e * 0.9, 0.05, { sus: 0.25, rel: 0.35 }); tone(B, 'sine', pn(wi, 24), t, G.e * 0.4, 0.02, { sus: 0.1, rel: 0.2 });
    } else if (kind === 'swing') { /* whoosh + glide */
      var sf = noise(B, now, 0.5, 0.03, 'bandpass', 400, 2); sf.frequency.setValueAtTime(300, now); sf.frequency.exponentialRampToValueAtTime(1600, now + 0.25); sf.frequency.exponentialRampToValueAtTime(400, now + 0.5);
      tone(B, 'sine', pn(0, 12), now, 0.5, 0.035, { slide: pn(4, 12), slideT: 0.25, sus: 0.6 });
    } else if (kind === 'dig') { noise(B, now, 0.05, 0.06, 'lowpass', 700); noise(B, now + 0.08, 0.05, 0.05, 'lowpass', 500); tone(B, 'triangle', pn(0, -12), now, 0.05, 0.03, { sus: 0.3 });
    } else if (kind === 'hop') { /* boing */ var hb = pn(1, 12); tone(B, 'sine', hb, now, 0.18, 0.05, { slide: hb * 2.6, slideT: 0.07, sus: 0.7 });
    } else if (kind === 'whee') { /* flung by the pinwheel: "wheeee~" with wobble */
      tone(B, 0.25, pn(0, 12), now, 0.75, 0.05, { slide: pn(9, 12), slideT: 0.55, vib: 1, sus: 0.8, rel: 0.15 }); tone(B, 'sine', pn(0, 24), now + 0.05, 0.6, 0.02, { slide: pn(9, 24), slideT: 0.5 });
    } else if (kind === 'bonk') { tone(B, 'triangle', 170, now, 0.12, 0.08, { slide: 70, slideT: 0.12, sus: 1 }); noise(B, now, 0.06, 0.05, 'lowpass', 900);
    } else if (kind === 'squeak') { tone(B, 'sine', 1700, now, 0.06, 0.05, { slide: 2600, slideT: 0.04, sus: 0.6 }); tone(B, 'sine', 2300, now + 0.07, 0.06, 0.04, { slide: 1500, slideT: 0.06, sus: 0.6 });
    } else if (kind === 'babble') { /* spider talk: random syllables, length follows the text */
      var n = Math.max(2, Math.min(7, (opt && opt.n) || 4)), base = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) { var nt = pn(base + Math.floor(Math.random() * 4) - 1, 12); tone(B, 0.5, nt, now + i * 0.085, 0.06, 0.028, { slide: nt * (Math.random() < 0.5 ? 1.12 : 0.9), slideT: 0.06, sus: 0.5, rel: 0.03 }); }
    } else if (kind === 'chirp') { tone(B, 0.25, pn(2, 24), t, G.e * 0.5, 0.045); tone(B, 0.25, pn(4, 24), t + G.e * 0.5, G.e * 0.6, 0.045);
    } else if (kind === 'wave') { tone(B, 0.25, pn(4, 24), now, 0.09, 0.04); tone(B, 0.25, pn(7, 24), now + 0.11, 0.14, 0.04, { vib: 1 });
    } else if (kind === 'dizzy') { for (var d = 0; d < 4; d++) tone(B, 'sine', pn(6 - d, 12), now + d * 0.13, 0.12, 0.03, { vib: 1, slide: pn(5 - d, 12), sus: 0.6 }); }
  }
  function setSpider(v) { spOn = !!v; localStorage.setItem('spider-sound', spOn ? '1' : '0'); spListeners.forEach(function (f) { f(spOn); }); if (spOn && gestured) { init(); spider('chirp'); } }

  function setOn(v) {
    on = !!v; localStorage.setItem('sound-on', on ? '1' : '0');
    if (on) init(); apply(); listeners.forEach(function (f) { f(on); });
  }
  var SND = {
    get on() { return on; }, isOn: function () { return on; }, toggle: function () { setOn(!on); }, setOn: setOn, onChange: function (f) { listeners.push(f); f(on); },
    setWorlds: function (keys) { BIOME_KEYS = keys; }, songs: SONGS,
    duck: function () { if (!on || !duck) return; var t = ctx.currentTime; duck.gain.cancelScheduledValues(t); duck.gain.setTargetAtTime(0.7, t, 0.01); duck.gain.setTargetAtTime(1, t + 0.12, 0.08); },
    lowfx: function (v) { lowFx = !!v; players.forEach(function (p) { p.eg.gain.value = lowFx ? 0 : 0.22; }); },
    beep: function (f, d, type, vol, slide) { if (!on || !init()) return; var t = ctx.currentTime; tone(sfxBus, type === 'square' ? 0.5 : type || 0.5, f, t, d, (vol || 0.05) * 1.6, { slide: slide, sus: 1, rel: 0.02 }); },
    noise: function (d, vol, freq) { if (!on || !init()) return; noise(sfxBus, ctx.currentTime, d, vol || 0.1, 'lowpass', freq || 2000); },
    world: function (i, hard) { wantWorld = i; if (on && init() && (gameState === 'play' || gameState === 'dying')) startWorld(i, hard); },
    game: function (state) {
      var prev = gameState; gameState = state; if (!on || !init()) return;
      var now = ctx.currentTime;
      if (state === 'play') { page(false); musicBus.gain.setTargetAtTime(0.55, now, 0.1); if (prev !== 'paused' && prev !== 'play') startWorld(wantWorld < 0 ? 0 : wantWorld, true); else if (!cur()) startWorld(wantWorld, true); }
      else if (state === 'paused') musicBus.gain.setTargetAtTime(0.18, now, 0.1);
      else if (state === 'over') { stopGameMusic(1.5); setTimeout(function () { if (on && !document.hidden && (gameState === 'over' || gameState === 'title')) { musicBus.gain.setTargetAtTime(0.55, ctx.currentTime, 0.1); page(true); } }, 2200); }
      else if (state === 'title') { stopGameMusic(0.6); musicBus.gain.setTargetAtTime(0.55, now, 0.1); page(true); }
    },
    spider: spider, get spiderOn() { return spOn; }, setSpider: setSpider, toggleSpider: function () { setSpider(!spOn); }, onSpider: function (f) { spListeners.push(f); f(spOn); }
  };
  // The visible stage owns this transient mute/level. Keep the saved legacy
  // preference and Xiao Ba's independent sound switch untouched.
  SND.setStageAudio = function (active, level) {
    on = !!active; stageLevel = Math.max(0, Math.min(1, Number(level) || 0));
    if (on) init();
    if (ctx && stageGain) { stageGain.gain.cancelScheduledValues(ctx.currentTime); stageGain.gain.setValueAtTime(on ? stageLevel : 0, ctx.currentTime); }
    apply(); listeners.forEach(function (listener) { listener(on); });
    return on;
  };
  window.SND = SND;
  /* browsers need a gesture before audio: the first one anywhere unlocks it (小八 may talk even when the SOUND switch is off) */
  var gestured = false;
  function unlock() { gestured = true; if (on || spOn) init(); if (ctx && ctx.state === 'suspended') ctx.resume(); if (on) apply(); window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); }
  window.addEventListener('pointerdown', unlock, true); window.addEventListener('keydown', unlock, true);
}());

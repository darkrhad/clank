// Music and sound effects, made in the browser with the Web Audio API: no
// recordings for the effects. Music: src/ui/music/menu.ogg on the start menu
// and src/ui/music/game.ogg in a game (an .mp3 with the same name is used
// where the browser can't play .ogg, e.g. older Safari). Without a file, a
// synthesized dark dungeon ambience plays instead (drone, chord swells, cave
// wind, drips, distant drums, gong, a rare đàn bầu note).
// Browsers only allow sound after a click: unlock() is called on the first one.

type Sfx = 'card' | 'coin' | 'clank' | 'sword' | 'step' | 'hit' | 'dragon' | 'chime' | 'artifact' | 'turn' | 'escape' | 'down' | 'nope';

const KEY = 'audio';
let settings = { music: true, sfx: true };
try { settings = { ...settings, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { /* defaults */ }

let ctx: AudioContext | null = null;
let musicBus: GainNode, sfxBus: GainNode, reverb: ConvolverNode;
const listeners = new Set<() => void>();

export const getAudio = () => settings;
export function subscribeAudio(f: () => void) { listeners.add(f); return () => { listeners.delete(f); }; }

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  listeners.forEach((f) => f());
}

export function setMusic(on: boolean) {
  settings = { ...settings, music: on };
  save();
  if (on) { unlock(); startMusic(); } else stopMusic();
}

export function setSfx(on: boolean) {
  settings = { ...settings, sfx: on };
  save();
  if (on) unlock();
}

// A soft room reverb from a decaying noise burst
function makeReverb(c: AudioContext) {
  const len = c.sampleRate * 2.6;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const r = c.createConvolver();
  r.buffer = buf;
  return r;
}

export function unlock() {
  if (!ctx) {
    ctx = new AudioContext();
    const master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    reverb = makeReverb(ctx);
    const wet = ctx.createGain(); wet.gain.value = 0.35; reverb.connect(wet).connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.45; musicBus.connect(master); musicBus.connect(reverb);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master); sfxBus.connect(reverb);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  if (settings.music) startMusic();
}

// ---------- building blocks ----------

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(freq: number, t: number, opts: { type?: OscillatorType; peak?: number; attack?: number; decay?: number; glide?: number; dest?: AudioNode } = {}) {
  const c = ctx!;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (opts.glide) o.frequency.linearRampToValueAtTime(freq * opts.glide, t + (opts.decay ?? 0.5) * 0.6);
  env(g, t, opts.peak ?? 0.3, opts.attack ?? 0.005, opts.decay ?? 0.5);
  o.connect(g).connect(opts.dest ?? sfxBus);
  o.start(t); o.stop(t + (opts.attack ?? 0.005) + (opts.decay ?? 0.5) + 0.05);
}

function noise(t: number, dur: number, opts: { type?: BiquadFilterType; freq?: number; q?: number; peak?: number; dest?: AudioNode } = {}) {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = opts.type ?? 'bandpass'; f.frequency.value = opts.freq ?? 2000; f.Q.value = opts.q ?? 1;
  const g = c.createGain(); env(g, t, opts.peak ?? 0.3, 0.003, dur);
  src.connect(f).connect(g).connect(opts.dest ?? sfxBus);
  src.start(t); src.stop(t + dur + 0.05);
}

// A plucked zither string: a bright attack, a slow fade, an optional upward glide (đàn bầu)
function pluck(freq: number, t: number, peak = 0.22, glide = 1, dest: AudioNode = musicBus) {
  tone(freq, t, { type: 'triangle', peak, attack: 0.004, decay: 1.8, glide, dest });
  tone(freq * 2, t, { type: 'sine', peak: peak * 0.35, attack: 0.002, decay: 0.6, glide, dest });
  tone(freq * 3.01, t, { type: 'sine', peak: peak * 0.12, attack: 0.002, decay: 0.25, dest });
}

// A temple gong: low inharmonic partials with a long fade
function gong(t: number, base = 98, peak = 0.35, dest: AudioNode = sfxBus) {
  [1, 1.47, 2.09, 2.76, 3.9].forEach((m, i) => tone(base * m, t, { peak: peak / (i + 1.4), attack: 0.01, decay: 4.5 - i * 0.6, dest }));
}

// ---------- music ----------

export type MusicScene = 'menu' | 'game';
let scene: MusicScene = 'menu';

const TRACKS = import.meta.glob('./music/*.{ogg,mp3}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const canOgg = typeof Audio !== 'undefined' && new Audio().canPlayType('audio/ogg; codecs=vorbis') !== '';

function trackUrl(s: MusicScene): string | undefined {
  const ogg = TRACKS[`./music/${s}.ogg`], mp3 = TRACKS[`./music/${s}.mp3`];
  return canOgg ? ogg ?? mp3 : mp3;
}

// Start menu or game: switches the music track (crossfade) when it changes
export function setMusicScene(s: MusicScene) {
  if (s === scene) return;
  scene = s;
  if (settings.music && ctx) { stopMusic(); startMusic(); }
}

let track: { el: HTMLAudioElement; g: GainNode } | null = null;

function startTrack(url: string) {
  const c = ctx!;
  const el = new Audio(url);
  el.loop = true;
  el.crossOrigin = 'anonymous';
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(1, c.currentTime + 2);
  c.createMediaElementSource(el).connect(g).connect(musicBus);
  void el.play().catch(() => { /* not allowed yet: unlock() starts it again */ });
  track = { el, g };
}

function stopTrack() {
  if (!track || !ctx) return;
  const { el, g } = track;
  const t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  setTimeout(() => el.pause(), 1600);
  track = null;
}

// Dramatic dungeon ambience: a dark pad that swells through a slow minor chord
// cycle, a low drone, cave wind, water drips, distant drums and a deep gong,
// with now and then a lone đàn bầu note. Continuous layers are kept in `held`
// so stopMusic() can fade them out.

// D minor pentatonic (D F G A C) for the rare zither notes
const SCALE = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25];
// Dm, Bb, Gm, A: each chord lasts 8 beats
const CHORDS = [[73.42, 110.0, 174.61], [58.27, 87.31, 146.83], [49.0, 98.0, 116.54], [55.0, 82.41, 138.59]];
const BEAT = 60 / 60;
let musicTimer: number | null = null;
let nextBeat = 0, beat = 0, pos = 4;
let held: { stop: (t: number) => void }[] = [];

// A sustained layer that fades in, and fades out on stop
function hold(node: AudioScheduledSourceNode, g: GainNode, level: number, fadeIn: number) {
  const c = ctx!;
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(level, c.currentTime + fadeIn);
  node.start();
  held.push({
    stop: (t) => {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2);
      node.stop(t + 2.1);
    },
  });
}

function startMusic() {
  if (!ctx || musicTimer !== null || track || ctx.state !== 'running' && ctx.state !== 'suspended') return;
  const url = trackUrl(scene);
  if (url) { startTrack(url); return; }
  const c = ctx;
  nextBeat = c.currentTime + 0.3;
  beat = 0;

  // Low drone on D with a fifth, through a slowly breathing low-pass filter
  const droneFilter = c.createBiquadFilter(); droneFilter.type = 'lowpass'; droneFilter.frequency.value = 260; droneFilter.Q.value = 3;
  const lfo = c.createOscillator(); const lfoGain = c.createGain();
  lfo.frequency.value = 0.05; lfoGain.gain.value = 140; lfo.connect(lfoGain).connect(droneFilter.frequency);
  hold(lfo, c.createGain(), 1, 0.1);
  const droneOut = c.createGain(); droneFilter.connect(droneOut).connect(musicBus);
  for (const [f, type, detune] of [[36.71, 'sawtooth', 0], [36.71, 'sawtooth', 9], [55.0, 'sawtooth', -6], [73.42, 'sine', 0]] as const) {
    const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
    const g = c.createGain(); o.connect(g).connect(droneFilter);
    hold(o, g, type === 'sine' ? 0.08 : 0.05, 6);
  }

  // Cave wind: looping noise through a band-pass whose pitch drifts
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const wind = c.createBufferSource(); wind.buffer = buf; wind.loop = true;
  const windFilter = c.createBiquadFilter(); windFilter.type = 'bandpass'; windFilter.frequency.value = 420; windFilter.Q.value = 6;
  const windLfo = c.createOscillator(); const windLfoGain = c.createGain();
  windLfo.frequency.value = 0.03; windLfoGain.gain.value = 260; windLfo.connect(windLfoGain).connect(windFilter.frequency);
  hold(windLfo, c.createGain(), 1, 0.1);
  const windGain = c.createGain(); wind.connect(windFilter).connect(windGain).connect(musicBus);
  hold(wind, windGain, 0.05, 8);

  musicTimer = window.setInterval(scheduleMusic, 120);
}

function stopMusic() {
  stopTrack();
  if (musicTimer !== null) { clearInterval(musicTimer); musicTimer = null; }
  if (ctx) { const t = ctx.currentTime; held.forEach((h) => h.stop(t)); }
  held = [];
}

// A pad chord that swells in and out over `dur` seconds
function padChord(freqs: number[], t: number, dur: number) {
  const c = ctx!;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1;
  f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(900, t + dur * 0.5); f.frequency.linearRampToValueAtTime(300, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  f.connect(g).connect(musicBus);
  for (const fr of freqs) {
    for (const det of [-7, 7]) {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr * 2; o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + dur + 0.1);
    }
  }
}

// A distant drum: a low thump with a little skin noise
function drum(t: number, peak: number) {
  tone(58, t, { peak, attack: 0.005, decay: 0.9, glide: 0.6, dest: musicBus });
  noise(t, 0.12, { type: 'lowpass', freq: 500, peak: peak * 0.4, dest: musicBus });
}

// A water drip: a short high blip that drops in pitch
function drip(t: number) {
  const f = 900 + Math.random() * 900;
  tone(f, t, { peak: 0.035, attack: 0.002, decay: 0.12, glide: 0.55, dest: musicBus });
}

// Plans a little ahead: a chord every 8 beats, slow drums building to the
// chord change, drips at random, a gong every 32 beats, a rare zither note
function scheduleMusic() {
  if (!ctx) return;
  while (nextBeat < ctx.currentTime + 0.6) {
    const bar = beat % 8;
    if (bar === 0) padChord(CHORDS[Math.floor(beat / 8) % CHORDS.length], nextBeat, BEAT * 9);
    if (bar === 0) drum(nextBeat, 0.22);
    if (bar === 4 && Math.random() < 0.6) drum(nextBeat, 0.12);
    if (bar === 7 && Math.random() < 0.5) { drum(nextBeat, 0.1); drum(nextBeat + BEAT / 2, 0.14); }
    if (Math.random() < 0.22) drip(nextBeat + Math.random() * BEAT);
    if (beat % 32 === 16) gong(nextBeat, 49, 0.16, musicBus);
    if (Math.random() < 0.07) {
      pos = Math.max(0, Math.min(SCALE.length - 1, pos + [-2, -1, 1, 2][Math.floor(Math.random() * 4)]));
      pluck(SCALE[pos], nextBeat, 0.1, Math.random() < 0.4 ? 1.06 : 1);
    }
    nextBeat += BEAT;
    beat++;
  }
}

// ---------- effects ----------

const last: Partial<Record<Sfx, number>> = {};

export function play(name: Sfx, delay = 0) {
  if (!settings.sfx || !ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + delay;
  if ((last[name] ?? -1) > t - 0.09) return; // the same sound many times at once sounds like noise
  last[name] = t;
  switch (name) {
    case 'card': noise(t, 0.07, { type: 'highpass', freq: 3500, peak: 0.12 }); pluck(587.33, t, 0.06, 1, sfxBus); break;
    case 'coin': tone(1760, t, { peak: 0.12, decay: 0.25 }); tone(2637, t + 0.06, { peak: 0.1, decay: 0.3 }); break;
    case 'clank': [520, 760, 1130, 1590, 2210].forEach((f, i) => tone(f * (0.97 + Math.random() * 0.06), t + i * 0.012, { type: 'square', peak: 0.035, decay: 0.22 })); noise(t, 0.12, { freq: 3000, q: 3, peak: 0.12 }); break;
    case 'sword': noise(t, 0.18, { freq: 4500, q: 2, peak: 0.22 }); tone(1320, t, { type: 'triangle', peak: 0.08, decay: 0.35, glide: 0.92 }); break;
    case 'step': noise(t, 0.08, { type: 'lowpass', freq: 380, peak: 0.3 }); noise(t + 0.22, 0.08, { type: 'lowpass', freq: 340, peak: 0.25 }); break;
    case 'hit': noise(t, 0.2, { type: 'lowpass', freq: 600, peak: 0.35 }); tone(110, t, { peak: 0.2, decay: 0.3, glide: 0.7 }); break;
    case 'dragon': gong(t, 65.4, 0.45); noise(t, 1.6, { type: 'lowpass', freq: 160, q: 4, peak: 0.35 }); tone(55, t + 0.1, { type: 'sawtooth', peak: 0.06, attack: 0.3, decay: 1.4, glide: 0.8 }); break;
    case 'chime': [880, 1174.66, 1396.91].forEach((f, i) => tone(f, t + i * 0.09, { peak: 0.09, decay: 0.9 })); break;
    case 'artifact': [587.33, 698.46, 880, 1046.5, 1174.66].forEach((f, i) => pluck(f, t + i * 0.1, 0.12, 1, sfxBus)); tone(2349, t + 0.5, { peak: 0.06, decay: 1.5 }); break;
    case 'turn': tone(1174.66, t, { peak: 0.06, decay: 0.7 }); break;
    case 'escape': [293.66, 392, 440, 587.33, 783.99, 880].forEach((f, i) => pluck(f, t + i * 0.12, 0.13, 1, sfxBus)); gong(t + 0.75, 146.83, 0.18); break;
    case 'down': gong(t, 55, 0.4); [440, 392, 349.23, 293.66].forEach((f, i) => pluck(f, t + i * 0.18, 0.1, 0.97, sfxBus)); break;
    case 'nope': tone(196, t, { type: 'triangle', peak: 0.1, decay: 0.15 }); break;
  }
}

// Which sound goes with which game log message (see i18n en.ts)
export const LOG_SOUND: Partial<Record<string, Sfx>> = {
  acquires: 'card', buys: 'coin', defeats: 'sword', movesInto: 'step', teleports: 'chime', tunnelDamage: 'hit',
  dragonAttack: 'dragon', countdownSpace: 'dragon', takesArtifact: 'artifact', findsSecret: 'chime', takesToken: 'chime',
  fountainHeal: 'chime', healsCard: 'chime', escapes: 'escape', rescued: 'down', lostDepths: 'down', lostNoArtifact: 'down',
  countdownEnd: 'down', gameOver: 'down', turn: 'turn', uses: 'coin', usesSecret: 'chime', trashes: 'card', discardsDraws: 'card',
};

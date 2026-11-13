// Synth sound effects, a tiny generated music loop and text-to-speech.
// No audio files to download. Three volume channels: music, sfx, voice (0..1).
let ctx = null;
let sfxGain = null;
let musicGain = null;
const vol = { music: 0.5, sfx: 0.8, voice: 1 };

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain.connect(ctx.destination);
    musicGain.connect(ctx.destination);
    applyVolumes();
  }
  if (ctx.state === "suspended" && !document.hidden) ctx.resume();
  return ctx;
}

function applyVolumes() {
  if (!ctx) return;
  sfxGain.gain.value = vol.sfx;
  musicGain.gain.value = vol.music * 0.22;
}

export function setVolumes(v) {
  Object.assign(vol, v);
  applyVolumes();
  if (vol.voice === 0) stopSpeech();
}

// Browsers only allow audio after a user gesture: call this from a click.
export function unlockAudio() {
  try { ensure(); } catch (_) {}
}

export function beep(freqs, ms = 180, level = 0.18, type = "sine") {
  if (vol.sfx === 0) return;
  try {
    ensure();
    const t = ctx.currentTime;
    for (const f of freqs) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level / freqs.length, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.connect(g).connect(sfxGain);
      o.start(t);
      o.stop(t + ms / 1000);
    }
  } catch (_) {}
}

export const click = () => beep([700], 60, 0.08, "triangle");

// Rising arpeggio for the "well done" moment.
export function fanfare() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep([f], 260, 0.16, "triangle"), i * 120));
}

// ------------------------------------------------------------ music
// A gentle, looping pentatonic tune (marimba-like plucks + soft bass).
const MELODY = [
  72, null, 76, 79, 81, null, 79, 76, 74, null, 76, 72, 74, null, null, null,
  72, null, 76, 79, 81, null, 84, 81, 79, null, 76, 74, 72, null, null, null,
];
const BASS = [48, 55, 57, 55, 53, 55, 48, 55];
const STEP = 60 / 112 / 2; // eighth notes at 112 BPM
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let musicTimer = 0, nextTime = 0, step = 0;

function pluck(freq, t, len, level, type) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + len + 0.02);
}

function schedule() {
  if (!ctx || ctx.state !== "running") return;
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + 0.35) {
    if (vol.music > 0) {
      const m = MELODY[step % MELODY.length];
      if (m) pluck(midi(m), nextTime, 0.45, 0.5, "triangle");
      if (step % 4 === 0) pluck(midi(BASS[(step / 4) % BASS.length]), nextTime, 0.6, 0.45, "sine");
    }
    nextTime += STEP;
    step++;
  }
}

export function startMusic() {
  try {
    ensure();
    if (!musicTimer) musicTimer = setInterval(schedule, 120);
  } catch (_) {}
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = 0;
}

// Pause all audio while the tab is hidden (saves CPU on school PCs).
document.addEventListener("visibilitychange", () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
});

// ------------------------------------------------------------ speech
export function speak(text) {
  if (vol.voice === 0 || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 0.9;
    u.pitch = 1.1;
    u.volume = vol.voice;
    speechSynthesis.speak(u);
  } catch (_) {}
}

export function stopSpeech() {
  try {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  } catch (_) {}
}

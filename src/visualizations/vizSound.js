// Lightweight sound effects for visualization playback: a soft tick on each
// animation step, and a brighter two-note chime when playback finishes. These
// are synthesized directly with the Web Audio API (no sound asset files), kept
// separate from LevelPage's mp3-based complete/collect/wrong sounds since a
// visualization step fires far more often and needs a much shorter, subtler cue.

const MUTE_KEY = "step-into-code_vizSoundMuted";

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // localStorage unavailable (private mode, etc.) — mute preference just won't persist.
  }
}

function tone(audio, freq, startTime, duration, peak, type) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playTick() {
  if (isMuted()) return;
  try {
    const audio = getCtx();
    tone(audio, 720, audio.currentTime, 0.08, 0.06, "triangle");
  } catch {
    // Audio can fail before a user gesture unlocks the context; skip silently.
  }
}

export function playDone() {
  if (isMuted()) return;
  try {
    const audio = getCtx();
    const t = audio.currentTime;
    tone(audio, 660, t, 0.12, 0.09, "sine");
    tone(audio, 880, t + 0.1, 0.18, 0.09, "sine");
  } catch {
    // See playTick.
  }
}

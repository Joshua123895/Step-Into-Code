// Sound effects for visualization playback, loaded from real audio files (not
// synthesized) so real sound assets can be dropped in. Files live in /public,
// referenced by URL string rather than an ES import, so a file that doesn't
// exist yet just fails its fetch quietly instead of breaking the build.
//
// Expected files (add your own with these exact names):
//   public/sounds/viz-tick.mp3      short step sound, plays very often - keep it brief and quiet
//   public/sounds/viz-fail.mp3      plays once when a search/lookup ends without finding its target
//   public/sounds/viz-complete.mp3  plays once when playback finishes successfully
//
// Until a file is added, playing it is silently a no-op (no console errors).

const MUTE_KEY = "step-into-code_vizSoundMuted";

const SOUND_URLS = {
  tick: "/sounds/viz-tick.mp3",
  fail: "/sounds/viz-fail.mp3",
  complete: "/sounds/viz-complete.mp3",
};

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

const bufferCache = {};
function loadBuffer(name) {
  if (bufferCache[name]) return bufferCache[name];
  const audio = getCtx();
  bufferCache[name] = fetch(SOUND_URLS[name])
    .then((res) => {
      if (!res.ok) throw new Error("missing sound file");
      return res.arrayBuffer();
    })
    .then((data) => audio.decodeAudioData(data))
    .catch(() => null);
  return bufferCache[name];
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

async function play(name) {
  if (isMuted()) return;
  try {
    const audio = getCtx();
    const buffer = await loadBuffer(name);
    if (!buffer) return; // file not added yet, or failed to decode
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    source.start(0);
  } catch {
    // Audio can fail before a user gesture unlocks the context; skip silently.
  }
}

export function playTick() {
  play("tick");
}

export function playFail() {
  play("fail");
}

export function playComplete() {
  play("complete");
}

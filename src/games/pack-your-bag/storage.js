// Small localStorage helpers. Every read/write is guarded: private windows or
// locked-down school browsers may block storage, and the game must still work.
const KEY_SETTINGS = "pyb.settings.v1";
const KEY_STARS = "pyb.stars.v1";

export const DEFAULT_SETTINGS = { brightness: 1, music: 0.5, sfx: 0.8, voice: 1 };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch (_) {
    return { ...fallback };
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

export const loadSettings = () => read(KEY_SETTINGS, DEFAULT_SETTINGS);
export const saveSettings = (s) => write(KEY_SETTINGS, s);
export const loadStars = () => read(KEY_STARS, {});
export const saveStars = (s) => write(KEY_STARS, s);

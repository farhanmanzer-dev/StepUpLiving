import { beep } from "./audio.js";

// Restart a one-shot CSS animation class on an element (works for SVG too),
// then take the class off again so the element returns to its idle state.
export function poke(el, cls = "boop", ms = 900) {
  if (!el) return;
  el.classList.remove(cls);
  void el.getBoundingClientRect(); // force a reflow so the animation restarts
  el.classList.add(cls);
  clearTimeout(el.__pokeT);
  el.__pokeT = setTimeout(() => el.classList.remove(cls), ms);
}

// Little sounds for tapping things in the school-yard scene (2D and 3D).
export const sfx = {
  sun: () => beep([880, 1320], 260, 0.12, "sine"),
  cloud: () => {
    beep([300], 120, 0.14, "sine");
    setTimeout(() => beep([450], 160, 0.12, "sine"), 90);
  },
  tree: () => {
    beep([220, 330], 140, 0.1, "triangle");
    setTimeout(() => beep([180], 120, 0.12, "sine"), 520);
    setTimeout(() => beep([160], 120, 0.12, "sine"), 640);
  },
  flower: () => beep([1047, 1568], 200, 0.1, "triangle"),
  clock: () => {
    beep([784], 380, 0.14, "triangle");
    setTimeout(() => beep([622], 520, 0.14, "triangle"), 320);
  },
  bird: () => [1800, 2200, 1900, 2400].forEach((f, i) => setTimeout(() => beep([f], 70, 0.06, "sine"), i * 70)),
  door: () => {
    beep([520, 780], 160, 0.1, "triangle");
    setTimeout(() => beep([660, 990], 220, 0.1, "triangle"), 140);
  },
};

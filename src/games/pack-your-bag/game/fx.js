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

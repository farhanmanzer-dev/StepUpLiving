// The anime backpack as a living mascot for the menu screens.
// It bounces, sways, blinks, follows the pointer with its eyes and, when tapped,
// jumps with a happy ^ ^ face and "talks" by flapping its lid.
// 30 FPS cap, pauses when the tab is hidden; small transparent canvas.
import * as THREE from "three";
import { buildBackpack } from "./backpack.js";
import { blob } from "./kit.js";

const FRAME_MS = 1000 / 30;

export function createMascot(canvas, { onPoke } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(dpr, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 60);
  camera.position.set(0, 3.2, 12.5);
  camera.lookAt(0, 1.95, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c8d8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(-4, 8, 7);
  scene.add(sun);

  const bag = buildBackpack();
  const holder = new THREE.Group(); // bounce/sway happens here
  holder.add(bag.body);
  scene.add(holder);
  const shadow = blob(4.2);
  shadow.position.y = 0.01;
  scene.add(shadow);

  // ---------------------------------------------------------- input
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    look.tx = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
    look.ty = THREE.MathUtils.clamp(-(e.clientY - (r.top + r.height * 0.45)) / (window.innerHeight / 2), -1, 1);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  let pokeT = -1; // seconds since the last poke (-1 = idle)
  const onDown = () => {
    pokeT = 0;
    bag.face.setMood("happy");
    onPoke && onPoke();
  };
  canvas.addEventListener("pointerdown", onDown);

  // ---------------------------------------------------------- animation
  let raf = 0, last = 0, t = 0, nextBlink = 2, blinkT = -1;
  function frame(now) {
    raf = 0;
    if (document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 2) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;

    // idle: a happy little bounce with squash & stretch, and a gentle sway
    const speed = reduce ? 0 : 1;
    const hop = Math.abs(Math.sin(t * 2.6 * speed));
    let y = hop * 0.28 * speed;
    let squash = 1 - (1 - hop) * 0.06 * speed;
    holder.rotation.y = Math.sin(t * 0.9) * 0.32 * speed;
    holder.rotation.z = Math.sin(t * 1.3) * 0.03 * speed;

    // poke: big jump + flap "talking"
    if (pokeT >= 0) {
      pokeT += dt;
      const k = Math.min(1, pokeT / 1.2);
      y += Math.sin(Math.PI * Math.min(1, pokeT / 0.55)) * 1.1;
      bag.hinge.rotation.x = -Math.abs(Math.sin(pokeT * 9)) * 0.45 * (1 - k);
      if (k >= 1) {
        pokeT = -1;
        bag.hinge.rotation.x = 0;
        bag.face.setMood("smile");
      }
    }
    holder.position.y = y;
    holder.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    shadow.scale.setScalar(1 - y * 0.25);

    // eyes follow the pointer
    look.x += (look.tx - look.x) * 0.15;
    look.y += (look.ty - look.y) * 0.15;
    bag.face.look(look.x, look.y);

    // blink every few seconds
    if (t > nextBlink && blinkT < 0) blinkT = 0;
    if (blinkT >= 0) {
      blinkT += dt;
      bag.face.setBlink(Math.sin(Math.PI * Math.min(1, blinkT / 0.16)));
      if (blinkT >= 0.16) { blinkT = -1; bag.face.setBlink(0); nextBlink = t + 2.2 + Math.random() * 2.5; }
    }
    renderer.render(scene, camera);
  }
  const start = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
  const onVis = () => { last = 0; start(); };
  document.addEventListener("visibilitychange", onVis);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  start();

  return {
    poke: onDown,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

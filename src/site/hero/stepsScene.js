// Hero 3D scene: a friendly character climbs a staircase of everyday skills
// (school bag -> meal -> laundry -> first aid -> cooking -> home).
// The "step up" idea of the brand, in 3D.
//
// Light on purpose (it runs on school PCs): low-poly primitives, 2 lights,
// no shadow maps, 30 FPS cap, and it pauses when off-screen or the tab is hidden.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";

const FRAME_MS = 1000 / 30;
const STEP_COLORS = [0xff8a65, 0xffc93c, 0x7ed6a5, 0x5ec8e5, 0x9b8cf2, 0xff7eb6];
const STEP_W = 1.9;
const STEP_RISE = 0.75;
const stepX = (i) => -4.75 + i * STEP_W;
const stepTop = (i) => 0.7 + i * STEP_RISE;

const matCache = new Map();
const mat = (c) => {
  if (!matCache.has(c)) matCache.set(c, new THREE.MeshLambertMaterial({ color: c }));
  return matCache.get(c);
};
function mesh(geo, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, typeof color === "number" ? mat(color) : color);
  m.position.set(x, y, z);
  return m;
}
const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 2, r);
const cyl = (a, b, h, s = 16) => new THREE.CylinderGeometry(a, b, h, s);
const sph = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);

// ---------------------------------------------------------------- props
const PROPS = [
  function backpack() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.72, 0.82, 0.46, 0.16), 0xd8414f, 0, 0.41, 0));
    g.add(mesh(rbox(0.54, 0.36, 0.14, 0.08), 0x9c2638, 0, 0.3, 0.24));
    g.add(mesh(rbox(0.12, 0.12, 0.05, 0.03), 0xffd23f, 0, 0.62, 0.24));
    const h = mesh(new THREE.TorusGeometry(0.15, 0.04, 6, 12, Math.PI), 0x9c2638, 0, 0.82, 0);
    g.add(h);
    return g;
  },
  function meal() {
    const g = new THREE.Group();
    g.add(mesh(cyl(0.5, 0.42, 0.06, 20), 0xffffff, 0, 0.03, 0));
    g.add(mesh(sph(0.16, 10, 8), 0xff6f61, -0.12, 0.12, 0.05));
    g.add(mesh(sph(0.13, 10, 8), 0x7ed957, 0.15, 0.1, -0.05));
    g.add(mesh(cyl(0.15, 0.12, 0.36, 14), 0x4a90d9, 0.48, 0.18, -0.3));
    return g;
  },
  function laundry() {
    const g = new THREE.Group();
    g.add(mesh(cyl(0.46, 0.38, 0.42, 16), 0xd9a35f, 0, 0.21, 0));
    g.add(mesh(cyl(0.4, 0.4, 0.06, 16), 0x8a5a36, 0, 0.42, 0));
    g.add(mesh(rbox(0.42, 0.12, 0.3, 0.05), 0x5ec8e5, -0.05, 0.5, 0));
    g.add(mesh(rbox(0.38, 0.1, 0.28, 0.05), 0xff7eb6, 0.05, 0.6, 0.02));
    return g;
  },
  function firstAid() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.8, 0.52, 0.5, 0.08), 0xffffff, 0, 0.26, 0));
    g.add(mesh(rbox(0.12, 0.34, 0.04, 0.02), 0xe2475a, 0, 0.28, 0.26));
    g.add(mesh(rbox(0.34, 0.12, 0.04, 0.02), 0xe2475a, 0, 0.28, 0.26));
    g.add(mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 12, Math.PI), 0x9aa3b5, 0, 0.52, 0));
    return g;
  },
  function cooking() {
    const g = new THREE.Group();
    g.add(mesh(cyl(0.38, 0.33, 0.38, 18), 0x8f9bb3, 0, 0.19, 0));
    g.add(mesh(cyl(0.4, 0.4, 0.05, 18), 0x6b7690, 0, 0.4, 0));
    g.add(mesh(sph(0.06, 8, 6), 0x2b3550, 0, 0.45, 0));
    for (const x of [-0.45, 0.45]) g.add(mesh(rbox(0.14, 0.06, 0.1, 0.02), 0x2b3550, x, 0.3, 0));
    const carrot = mesh(new THREE.ConeGeometry(0.07, 0.4, 8), 0xff8a3d, 0.5, 0.06, 0.3);
    carrot.rotation.z = Math.PI / 2;
    g.add(carrot);
    return g;
  },
  function home() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.0, 0.75, 0.8, 0.05), 0xfff1c9, 0, 0.375, 0));
    const roof = mesh(new THREE.ConeGeometry(0.85, 0.6, 4), 0xe2475a, 0, 1.05, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 0.8);
    g.add(roof);
    g.add(mesh(rbox(0.26, 0.42, 0.05, 0.03), 0x8a5a36, 0, 0.21, 0.41));
    g.add(mesh(rbox(0.22, 0.2, 0.04, 0.02), 0x8fd3f4, 0.32, 0.45, 0.41));
    g.add(mesh(rbox(0.22, 0.2, 0.04, 0.02), 0x8fd3f4, -0.32, 0.45, 0.41));
    return g;
  },
];

function buildCharacter() {
  const g = new THREE.Group();
  const body = new THREE.Group(); // squash & stretch happens here
  g.add(body);
  body.add(mesh(new THREE.CapsuleGeometry(0.3, 0.42, 4, 12), 0x3f7fd9, 0, 0.52, 0));
  body.add(mesh(sph(0.34), 0xffcfa3, 0, 1.18, 0));
  const hair = mesh(sph(0.35, 16, 8), 0x3a2a20, 0, 1.26, -0.04);
  hair.scale.set(1, 0.7, 1);
  body.add(hair);
  for (const x of [-0.12, 0.12]) {
    body.add(mesh(sph(0.05, 8, 6), 0x1f2433, x, 1.2, 0.3));
    const cheek = mesh(sph(0.06, 8, 6), 0xff9d9d, x * 1.8, 1.09, 0.26);
    cheek.scale.z = 0.4;
    body.add(cheek);
  }
  const smile = mesh(new THREE.TorusGeometry(0.09, 0.022, 6, 12, Math.PI), 0x1f2433, 0, 1.08, 0.31);
  smile.rotation.z = Math.PI;
  body.add(smile);
  body.add(mesh(rbox(0.42, 0.44, 0.2, 0.08), 0xffc93c, 0, 0.62, -0.3)); // little backpack
  for (const x of [-0.13, 0.13]) body.add(mesh(rbox(0.16, 0.12, 0.26, 0.05), 0x2b3550, x, 0.06, 0.04));
  g.rotation.y = 0.55; // face a little toward the climb
  return { group: g, body };
}

function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  grd.addColorStop(0, "rgba(30,40,80,0.28)");
  grd.addColorStop(1, "rgba(30,40,80,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createStepsScene(canvas, { reducedMotion = false } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: dpr < 1.5, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(dpr, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 100);
  const LOOK = new THREE.Vector3(0.2, 2.6, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b8a8, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(-5, 10, 8);
  scene.add(sun);

  const root = new THREE.Group(); // tilted gently by the mouse
  scene.add(root);

  // soft ground shadow
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 6),
    new THREE.MeshBasicMaterial({ map: softShadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  // staircase + props
  const props = [];
  STEP_COLORS.forEach((color, i) => {
    const h = stepTop(i);
    root.add(mesh(rbox(STEP_W - 0.08, h, 2.2, 0.14), color, stepX(i), h / 2, 0));
    // light "tread" strip on the front edge
    root.add(mesh(rbox(STEP_W - 0.2, 0.08, 0.12, 0.04), 0xffffff, stepX(i), h - 0.06, 1.06));
    const p = PROPS[i]();
    p.position.set(stepX(i) + 0.35, h, -0.25);
    root.add(p);
    props.push(p);
  });

  // gold star floating above the home
  const star = mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x8a6a00 }),
    stepX(5) + 0.35, stepTop(5) + 1.75, -0.25);
  star.scale.set(1, 1.3, 0.5);
  root.add(star);

  // floating confetti shapes
  const confetti = [];
  const shapes = [new THREE.OctahedronGeometry(0.16), new THREE.TorusGeometry(0.14, 0.05, 6, 14), new THREE.IcosahedronGeometry(0.14)];
  const confettiCols = [0xff8a65, 0xffc93c, 0x7ed6a5, 0x5ec8e5, 0x9b8cf2, 0xff7eb6];
  for (let i = 0; i < 12; i++) {
    const m = mesh(shapes[i % 3], confettiCols[i % 6], -6.5 + Math.random() * 13, 1 + Math.random() * 6.5, -2.5 - Math.random() * 2);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    root.add(m);
    confetti.push(m);
  }

  const hero = buildCharacter();
  root.add(hero.group);
  const START = new THREE.Vector3(stepX(0) - 1.7, 0, 0.3);

  // ---------------------------------------------------------- animation (GSAP)
  const tweens = [];
  let climb = null;
  if (reducedMotion) {
    hero.group.position.set(stepX(2) - 0.5, stepTop(2), 0.3);
  } else {
    hero.group.position.copy(START);
    climb = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.6 });
    for (let i = 0; i < STEP_COLORS.length; i++) {
      const x = stepX(i) - 0.5, y = stepTop(i);
      const peak = y + 0.9;
      climb
        .to(hero.body.scale, { x: 1.12, y: 0.82, z: 1.12, duration: 0.12, ease: "power1.out" })
        .to(hero.body.scale, { x: 0.92, y: 1.12, z: 0.92, duration: 0.12 })
        .to(hero.group.position, { x, duration: 0.5, ease: "power1.inOut" }, "<")
        .to(hero.group.position, { y: peak, duration: 0.25, ease: "power2.out" }, "<")
        .to(hero.group.position, { y, duration: 0.25, ease: "power2.in" }, ">")
        .to(hero.body.scale, { x: 1.15, y: 0.8, z: 1.15, duration: 0.08 })
        .to(hero.body.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: "back.out(3)" })
        .to(props[i].scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.out" }, "<")
        .to({}, { duration: 0.35 });
    }
    // celebrate at home, then start again
    climb
      .to(hero.group.rotation, { y: 0.55 + Math.PI * 2, duration: 0.7, ease: "power2.inOut" })
      .to(star.scale, { x: 1.6, y: 2.1, z: 0.8, duration: 0.25, yoyo: true, repeat: 1 }, "<")
      .to(hero.group.position, { y: stepTop(5) + 0.6, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, "<")
      .to({}, { duration: 0.8 })
      .to(hero.group.scale, { x: 0, y: 0, z: 0, duration: 0.3, ease: "back.in(2)" })
      .set(hero.group.position, { x: START.x, y: START.y })
      .set(hero.group.rotation, { y: 0.55 })
      .to(hero.group.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: "back.out(2)" });

    tweens.push(gsap.to(star.rotation, { y: Math.PI * 2, duration: 4, repeat: -1, ease: "none" }));
    confetti.forEach((m, i) => {
      tweens.push(gsap.to(m.position, { y: `+=${0.4 + Math.random() * 0.5}`, duration: 2 + (i % 4) * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      tweens.push(gsap.to(m.rotation, { x: `+=${Math.PI * 2}`, duration: 8 + i, repeat: -1, ease: "none" }));
    });
  }

  // ---------------------------------------------------------- pointer parallax
  const target = { x: 0, y: 0 };
  const onPointer = (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });

  // ---------------------------------------------------------- render loop
  let raf = 0, last = 0, active = true;
  function frame(now) {
    raf = 0;
    if (!active || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 2) return;
    last = now;
    root.rotation.y += (target.x * 0.18 - root.rotation.y) * 0.06;
    root.rotation.x += (target.y * 0.05 - root.rotation.x) * 0.06;
    renderer.render(scene, camera);
  }
  const start = () => { if (!raf && active && !document.hidden) raf = requestAnimationFrame(frame); };

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole staircase in view at any aspect ratio
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const dist = Math.max(13, 7.6 / (Math.tan(halfFov) * camera.aspect), 5.2 / Math.tan(halfFov));
    camera.position.set(LOOK.x + dist * 0.12, LOOK.y + dist * 0.2, dist);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const onVis = () => {
    if (document.hidden) { climb?.pause(); tweens.forEach((t) => t.pause()); }
    else if (active) { climb?.resume(); tweens.forEach((t) => t.resume()); start(); }
  };
  document.addEventListener("visibilitychange", onVis);
  if (!reducedMotion) start();

  return {
    /** Pause everything while the hero is scrolled out of view. */
    setActive(on) {
      active = on;
      if (reducedMotion) return;
      if (on) { climb?.resume(); tweens.forEach((t) => t.resume()); start(); }
      else { climb?.pause(); tweens.forEach((t) => t.pause()); }
    },
    destroy() {
      cancelAnimationFrame(raf);
      climb?.kill();
      tweens.forEach((t) => t.kill());
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

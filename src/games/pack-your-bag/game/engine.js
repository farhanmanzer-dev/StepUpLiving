// Pack Your Bag 3D - game engine (plain Three.js, driven from React via callbacks).
//
// Performance choices (for low-end school PCs):
//  * Renders ONLY when something changes (no constant 60 FPS loop);
//    capped at 30 FPS while animating; stops entirely when the tab is hidden.
//  * Lambert materials, 2 lights, NO real-time shadow maps (soft "blob"
//    shadow textures instead), low-poly primitives, no post-processing.
//  * Pixel ratio capped; antialias only on standard-density screens.
//  * No model/texture downloads: everything is built from primitives.
//
// Level config: { id, mode: "identify" | "pack", set: "school" | "lunch", bag, intro }
//   identify: tap every item that belongs.   pack: drag every item that belongs into the bag.
//
// React owns all 2D UI. The engine reports what happens through callbacks:
//   onHud({ left, total, collected })     progress changed
//   onSay(text, ms)                       show a speech bubble
//   onLabel({ name, x, y } | null)        item under the pointer (screen px)
//   onHint({ from, to } | null)           show/hide the hint hand (to = null means "tap")
//   onFinish(result)                      round complete
import * as THREE from "three";
import { mesh, box, rbox, cyl, sph, blob, addOutlines } from "./kit.js";
import { BUILD, ITEM_SETS } from "./items.js";
import { buildBackpack, buildLunchBag, BACKPACK_SIZE, LUNCHBAG_SIZE } from "./backpack.js";
import { beep, fanfare, speak, stopSpeech } from "./audio.js";

// ------------------------------------------------------------ settings
const ITEMS_TO_FIND = 4;
const HINT_AFTER_MS = 7000;
const FRAME_MS = 1000 / 30;
// Star rating (1-3) from accuracy = correct picks / all picks.
const STAR_RULES = { three: 100, two: 60 };
const TABLE_Y = 3.0;
const LIFT_Y = 4.9;
const BAG_POS = new THREE.Vector3(5.4, 0, 0.4);
const CAM_BASE = new THREE.Vector3(0.0, 10.5, 12.5);
const CAM_TARGET = new THREE.Vector3(-0.6, 2.0, 0.2);

const BAGS = { school: BACKPACK_SIZE, lunch: LUNCHBAG_SIZE };
const FLAP_OPEN = -2.35; // lid tilted back far enough to hide its front panel

const ease = (k) => 1 - Math.pow(1 - k, 3);
const easeBack = (k) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
// lower-case the first word but keep acronyms like "TV"
const noun = (name) => name.replace(/^[A-Z][a-z]/, (s) => s.toLowerCase());
const article = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = (a, n) => shuffle(a.slice()).slice(0, n);

export function createGame(canvas, cb = {}, level) {
  const emit = (name, ...args) => cb[name] && cb[name](...args);
  const identify = level.mode === "identify";
  const itemSet = ITEM_SETS[level.set];
  const spec = BAGS[level.bag];
  const BAG_TOP = spec.h;
  const place = level.set === "school" ? "school" : "lunch";

  const cleanups = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };
  const every = (ms, fn) => {
    const id = setInterval(fn, ms);
    cleanups.push(() => clearInterval(id));
  };
  const timeouts = new Set();
  const later = (ms, fn) => {
    const id = setTimeout(() => { timeouts.delete(id); fn(); }, ms);
    timeouts.add(id);
  };

  // ---------------------------------------------------------- renderer
  const dpr = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: dpr < 1.5,
    powerPreference: "low-power",
    stencil: false,
  });
  renderer.setPixelRatio(Math.min(dpr, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfdf3e1);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb59a7a, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-4, 12, 8);
  scene.add(sun);

  // ---------------------------------------------------------- room
  function buildRoom() {
    scene.add(mesh(new THREE.PlaneGeometry(60, 40), 0xd9b98f, 0, 0, 0, -Math.PI / 2));
    scene.add(mesh(new THREE.CircleGeometry(4.2, 32), 0x9fc5a8, 5.2, 0.01, 0.6, -Math.PI / 2));
    scene.add(mesh(new THREE.CircleGeometry(3.2, 32), 0xb7d8bd, 5.2, 0.015, 0.6, -Math.PI / 2));
    scene.add(mesh(new THREE.PlaneGeometry(60, 20), 0xfff1d6, 0, 10, -6));
    scene.add(mesh(box(60, 0.5, 0.1), 0xc89f72, 0, 0.25, -5.95));
    // window with a little sun and cloud outside
    scene.add(mesh(box(4.4, 3.2, 0.12), 0x9b6b45, -3, 7.6, -5.92));
    scene.add(mesh(box(4.0, 2.8, 0.14), new THREE.MeshBasicMaterial({ color: 0xbfe3fb }), -3, 7.6, -5.9));
    scene.add(mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffd23f }), -1.9, 8.4, -5.82));
    const cloud = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const [x, y, r] of [[-4.0, 7.0, 0.32], [-3.6, 7.15, 0.42], [-3.15, 7.0, 0.3]])
      scene.add(mesh(new THREE.CircleGeometry(r, 16), cloud, x, y, -5.82));
    scene.add(mesh(box(0.12, 2.8, 0.18), 0x9b6b45, -3, 7.6, -5.86));
    scene.add(mesh(box(4.0, 0.12, 0.18), 0x9b6b45, -3, 7.6, -5.86));
    // wall clock
    scene.add(mesh(cyl(0.8, 0.8, 0.12, 24), 0xffffff, 3.5, 8, -5.9, Math.PI / 2));
    scene.add(mesh(new THREE.TorusGeometry(0.8, 0.07, 6, 28), 0x3b82c4, 3.5, 8, -5.83));
    scene.add(mesh(box(0.06, 0.6, 0.05), 0x333344, 3.5, 8.25, -5.8));
    scene.add(mesh(box(0.45, 0.06, 0.05), 0x333344, 3.7, 8, -5.8));
    // party bunting across the wall
    const flagGeo = new THREE.CircleGeometry(0.38, 3);
    const flagCols = [0xff6b6b, 0xffd23f, 0x5cc0ea, 0x7ddc6f, 0xc58cf0];
    for (let i = 0; i < 17; i++) {
      const x = -10 + i * 1.25;
      const y = 10.2 - 0.35 * Math.cos((x / 10) * Math.PI * 0.5);
      scene.add(mesh(flagGeo, flagCols[i % flagCols.length], x, y, -5.85, 0, 0, -Math.PI / 2));
    }
    // potted plant behind the bag
    scene.add(mesh(cyl(0.5, 0.38, 0.9, 14), 0xe0794a, 8.6, 0.45, -3.6));
    for (const [x, y, z, r] of [[8.6, 1.5, -3.6, 0.55], [8.25, 1.2, -3.4, 0.4], [8.95, 1.25, -3.45, 0.42], [8.6, 2.0, -3.7, 0.35]])
      scene.add(mesh(sph(r, 10, 8), 0x58b368, x, y, z));
    const ps = blob(2.2);
    ps.position.set(8.6, 0.02, -3.6);
    scene.add(ps);
    // table (with anime ink outlines)
    const table = new THREE.Group();
    table.add(mesh(rbox(9.6, 0.3, 5.0, 0.1), 0xb07a4f, -2.8, TABLE_Y - 0.15, 0));
    for (const [x, z] of [[-7.2, -2.1], [1.6, -2.1], [-7.2, 2.1], [1.6, 2.1]])
      table.add(mesh(rbox(0.35, TABLE_Y - 0.3, 0.35, 0.06), 0x8a5a36, x, (TABLE_Y - 0.3) / 2, z));
    scene.add(addOutlines(table, 0.04));
    const tShadow = blob(11);
    tShadow.scale.set(1, 0.6, 1);
    tShadow.position.set(-2.8, 0.02, 0.2);
    scene.add(tShadow);
  }

  // ---------------------------------------------------------- bag (anime model with a face)
  function buildBag() {
    const model = level.bag === "school" ? buildBackpack() : buildLunchBag();
    const group = new THREE.Group();
    group.position.copy(BAG_POS);
    const body = model.body; // everything that squashes/shakes
    group.add(body);
    model.hinge.rotation.x = FLAP_OPEN; // open, ready for items

    // glow ring shown while an item is held over the bag
    const ring = mesh(new THREE.TorusGeometry(spec.w * 0.58, 0.09, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffd23f }),
      0, BAG_TOP + 0.08, 0, Math.PI / 2);
    ring.scale.set(1, 0.62, 1);
    ring.visible = false;
    body.add(ring);
    const shadow = blob(spec.w + 2);
    shadow.position.y = 0.02;
    group.add(shadow);
    scene.add(group);
    const b = { group, body, hinge: model.hinge, ring, face: model.face, packed: [] };
    setMouth(b, "smile");
    return b;
  }

  /** Face mood: smile | ooh | frown | happy */
  function setMouth(b, kind) {
    b.face.setMood(kind);
    invalidate();
  }
  // a short burst of ^ ^ joy, then back to a smile
  function cheer(b, ms = 900) {
    setMouth(b, "happy");
    later(ms, () => b === bag && b.face.mood === "happy" && !dragging && setMouth(b, "smile"));
  }

  const tmpV = new THREE.Vector3();
  function lookAt(world) {
    if (!bag) return;
    bag.face.group.getWorldPosition(tmpV);
    let dx = 0, dy = -0.3;
    if (world) { dx = world.x - tmpV.x; dy = world.y - tmpV.y; }
    const len = Math.hypot(dx, dy) || 1;
    const k = world ? Math.min(1, len / 2.5) : 0.4;
    bag.face.look((dx / len) * k, (dy / len) * k);
  }

  function blink() {
    if (!bag || document.hidden) return;
    const face = bag.face;
    tween(170, (k) => face.setBlink(Math.sin(Math.PI * k)), () => face.setBlink(0));
  }

  // ---------------------------------------------------------- hint ring, found marks, effects
  const hintRing = mesh(new THREE.TorusGeometry(0.95, 0.07, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0xffc928 }), 0, TABLE_Y + 0.04, 0, Math.PI / 2);
  hintRing.visible = false;
  scene.add(hintRing);

  const marks = new THREE.Group(); // green "found it" rings (identify mode)
  scene.add(marks);
  const markGeo = new THREE.TorusGeometry(0.9, 0.09, 8, 32);
  const markMat = new THREE.MeshBasicMaterial({ color: 0x4cc26a });

  const fx = new THREE.Group();
  scene.add(fx);
  const sparkGeo = new THREE.OctahedronGeometry(0.14);
  const SPARK_COLS = [0xffd23f, 0xff6fa8, 0x5cc0ea, 0x7ddc6f, 0xffffff];
  function sparkle(pos, count = 16) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: SPARK_COLS[i % 5], transparent: true }));
      m.position.copy(pos);
      const a = (i / count) * Math.PI * 2;
      const s = 1.4 + Math.random() * 1.2;
      parts.push({ m, vx: Math.cos(a) * s, vy: 2.2 + Math.random() * 2, vz: Math.sin(a) * s * 0.6 });
      fx.add(m);
    }
    tween(750, (k) => {
      for (const p of parts) {
        p.m.position.set(pos.x + p.vx * k, pos.y + p.vy * k - 3 * k * k, pos.z + p.vz * k);
        p.m.rotation.set(k * 5, k * 7, 0);
        p.m.material.opacity = 1 - k * k;
        p.m.scale.setScalar(1 - 0.5 * k);
      }
    }, () => clearFx(parts.map((p) => p.m)));
  }
  function clearFx(list = fx.children.slice()) {
    for (const m of list) { fx.remove(m); m.material.dispose(); }
  }

  // ---------------------------------------------------------- tweens + on-demand render loop
  const tweens = [];
  function tween(ms, step, done) {
    tweens.push({ ms, t: 0, step, done });
    invalidate();
  }
  let raf = 0, lastFrame = 0, lastTime = 0;
  function invalidate() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    if (now - lastFrame < FRAME_MS - 2) { raf = requestAnimationFrame(tick); return; }
    const dt = Math.min(100, now - (lastTime || now));
    lastTime = now;
    lastFrame = now;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t = Math.min(tw.ms, tw.t + dt);
      tw.step(tw.t / tw.ms);
      if (tw.t >= tw.ms) { tweens.splice(i, 1); tw.done && tw.done(); }
    }
    const hinting = updateHint(now);
    renderer.render(scene, camera);
    if (tweens.length || hinting) invalidate();
    else lastTime = 0;
  }

  // ---------------------------------------------------------- state
  let items = [], bag = null, dragging = null, hovered = null, collected = [];
  let distractors = identify ? 3 : 2, roundMistakes = 0, roundCorrect = 0, badStreak = 0;
  let finished = false;
  let lastAction = performance.now();

  // Timer counts only time the game is visible.
  let timeAccum = 0, timeStart = 0;
  const timer = {
    start() { timeAccum = 0; timeStart = performance.now(); },
    pause() { if (timeStart) { timeAccum += performance.now() - timeStart; timeStart = 0; } },
    resume() { if (!timeStart && !finished) timeStart = performance.now(); },
    ms() { return timeAccum + (timeStart ? performance.now() - timeStart : 0); },
  };
  on(document, "visibilitychange", () => {
    if (document.hidden) timer.pause();
    else { timer.resume(); lastTime = 0; invalidate(); }
  });

  function accuracy() {
    const tries = roundCorrect + roundMistakes;
    return tries ? Math.round((roundCorrect / tries) * 100) : null;
  }
  const remaining = () => items.filter((i) => i.belongs && !i.found);
  function updateHud() {
    emit("onHud", { left: remaining().length, total: ITEMS_TO_FIND, collected: collected.slice() });
  }
  function say(text, ms = 2400, voice = true) {
    emit("onSay", text, ms);
    if (voice) speak(text);
  }

  function newRound() {
    for (const it of items) scene.remove(it.group, it.shadow);
    if (bag) scene.remove(bag.group);
    tweens.length = 0;
    clearFx();
    marks.clear();
    for (const id of timeouts) clearTimeout(id);
    timeouts.clear();
    bag = buildBag();
    collected = [];
    const names = shuffle([
      ...sample(itemSet.yes, ITEMS_TO_FIND).map((n) => [n, true]),
      ...sample(itemSet.no, distractors).map((n) => [n, false]),
    ]);
    const nBack = Math.ceil(names.length / 2);
    items = names.map(([name, belongs], i) => {
      const back = i < nBack;
      const count = back ? nBack : names.length - nBack;
      const idx = back ? i : i - nBack;
      const step = 8.6 / count;
      const home = new THREE.Vector3(-7.1 + step * (idx + 0.5), TABLE_Y, back ? -1.25 : 1.3);
      const group = addOutlines(BUILD[name](), 0.025);
      group.position.copy(home);
      group.traverse((o) => (o.userData.root = group));
      const shadow = blob(1.9);
      shadow.position.set(home.x, TABLE_Y + 0.01, home.z);
      scene.add(group, shadow);
      const it = { name, belongs, group, shadow, home, busy: false, found: false, baseRotY: group.rotation.y };
      group.userData.item = it;
      return it;
    });
    dragging = hovered = hintItem = null;
    emit("onLabel", null);
    emit("onHint", null);
    finished = false;
    roundMistakes = roundCorrect = badStreak = 0;
    timer.start();
    updateHud();
    lastAction = performance.now();
    lookAt(null);
    // items pop onto the table one after another
    items.forEach((it, i) => {
      it.busy = true;
      it.group.scale.setScalar(0.001);
      later(120 + i * 90, () => tween(380, (k) => it.group.scale.setScalar(Math.max(0.001, easeBack(k))), () => {
        it.group.scale.setScalar(1);
        it.busy = false;
      }));
    });
    invalidate();
    later(300, () => say(level.intro, 3800));
  }

  // ---------------------------------------------------------- picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -LIFT_Y);
  const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TABLE_Y);
  const hit = new THREE.Vector3();
  const pickable = () => items.filter((i) => !i.busy && !i.found);

  function setRay(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  }
  function pickItem(e) {
    setRay(e);
    const list = pickable();
    const hits = ray.intersectObjects(list.map((i) => i.group), true);
    if (hits.length) return hits[0].object.userData.root.userData.item;
    // generous touch area: nearest item to the pointer on the table plane
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(tablePlane, p)) return null;
    let best = null, bd = 0.9;
    for (const it of list) {
      const d = Math.hypot(it.home.x - p.x, it.home.z - p.z);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }
  // Drop zone = the bag as the child SEES it: a generous box around the whole bag.
  const bagBox = new THREE.Box3(
    new THREE.Vector3(BAG_POS.x - spec.w / 2 - 0.6, 0, BAG_POS.z - 1.6),
    new THREE.Vector3(BAG_POS.x + spec.w / 2 + 0.6, BAG_TOP + 2.2, BAG_POS.z + 1.7));
  const ABOVE_BAG = new THREE.Vector3(BAG_POS.x, BAG_TOP + 1.0, BAG_POS.z);
  let pointerOverBag = false;
  const rayOverBag = () => ray.ray.intersectsBox(bagBox);

  function placeShadow(it) {
    const onTable = it.group.position.x < 2.0 && Math.abs(it.group.position.z) < 2.5;
    it.shadow.position.set(it.group.position.x, onTable ? TABLE_Y + 0.01 : 0.02, it.group.position.z);
  }
  function toScreen(v) {
    const p = v.clone().project(camera);
    return { x: ((p.x + 1) / 2) * canvas.clientWidth, y: ((1 - p.y) / 2) * canvas.clientHeight };
  }
  function emitLabel(it) {
    if (!it) return emit("onLabel", null);
    const top = it.group.position.clone();
    top.y += 1.9;
    emit("onLabel", { name: it.name, ...toScreen(top) });
  }

  function setHover(it) {
    if (hovered === it) return;
    if (hovered && !hovered.busy && !hovered.found && hovered !== dragging) hovered.group.position.y = TABLE_Y;
    hovered = it;
    if (it && !it.busy) it.group.position.y = TABLE_Y + 0.15;
    emitLabel(it);
    canvas.style.cursor = it ? (identify ? "pointer" : "grab") : "default";
    lookAt(it ? it.group.position : null);
    invalidate();
  }

  on(canvas, "pointerdown", (e) => {
    lastAction = performance.now();
    if (finished) return;
    const it = pickItem(e);
    if (!it) return;
    if (identify) {
      setHover(null);
      speak(it.name);
      tapItem(it);
      return;
    }
    canvas.setPointerCapture(e.pointerId);
    dragging = it;
    setHover(it);
    canvas.style.cursor = "grabbing";
    beep([520, 780], 90, 0.08, "triangle");
    setRay(e);
    if (ray.ray.intersectPlane(liftPlane, hit)) moveDragged(hit);
    speak(it.name);
  });
  on(canvas, "pointermove", (e) => {
    lastAction = performance.now();
    if (dragging) {
      setRay(e);
      if (ray.ray.intersectPlane(liftPlane, hit)) moveDragged(hit);
    } else if (!finished && e.pointerType === "mouse") {
      setHover(pickItem(e));
    }
  });
  on(canvas, "pointerleave", () => { if (!dragging) setHover(null); });

  function moveDragged(p) {
    const g = dragging.group;
    const wasOver = pointerOverBag;
    pointerOverBag = rayOverBag();
    if (pointerOverBag) g.position.copy(ABOVE_BAG); // hop over the opening: "let go now"
    else g.position.set(THREE.MathUtils.clamp(p.x, -8, 8), LIFT_Y, THREE.MathUtils.clamp(p.z, -3.5, 3.5));
    g.rotation.y = dragging.baseRotY + Math.sin(performance.now() / 300) * 0.1;
    placeShadow(dragging);
    bag.ring.visible = pointerOverBag;
    if (pointerOverBag !== wasOver) {
      setMouth(bag, pointerOverBag ? "ooh" : "smile");
      if (pointerOverBag) beep([880], 60, 0.05);
    }
    lookAt(g.position);
    emitLabel(dragging);
    invalidate();
  }
  function endDrag(e) {
    if (!dragging) return;
    const it = dragging;
    dragging = null;
    if (e && e.clientX !== undefined) { setRay(e); pointerOverBag = rayOverBag(); }
    bag.ring.visible = false;
    canvas.style.cursor = "default";
    if (pointerOverBag) dropInBag(it);
    else { setMouth(bag, "smile"); returnHome(it, false); }
    pointerOverBag = false;
    setHover(null);
  }
  on(canvas, "pointerup", endDrag);
  on(canvas, "pointercancel", () => { pointerOverBag = false; endDrag(); });

  // ---------------------------------------------------------- outcomes
  function returnHome(it, wiggle) {
    it.busy = true;
    const from = it.group.position.clone();
    tween(wiggle ? 750 : 450, (k) => {
      it.group.position.lerpVectors(from, it.home, ease(k));
      it.group.position.y += Math.sin(Math.PI * k) * 0.8;
      it.group.rotation.y = it.baseRotY + (wiggle ? Math.sin(k * 30) * 0.35 * (1 - k) : 0);
      placeShadow(it);
    }, () => {
      it.busy = false;
      it.group.position.copy(it.home);
      it.group.rotation.y = it.baseRotY;
      placeShadow(it);
    });
  }

  function shakeBag() {
    setMouth(bag, "frown");
    const b = bag;
    tween(600, (k) => { b.body.rotation.y = Math.sin(k * Math.PI * 6) * 0.22 * (1 - k); },
      () => { b.body.rotation.y = 0; later(500, () => b === bag && !dragging && setMouth(b, "smile")); });
  }

  function bounceBag(height = 0) {
    const b = bag;
    tween(height ? 520 : 320, (k) => {
      const s = 1 + Math.sin(Math.PI * k) * 0.06;
      b.body.scale.set(1 / s, s, 1 / s);
      b.body.position.y = Math.sin(Math.PI * k) * height;
    }, () => { b.body.scale.set(1, 1, 1); b.body.position.y = 0; });
  }

  function wrongPick(it) {
    roundMistakes++;
    badStreak++;
    beep([300, 220], 260, 0.12, "square");
    const n = noun(it.name);
    say(place === "school"
      ? `Oops! We don't take ${article(n)} ${n} to school. Try another!`
      : `Oops! ${article(n) === "an" ? "An" : "A"} ${n} is not for lunch. Try another!`, 2800);
    shakeBag();
    returnHome(it, true);
  }

  function rightPick(it) {
    badStreak = 0;
    roundCorrect++;
    collected.push(it.name);
    const left = remaining().length;
    beep([660, 880]);
    updateHud();
    if (!left) return finishRound();
    const msg = identify ? `Yes! The ${noun(it.name)} is for ${place}.` : `Yes! ${it.name} goes in the bag.`;
    say(`${msg} ${left} more to ${identify ? "find" : "pack"}.`, 2400);
  }

  // identify mode: tap
  function tapItem(it) {
    if (!it.belongs) return wrongPick(it);
    it.found = true;
    it.busy = true;
    const mark = mesh(markGeo, markMat, it.home.x, TABLE_Y + 0.05, it.home.z, Math.PI / 2);
    mark.scale.setScalar(0.01);
    marks.add(mark);
    tween(650, (k) => {
      it.group.position.y = TABLE_Y + Math.sin(Math.PI * k) * 1.3;
      it.group.rotation.y = it.baseRotY + ease(k) * Math.PI * 2;
      mark.scale.setScalar(Math.max(0.01, easeBack(k)));
    }, () => {
      it.group.position.y = TABLE_Y;
      it.group.rotation.y = it.baseRotY;
    });
    sparkle(it.home.clone().setY(TABLE_Y + 1), 12);
    cheer(bag);
    lookAt(it.home);
    bounceBag();
    rightPick(it);
  }

  // pack mode: drop
  function dropInBag(it) {
    if (!it.belongs) return wrongPick(it);
    it.found = true;
    it.busy = true;
    items.splice(items.indexOf(it), 1);
    scene.remove(it.shadow);
    const slot = bag.packed.length;
    bag.packed.push(it);
    // move into the bag's local space so it travels with the bag
    const world = it.group.position.clone();
    bag.body.add(it.group);
    it.group.position.copy(bag.body.worldToLocal(world));
    const from = it.group.position.clone();
    const sx = (spec.w - 1.2) / 3;
    const to = new THREE.Vector3(-(spec.w - 1.2) / 2 + (slot % 4) * sx, BAG_TOP - 0.25, -0.15 + (slot % 2) * 0.3);
    cheer(bag);
    tween(450, (k) => {
      const e = ease(k);
      it.group.position.lerpVectors(from, to, e);
      it.group.position.y += Math.sin(Math.PI * k) * 0.6;
      it.group.scale.setScalar(1 - 0.45 * e);
    }, () => {
      bounceBag();
      sparkle(new THREE.Vector3(BAG_POS.x, BAG_TOP + 0.4, BAG_POS.z));
    });
    rightPick(it);
  }

  function finishRound() {
    timer.pause();
    finished = true;
    emit("onHint", null);
    const acc = accuracy();
    const timeMs = timer.ms();
    const stars = acc >= STAR_RULES.three ? 3 : acc >= STAR_RULES.two ? 2 : 1;
    const result = {
      type: "game-result",
      game: "pack-your-bag",
      gameId: new URLSearchParams(location.search).get("gameId"),
      level: level.id,
      mode: level.mode,
      stars,
      accuracy: acc,
      timeSeconds: Math.round(timeMs / 1000),
      correct: roundCorrect,
      wrong: roundMistakes,
      distractors,
      finishedAt: new Date().toISOString(),
    };
    // Let a hosting portal record the result (if the game runs in an iframe).
    try { if (window.parent !== window) window.parent.postMessage(result, "*"); } catch (_) {}
    window.__lastResult = result;

    const b = bag;
    const celebrate = () => {
      setMouth(b, "happy");
      fanfare();
      bounceBag(0.8);
      sparkle(new THREE.Vector3(BAG_POS.x, BAG_TOP + 0.6, BAG_POS.z), 20);
      say(["", "Good try! You did it.", "Great job! Well done.", "Excellent! Perfect work!"][stars], 3200);
      later(800, () => emit("onFinish", { ...result, timeMs }));
    };
    if (identify) {
      // found items do a happy hop wave
      const found = items.filter((i) => i.found);
      later(500, () => found.forEach((it, i) => later(i * 120, () => tween(500, (k) => {
        it.group.position.y = TABLE_Y + Math.sin(Math.PI * k) * 0.9;
      }, () => { it.group.position.y = TABLE_Y; }))));
      later(500 + found.length * 120 + 300, celebrate);
    } else {
      const packed = b.packed.slice();
      later(500, () => tween(900, (k) => {
        const e = ease(k);
        b.hinge.rotation.x = FLAP_OPEN * (1 - e);
        for (const p of packed) p.group.position.y = BAG_TOP - 0.25 - e * 0.9;
      }, celebrate));
    }
    // adapt difficulty for the next round
    if (roundMistakes === 0 && distractors < 5) distractors++;
    else if (roundMistakes >= 3 && distractors > 1) distractors--;
  }

  // ---------------------------------------------------------- hint
  let hintItem = null;
  const hintWait = () => (badStreak >= 2 ? 1500 : HINT_AFTER_MS);
  function updateHint(now) {
    const want = !finished && !dragging && now - lastAction > hintWait();
    const target = want ? remaining().find((i) => !i.busy) || null : null;
    if (hintItem !== target) {
      if (hintItem && !hintItem.busy) hintItem.group.position.y = TABLE_Y;
      hintItem = target;
      emitHint();
    }
    hintRing.visible = !!hintItem;
    if (!hintItem) return false;
    const b = Math.abs(Math.sin(now / 260));
    hintItem.group.position.y = TABLE_Y + b * 0.35;
    hintRing.position.set(hintItem.home.x, TABLE_Y + 0.04, hintItem.home.z);
    hintRing.scale.setScalar(1 + b * 0.12);
    return true;
  }
  function emitHint() {
    if (!hintItem) return emit("onHint", null);
    const from = hintItem.home.clone();
    from.y += 0.4;
    emit("onHint", { from: toScreen(from), to: identify ? null : toScreen(ABOVE_BAG) });
  }
  // a cheap 1-per-second check wakes the renderer when a hint is due
  every(1000, () => {
    if (!finished && !dragging && performance.now() - lastAction > hintWait()) invalidate();
  });
  every(3800, () => { if (Math.random() < 0.8) blink(); });

  // ---------------------------------------------------------- resize
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // pull the camera back on narrow screens so table + bag always fit
    const f = Math.max(1, 1.55 / camera.aspect);
    camera.position.copy(CAM_TARGET).add(CAM_BASE.clone().sub(CAM_TARGET).multiplyScalar(f));
    camera.lookAt(CAM_TARGET);
    camera.updateProjectionMatrix();
    if (hintItem) emitHint();
    invalidate();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  cleanups.push(() => ro.disconnect());

  buildRoom();
  resize();
  newRound();

  // ---------------------------------------------------------- public API
  const api = {
    /** Play this level again (difficulty keeps adapting). */
    restart() { newRound(); },
    /** Show the hint right now (Help button). */
    help() {
      lastAction = -1e9;
      invalidate();
    },
    getTimeMs: () => timer.ms(),
    destroy() {
      cancelAnimationFrame(raf);
      for (const id of timeouts) clearTimeout(id);
      for (const fn of cleanups) fn();
      stopSpeech();
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      renderer.dispose();
      renderer.forceContextLoss(); // safe: React creates a fresh canvas per engine
    },
  };
  // handy for debugging/tests in the browser console
  window.__game = {
    get items() { return items; },
    get bag() { return bag; },
    camera, renderer, dropInBag, tapItem, BAG_POS,
  };
  return api;
}

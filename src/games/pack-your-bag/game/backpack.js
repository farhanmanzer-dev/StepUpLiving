// Anime-style bag models shared by the game and the menu mascot.
//  * Cel shading via MeshToonMaterial (from kit.js mat()).
//  * Ink outlines via the "inverted hull" trick (addOutlines in kit.js).
//  * A big-eyed anime face with moods: smile, ooh, frown, happy (^ ^).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mesh, rbox, sph, addOutlines } from "./kit.js";

// ---------------------------------------------------------------- face
const basicCache = new Map();
function basic(color, opacity = 1) {
  const key = `${color}-${opacity}`;
  if (!basicCache.has(key))
    basicCache.set(key, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }));
  return basicCache.get(key);
}
// a flattened sphere = a soft, slightly domed sticker
function dot(rx, ry, color, x, y, z, depth = 0.04, opacity = 1) {
  const m = new THREE.Mesh(sph(1, 20, 14), basic(color, opacity));
  m.scale.set(rx, ry, depth);
  m.position.set(x, y, z);
  return m;
}
const arc = (r, tube, angle) => new THREE.TorusGeometry(r, tube, 6, 18, angle);

export function buildFace() {
  const group = new THREE.Group();
  const eyes = [];
  const happyEyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.5, 0, 0);
    eye.add(dot(0.24, 0.3, 0xffffff, 0, 0, 0, 0.05));
    // iris + pupil move together to look around
    const iris = new THREE.Group();
    iris.position.z = 0.025;
    iris.add(dot(0.17, 0.23, 0x2a6fd6, 0, -0.01, 0, 0.03));
    iris.add(dot(0.13, 0.1, 0x68c4ff, 0, -0.1, 0.006, 0.03));
    iris.add(dot(0.085, 0.13, 0x14182b, 0, 0.01, 0.012, 0.03));
    eye.add(iris);
    // sparkly highlights stay put (they come from the "light")
    eye.add(dot(0.07, 0.075, 0xffffff, -0.06, 0.09, 0.075, 0.02));
    eye.add(dot(0.03, 0.03, 0xffffff, 0.07, -0.1, 0.075, 0.02));
    // thick upper lash line + little flick at the outer corner
    const lash = new THREE.Mesh(arc(0.26, 0.04, Math.PI * 0.82), basic(0x1b1f33));
    lash.rotation.z = Math.PI * 0.09;
    lash.scale.set(1, 1.18, 1);
    lash.position.z = 0.04;
    eye.add(lash);
    const flick = dot(0.09, 0.03, 0x1b1f33, side * 0.26, 0.17, 0.04, 0.02);
    flick.rotation.z = side * 0.6;
    eye.add(flick);
    group.add(eye);
    eyes.push({ eye, iris });

    // ^ ^ closed happy eye
    const happy = new THREE.Mesh(arc(0.16, 0.045, Math.PI), basic(0x1b1f33));
    happy.position.set(side * 0.5, -0.04, 0.04);
    happy.visible = false;
    group.add(happy);
    happyEyes.push(happy);
  }

  // cheeks: pink blush with little anime hatch lines
  for (const side of [-1, 1]) {
    group.add(dot(0.18, 0.1, 0xff8fb1, side * 0.78, -0.24, 0.0, 0.02, 0.75));
    for (let i = 0; i < 3; i++) {
      const line = dot(0.012, 0.055, 0xe0577f, side * 0.78 + (i - 1) * 0.07, -0.24, 0.02, 0.01);
      line.rotation.z = -0.5;
      group.add(line);
    }
  }

  const dark = 0x3a1220;
  const smile = new THREE.Mesh(arc(0.13, 0.035, Math.PI), basic(dark));
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.3, 0.02);
  const frown = new THREE.Mesh(arc(0.12, 0.035, Math.PI), basic(dark));
  frown.position.set(0, -0.44, 0.02);
  const ooh = dot(0.08, 0.1, dark, 0, -0.38, 0.02, 0.02);
  const big = new THREE.Group(); // wide-open happy mouth
  big.position.set(0, -0.31, 0.02);
  const open = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20, Math.PI, Math.PI), basic(0x7a1f2b));
  big.add(open);
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.08, 14, Math.PI, Math.PI), basic(0xff7a8a));
  tongue.position.set(0, -0.08, 0.005);
  tongue.scale.set(1.2, 0.8, 1);
  big.add(tongue);
  const mouths = { smile, frown, ooh, happy: big };
  for (const m of Object.values(mouths)) group.add(m);

  // anime sweat drop (shown when sad)
  const sweat = new THREE.Group();
  sweat.add(dot(0.08, 0.1, 0x9fdcff, 0, 0, 0, 0.04));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.16, 12), basic(0x9fdcff));
  tip.position.y = 0.1;
  sweat.add(tip);
  sweat.position.set(0.86, 0.3, 0.03);
  group.add(sweat);

  group.traverse((o) => (o.userData.noOutline = true));

  const face = {
    group,
    mood: "smile",
    setMood(mood) {
      face.mood = mood;
      const happy = mood === "happy";
      for (const { eye } of eyes) eye.visible = !happy;
      for (const h of happyEyes) h.visible = happy;
      for (const [k, m] of Object.entries(mouths)) m.visible = k === mood;
      sweat.visible = mood === "frown";
    },
    /** x, y in -1..1: where to look. */
    look(x, y) {
      for (const { iris } of eyes) {
        iris.position.x = x * 0.06;
        iris.position.y = y * 0.06;
      }
    },
    /** 0 = open, 1 = shut. */
    setBlink(k) {
      for (const { eye } of eyes) eye.scale.y = 1 - k * 0.92;
    },
  };
  face.setMood("smile");
  return face;
}

// ---------------------------------------------------------------- shapes
function extrude(shape, depth = 0.06) {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.04,
    bevelSegments: 2,
    curveSegments: 20,
  });
}

// ---------------------------------------------------------------- school backpack
// Blue backpack: light-blue body, navy flap with a curved edge, strap with a
// gold buckle, half-round front pocket with a gold button, side pockets.
export const BACKPACK_SIZE = { w: 3.0, h: 3.6, d: 1.8 };

export function buildBackpack({ outline = true } = {}) {
  const { w: W, h: H, d: D } = BACKPACK_SIZE;
  const LIGHT = 0x4cb8f5, LIGHT2 = 0x62c6fb, NAVY = 0x2e5077, STRAP = 0x5677a3, GOLD = 0xe8b130;
  const body = new THREE.Group();

  // very round corners give the soft, dome-topped "plushy" shape
  body.add(mesh(new RoundedBoxGeometry(W, H, D, 6, 0.88), LIGHT, 0, H / 2, 0));
  const opening = mesh(new THREE.CylinderGeometry(1, 1, 0.06, 28), 0x16203a, 0, H - 0.005, 0.05);
  opening.scale.set(0.75, 1, 0.3);
  opening.userData.noOutline = true;
  body.add(opening);

  // front pocket with a half-round navy flap and a gold button
  body.add(mesh(new RoundedBoxGeometry(2.1, 1.0, 0.5, 3, 0.22), LIGHT2, 0, 0.68, D / 2 + 0.1));
  const pf = new THREE.Shape();
  pf.moveTo(-1.02, 0);
  pf.lineTo(1.02, 0);
  pf.absellipse(0, 0, 1.02, 0.5, 0, Math.PI, true);
  body.add(mesh(extrude(pf, 0.05), NAVY, 0, 1.16, D / 2 + 0.33));
  const button = mesh(sph(0.085), GOLD, 0, 0.42, D / 2 + 0.36);
  button.scale.z = 0.5;
  body.add(button);

  // side pockets (light blue with a navy band) and back straps
  for (const s of [-1, 1]) {
    body.add(mesh(new RoundedBoxGeometry(0.4, 1.25, 1.15, 3, 0.16), LIGHT, s * (W / 2 + 0.08), 0.78, 0.05));
    body.add(mesh(rbox(0.42, 0.32, 1.17, 0.12), NAVY, s * (W / 2 + 0.09), 1.3, 0.05));
    body.add(mesh(rbox(0.4, H - 0.6, 0.18, 0.08), NAVY, s * 0.85, H / 2, -D / 2 - 0.05));
  }

  // face sits on the light-blue band between the flap and the pocket
  const face = buildFace();
  face.group.position.set(0, 1.7, D / 2);
  body.add(face.group);

  // flap, hinged along the back top edge (rotation.x < 0 opens it)
  const hinge = new THREE.Group();
  hinge.position.set(0, H - 0.05, -D / 2 + 0.1);
  const toLocal = (x, y, z) => [x, y - hinge.position.y, z - hinge.position.z];
  hinge.add(mesh(new RoundedBoxGeometry(W + 0.1, 1.2, D + 0.08, 6, 0.59), NAVY, ...toLocal(0, H - 0.54, 0)));
  const fp = new THREE.Shape();
  fp.moveTo(-1.45, 0);
  fp.lineTo(-1.45, -0.55);
  fp.quadraticCurveTo(-1.45, -1.0, 0, -1.0);
  fp.quadraticCurveTo(1.45, -1.0, 1.45, -0.55);
  fp.lineTo(1.45, 0);
  fp.lineTo(-1.45, 0);
  hinge.add(mesh(extrude(fp), NAVY, ...toLocal(0, 3.05, D / 2 + 0.04)));
  // strap over the top, down the front, with a gold buckle
  hinge.add(mesh(rbox(0.3, 0.08, 1.2, 0.04), STRAP, ...toLocal(0, H + 0.09, 0.3)));
  hinge.add(mesh(rbox(0.3, 1.3, 0.08, 0.06), STRAP, ...toLocal(0, 2.78, D / 2 + 0.16)));
  const tipM = mesh(sph(0.15, 14, 10), STRAP, ...toLocal(0, 2.13, D / 2 + 0.16));
  tipM.scale.set(1, 0.7, 0.3);
  hinge.add(tipM);
  const buckle = mesh(new THREE.TorusGeometry(0.21, 0.05, 6, 4), GOLD, ...toLocal(0, 2.48, D / 2 + 0.22));
  buckle.rotation.z = Math.PI / 4;
  buckle.scale.set(0.9, 1.15, 1);
  hinge.add(buckle);
  hinge.add(mesh(rbox(0.06, 0.3, 0.05, 0.02), GOLD, ...toLocal(0, 2.48, D / 2 + 0.24)));
  body.add(hinge);

  if (outline) addOutlines(body, 0.035);
  return { body, hinge, face, size: BACKPACK_SIZE };
}

// ---------------------------------------------------------------- lunch bag
export const LUNCHBAG_SIZE = { w: 2.9, h: 2.5, d: 1.8 };

function starGeo(r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return new THREE.ShapeGeometry(s);
}

export function buildLunchBag({ outline = true } = {}) {
  const { w, h, d } = LUNCHBAG_SIZE;
  const col = 0x9b6bd0, dark = 0x6e44a3, trim = 0xffd23f;
  const body = new THREE.Group();
  body.add(mesh(new RoundedBoxGeometry(w, h, d, 3, 0.42), col, 0, h / 2, 0));
  const opening = mesh(rbox(w - 0.6, 0.1, d - 0.55), 0x2e1420, 0, h - 0.02, 0);
  opening.userData.noOutline = true;
  body.add(opening);
  body.add(mesh(new THREE.TorusGeometry(0.42, 0.09, 8, 18, Math.PI), dark, 0, h + 0.05, -0.55));
  body.add(mesh(rbox(2.2, 0.62, 0.3, 0.12), 0xe7d8fb, 0, 0.5, 0.88));
  const star = new THREE.Mesh(starGeo(0.22), basic(trim));
  star.position.set(0.6, 0.5, 1.04);
  star.userData.noOutline = true;
  body.add(star);
  body.add(mesh(rbox(w - 0.3, 0.06, 0.06), trim, 0, h - 0.12, d / 2 + 0.01));
  for (const x of [-(w / 2 + 0.08), w / 2 + 0.08]) body.add(mesh(rbox(0.22, 1.0, 1.2, 0.08), dark, x, 0.7, 0));

  const face = buildFace();
  face.group.position.set(0, h - 0.78, d / 2);
  body.add(face.group);

  const hinge = new THREE.Group();
  hinge.position.set(0, h - 0.05, -d / 2 + 0.05);
  hinge.add(mesh(rbox(w - 0.1, 0.16, d + 0.15, 0.08), dark, 0, 0.08, d / 2 + 0.05));
  hinge.add(mesh(rbox(0.5, 0.4, 0.12, 0.05), trim, 0, -0.1, d + 0.15));
  body.add(hinge);

  if (outline) addOutlines(body, 0.035);
  return { body, hinge, face, size: LUNCHBAG_SIZE };
}

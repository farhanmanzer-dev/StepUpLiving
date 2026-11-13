// Toy-style bag models shared by the game and the menu mascot.
//  * Soft physically based shading (kit.js mat()).
//  * A big-eyed anime face with moods: smile, ooh, frown, happy (^ ^).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mesh, rbox, sph, addOutlines } from "./kit.js";

// ---------------------------------------------------------------- face
const basicCache = new Map();
function basic(color, opacity = 1) {
  const key = `${color}-${opacity}`;
  if (!basicCache.has(key))
    basicCache.set(key, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, toneMapped: false }));
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
// Soft toy-style hiking backpack: orange body, cream pockets with brown
// flaps and clasps, side pockets, and a green rolled mat strapped on the lid.
// The friendly face sits on the big front pocket.
export const BACKPACK_SIZE = { w: 3.0, h: 3.6, d: 1.8 };

// a pocket flap: straight top edge, rounded bottom corners
function flapShape(w, h, r = 0.4) {
  const s = new THREE.Shape();
  const x = w / 2;
  s.moveTo(-x, 0);
  s.lineTo(x, 0);
  s.lineTo(x, -h + r);
  s.quadraticCurveTo(x, -h, x - r, -h);
  s.lineTo(-x + r, -h);
  s.quadraticCurveTo(-x, -h, -x, -h + r);
  s.lineTo(-x, 0);
  return s;
}

export function buildBackpack({ outline = true } = {}) {
  const { w: W, h: H, d: D } = BACKPACK_SIZE;
  const ORANGE = 0xf28a2e, ORANGE2 = 0xf59a3f, CREAM = 0xf3e6c2, BROWN = 0x9a7468, BROWN2 = 0x86635a;
  const GREEN = 0xb9df6a, GREEN2 = 0xd3ec8f, METAL = 0x4b5058;
  const body = new THREE.Group();

  // plushy, dome-topped body
  body.add(mesh(new RoundedBoxGeometry(W, H, D, 8, 0.9), ORANGE, 0, H / 2, 0));
  const opening = mesh(new THREE.CylinderGeometry(1, 1, 0.06, 32), 0x3a2414, 0, H - 0.005, 0.05);
  opening.scale.set(0.75, 1, 0.3);
  body.add(opening);

  // big front pocket (cream) with a brown flap and a little button
  body.add(mesh(new RoundedBoxGeometry(2.45, 1.3, 0.62, 6, 0.3), CREAM, 0, 0.78, D / 2 + 0.06));
  body.add(mesh(extrude(flapShape(2.35, 0.5, 0.25), 0.05), BROWN, 0, 1.42, D / 2 + 0.36));
  const button = mesh(sph(0.09), CREAM, 0, 0.98, D / 2 + 0.44);
  button.scale.z = 0.55;
  body.add(button);

  // upper pocket with its own flap + clasp
  body.add(mesh(new RoundedBoxGeometry(1.9, 0.82, 0.42, 6, 0.2), CREAM, 0, 1.92, D / 2 - 0.02));
  body.add(mesh(extrude(flapShape(1.95, 0.48, 0.3), 0.05), BROWN, 0, 2.36, D / 2 + 0.16));
  body.add(mesh(rbox(0.22, 0.3, 0.07, 0.04), BROWN2, 0, 1.86, D / 2 + 0.24));
  body.add(mesh(rbox(0.16, 0.08, 0.06, 0.02), BROWN2, 0, 1.74, D / 2 + 0.28));

  // side pockets (cream with brown caps) and back straps
  for (const s of [-1, 1]) {
    body.add(mesh(new RoundedBoxGeometry(0.46, 1.3, 1.15, 4, 0.2), CREAM, s * (W / 2 + 0.08), 0.8, 0.05));
    body.add(mesh(rbox(0.5, 0.36, 1.2, 0.14), BROWN, s * (W / 2 + 0.1), 1.36, 0.05));
    body.add(mesh(rbox(0.4, H - 0.6, 0.18, 0.08), BROWN2, s * 0.85, H / 2, -D / 2 - 0.05));
  }

  // face on the front pocket, under the flap
  const face = buildFace();
  face.group.scale.setScalar(0.62);
  face.group.position.set(0, 0.6, D / 2 + 0.38);
  body.add(face.group);

  // lid, hinged along the back top edge (rotation.x < 0 opens it);
  // the rolled mat and its straps ride on the lid
  const hinge = new THREE.Group();
  hinge.position.set(0, H - 0.05, -D / 2 + 0.1);
  const toLocal = (x, y, z) => [x, y - hinge.position.y, z - hinge.position.z];
  hinge.add(mesh(new RoundedBoxGeometry(W + 0.08, 0.9, D + 0.06, 8, 0.44), ORANGE2, ...toLocal(0, H - 0.4, 0)));

  const roll = new THREE.Group();
  roll.position.set(...toLocal(0, H + 0.42, 0.05));
  roll.add(mesh(new THREE.CapsuleGeometry(0.46, 2.6, 8, 28), GREEN, 0, 0, 0, 0, 0, Math.PI / 2));
  // spiral hint on the ends
  for (const s of [-1, 1]) {
    const end = mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 24), GREEN2, s * 1.62, 0, 0, 0, Math.PI / 2);
    roll.add(end);
  }
  for (const x of [-0.75, 0.75]) {
    const strap = mesh(new THREE.TorusGeometry(0.5, 0.09, 10, 32), BROWN, x, 0, 0, 0, Math.PI / 2);
    strap.scale.set(1, 1, 2.2); // a wide, flat leather band
    roll.add(strap);
    roll.add(mesh(rbox(0.3, 0.95, 0.08, 0.035), BROWN, x, -0.5, 0.88));
    const buckle = mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 4), METAL, x, -0.58, 0.95);
    buckle.rotation.z = Math.PI / 4;
    buckle.scale.set(1.05, 0.85, 1);
    roll.add(buckle);
  }
  hinge.add(roll);
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

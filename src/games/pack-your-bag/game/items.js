// Item builders. Each returns a Group whose base sits at y = 0, about 1.2-1.8 wide.
import * as THREE from "three";
import { mesh, box, rbox, cyl, sph } from "./kit.js";

export const BUILD = {
  Book() {
    const g = new THREE.Group();
    g.add(mesh(box(1.1, 0.32, 1.45), 0x2f6fd0, 0, 0.16, 0));
    g.add(mesh(box(1.02, 0.24, 1.37), 0xfaf7ef, 0.06, 0.16, 0));
    g.add(mesh(box(0.16, 0.34, 1.47), 0x1f4f9e, -0.5, 0.16, 0));
    g.add(mesh(box(0.5, 0.02, 0.3), 0xffffff, 0.08, 0.33, -0.25));
    return g;
  },
  Notebook() {
    const g = new THREE.Group();
    g.add(mesh(box(1.05, 0.14, 1.35), 0xf07a2a, 0, 0.07, 0));
    const ring = new THREE.TorusGeometry(0.09, 0.025, 6, 12);
    for (let i = 0; i < 7; i++) g.add(mesh(ring, 0x444455, -0.52, 0.1, -0.54 + i * 0.18, 0, Math.PI / 2));
    for (let i = 0; i < 4; i++) g.add(mesh(box(0.7, 0.01, 0.05), 0xffd7b5, 0.08, 0.145, -0.35 + i * 0.22));
    return g;
  },
  Pencil() {
    const g = new THREE.Group();
    g.add(mesh(cyl(0.11, 0.11, 1.5, 6), 0xf5c518, 0, 0.11, 0, 0, 0, Math.PI / 2));
    g.add(mesh(new THREE.ConeGeometry(0.11, 0.32, 6), 0xf0d2a8, -0.91, 0.11, 0, 0, 0, Math.PI / 2));
    g.add(mesh(new THREE.ConeGeometry(0.04, 0.1, 6), 0x333333, -1.03, 0.11, 0, 0, 0, Math.PI / 2));
    g.add(mesh(cyl(0.115, 0.115, 0.12, 8), 0xc0c0c8, 0.8, 0.11, 0, 0, 0, Math.PI / 2));
    g.add(mesh(cyl(0.11, 0.11, 0.18, 8), 0xf08aa0, 0.95, 0.11, 0, 0, 0, Math.PI / 2));
    g.rotation.y = 0.6;
    return g;
  },
  "Lunch box"() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.35, 0.7, 0.95, 0.12), 0x3fae5a, 0, 0.35, 0));
    g.add(mesh(box(1.37, 0.06, 0.97), 0x2a8443, 0, 0.5, 0));
    g.add(mesh(new THREE.TorusGeometry(0.26, 0.05, 6, 16, Math.PI), 0x2a8443, 0, 0.7, 0));
    return g;
  },
  "Water bottle"() {
    const g = new THREE.Group();
    g.add(mesh(cyl(0.3, 0.3, 1.3, 18), 0x5cc0ea, 0, 0.65, 0));
    g.add(mesh(cyl(0.31, 0.31, 0.35, 18), 0xffffff, 0, 0.7, 0));
    g.add(mesh(cyl(0.2, 0.22, 0.28, 14), 0x1f4f9e, 0, 1.44, 0));
    return g;
  },
  "Pencil box"() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.55, 0.42, 0.65, 0.14), 0xc94a98, 0, 0.21, 0));
    g.add(mesh(box(1.4, 0.03, 0.67), 0x7a2a5e, 0, 0.3, 0));
    g.add(mesh(sph(0.07), 0xf5c518, 0.62, 0.3, 0.34));
    return g;
  },
  Ruler() {
    const g = new THREE.Group();
    g.add(mesh(box(1.9, 0.05, 0.38), 0xf6dd6e, 0, 0.025, 0));
    const tick = box(0.025, 0.012, 0.12);
    for (let i = 0; i < 13; i++)
      g.add(mesh(tick, 0x333344, -0.84 + i * 0.14, 0.055, -0.13 + (i % 2 ? 0.03 : 0)));
    g.rotation.y = -0.35;
    return g;
  },
  Ball() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.55, 20, 14), 0xe03c3c, 0, 0.55, 0));
    g.add(mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 24), 0xffffff, 0, 0.55, 0, Math.PI / 2));
    g.add(mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 24), 0xffffff, 0, 0.55, 0, 0, Math.PI / 2));
    return g;
  },
  "Teddy bear"() {
    const g = new THREE.Group(), c = 0xa8703f, l = 0xe7c39a;
    g.add(mesh(sph(0.45), c, 0, 0.45, 0));
    g.add(mesh(sph(0.22), l, 0, 0.45, 0.32));
    g.add(mesh(sph(0.36), c, 0, 1.07, 0));
    g.add(mesh(sph(0.14), c, -0.27, 1.36, 0));
    g.add(mesh(sph(0.14), c, 0.27, 1.36, 0));
    g.add(mesh(sph(0.14), l, 0, 1.0, 0.3));
    g.add(mesh(sph(0.045), 0x222222, 0, 1.05, 0.43));
    g.add(mesh(sph(0.045), 0x222222, -0.13, 1.16, 0.3));
    g.add(mesh(sph(0.045), 0x222222, 0.13, 1.16, 0.3));
    for (const x of [-0.45, 0.45]) g.add(mesh(sph(0.16), c, x, 0.55, 0.1));
    for (const x of [-0.25, 0.25]) g.add(mesh(sph(0.18), c, x, 0.14, 0.3));
    return g;
  },
  Pillow() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.7, 0.42, 1.05, 0.2), 0xe6dcf7, 0, 0.21, 0));
    g.add(mesh(box(1.2, 0.02, 0.04), 0xb9a5de, 0, 0.42, 0));
    return g;
  },
  "TV remote"() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.42, 0.16, 1.35, 0.06), 0x3e3e48, 0, 0.08, 0));
    g.add(mesh(cyl(0.07, 0.07, 0.04, 10), 0xe03c3c, 0, 0.17, -0.48));
    const b = cyl(0.05, 0.05, 0.04, 8);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 2; c++) g.add(mesh(b, 0xc8c8d0, -0.08 + c * 0.16, 0.17, -0.15 + r * 0.18));
    g.rotation.y = 0.4;
    return g;
  },
  "Toy car"() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.35, 0.36, 0.72, 0.08), 0xf5c518, 0, 0.4, 0));
    g.add(mesh(rbox(0.75, 0.32, 0.64, 0.08), 0xf5c518, -0.05, 0.72, 0));
    g.add(mesh(box(0.66, 0.2, 0.66), 0xbfe6ff, -0.05, 0.73, 0));
    const w = cyl(0.19, 0.19, 0.14, 14);
    for (const [x, z] of [[-0.42, 0.36], [0.42, 0.36], [-0.42, -0.36], [0.42, -0.36]])
      g.add(mesh(w, 0x2b2b33, x, 0.19, z, Math.PI / 2));
    g.rotation.y = -0.4;
    return g;
  },
  Slipper() {
    const g = new THREE.Group();
    const sole = mesh(cyl(0.45, 0.45, 0.14, 20), 0x5cc8c8, 0, 0.07, 0);
    sole.scale.set(1.7, 1, 0.85);
    g.add(sole);
    g.add(mesh(new THREE.TorusGeometry(0.3, 0.09, 6, 14, Math.PI), 0x2f8f9a, -0.2, 0.12, 0, 0, Math.PI / 2));
    g.rotation.y = 0.3;
    return g;
  },
};

// --- lunch items
Object.assign(BUILD, {
  Apple() {
    const g = new THREE.Group();
    const body = mesh(sph(0.48, 18, 14), 0xe23a3a, 0, 0.44, 0);
    body.scale.set(1, 0.9, 1);
    g.add(body);
    g.add(mesh(cyl(0.035, 0.035, 0.25, 6), 0x6b4423, 0, 0.92, 0, 0, 0, 0.2));
    const leaf = mesh(sph(0.14, 8, 6), 0x4caf50, 0.14, 0.95, 0);
    leaf.scale.set(1.4, 0.3, 0.7);
    g.add(leaf);
    g.add(mesh(sph(0.1, 8, 6), 0xff8a8a, -0.22, 0.6, 0.33));
    return g;
  },
  Banana() {
    const g = new THREE.Group();
    const arc = mesh(new THREE.TorusGeometry(0.6, 0.15, 8, 18, Math.PI * 0.75), 0xf7d33c, 0, 0.15, 0.25, -Math.PI / 2, 0, Math.PI * 0.12);
    arc.scale.set(1, 1, 0.9);
    g.add(arc);
    // brown tips at both ends of the arc
    for (const a of [0, Math.PI * 0.75]) {
      const ang = a + Math.PI * 0.12;
      g.add(mesh(sph(0.08, 8, 6), 0x6b4a1f, Math.cos(ang) * 0.6, 0.15, 0.25 - Math.sin(ang) * 0.6));
    }
    return g;
  },
  Sandwich() {
    const g = new THREE.Group();
    const tri = (r, h) => cyl(r, r, h, 3);
    g.add(mesh(tri(0.75, 0.16), 0xe9c27a, 0, 0.08, 0, 0, Math.PI / 6));
    g.add(mesh(tri(0.8, 0.06), 0x6cc04a, 0, 0.19, 0, 0, Math.PI / 6));
    g.add(mesh(tri(0.74, 0.06), 0xffd23f, 0, 0.25, 0, 0, Math.PI / 6 + 0.12));
    g.add(mesh(tri(0.75, 0.16), 0xe9c27a, 0, 0.36, 0, 0, Math.PI / 6));
    return g;
  },
  Spoon() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.15, 0.06, 0.16, 0.03), 0xc9ccd6, -0.2, 0.05, 0));
    const bowl = mesh(sph(0.24, 14, 10), 0xd8dbe4, 0.55, 0.07, 0);
    bowl.scale.set(1.25, 0.3, 0.95);
    g.add(bowl);
    g.rotation.y = 0.5;
    return g;
  },
  "Juice box"() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.7, 1.0, 0.45, 0.05), 0xff9f2e, 0, 0.5, 0));
    g.add(mesh(box(0.5, 0.45, 0.02), 0xffffff, 0, 0.5, 0.23));
    g.add(mesh(sph(0.13, 10, 8), 0xff9f2e, 0, 0.52, 0.25));
    g.add(mesh(cyl(0.035, 0.035, 0.55, 6), 0x5cc0ea, 0.18, 1.15, 0, 0, 0, -0.35));
    g.rotation.y = -0.3;
    return g;
  },
});

export const SCHOOL = ["Book", "Notebook", "Pencil", "Lunch box", "Water bottle", "Pencil box", "Ruler"];
export const NOT_SCHOOL = ["Ball", "Teddy bear", "Pillow", "TV remote", "Toy car", "Slipper"];
export const LUNCH = ["Lunch box", "Water bottle", "Apple", "Banana", "Sandwich", "Spoon", "Juice box"];
export const NOT_LUNCH = ["Book", "Pencil", "Ruler", "Ball", "Toy car", "Teddy bear", "Slipper", "TV remote"];

export const ITEM_SETS = {
  school: { yes: SCHOOL, no: NOT_SCHOOL },
  lunch: { yes: LUNCH, no: NOT_LUNCH },
};

export const EMOJI = {
  Apple: "🍎",
  Banana: "🍌",
  Sandwich: "🥪",
  Spoon: "🥄",
  "Juice box": "🧃",
  Book: "📘",
  Notebook: "📒",
  Pencil: "✏️",
  "Lunch box": "🍱",
  "Water bottle": "🧴",
  "Pencil box": "🖍️",
  Ruler: "📏",
  Ball: "⚽",
  "Teddy bear": "🧸",
  Pillow: "🛏️",
  "TV remote": "📺",
  "Toy car": "🚗",
  Slipper: "🩴",
};

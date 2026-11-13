// A cosy, furnished kids' room for the game (Sims-like toy furniture).
// Everything is built from primitives + small canvas textures (no downloads).
// Floor at y = 0, back wall at z = -6. The play table spans x -7.4..1.8.
import * as THREE from "three";
import { mesh, box, rbox, cyl, sph, blob, mat } from "./kit.js";

// ---------------------------------------------------------------- canvas textures
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

// tiny seeded random so the room looks the same every time
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const woodFloor = () =>
  canvasTex(512, 512, (g, w, h) => {
    const r = rng(7);
    const rows = 8;
    const ph = h / rows;
    const tones = ["#c9965f", "#d2a06a", "#bf8b55", "#d8aa74", "#c4915b"];
    for (let i = 0; i < rows; i++) {
      // each row is split into planks of different lengths
      let x = -r() * 200;
      while (x < w) {
        const len = 180 + r() * 220;
        g.fillStyle = tones[(r() * tones.length) | 0];
        g.fillRect(x, i * ph, len, ph);
        // wood grain
        g.strokeStyle = "rgba(120, 72, 30, 0.18)";
        g.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
          const y = i * ph + 6 + r() * (ph - 12);
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + len * 0.3, y + 4, x + len * 0.6, y - 4, x + len, y + 1);
          g.stroke();
        }
        g.fillStyle = "rgba(90, 50, 20, 0.55)";
        g.fillRect(x, i * ph, 2, ph);
        x += len;
      }
      g.fillStyle = "rgba(90, 50, 20, 0.5)";
      g.fillRect(0, i * ph, w, 2);
    }
  }, [7, 5]);

const chevronRug = () =>
  canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#f6ead2";
    g.fillRect(0, 0, w, h);
    const cols = ["#3f5f7a", "#f2a24a", "#f6ead2", "#5bb7c0", "#f6ead2", "#3f5f7a"];
    const band = h / 12;
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = cols[i % cols.length];
      g.lineWidth = band * 0.55;
      g.lineJoin = "miter";
      g.beginPath();
      for (let x = -64; x <= w + 64; x += 64) g.lineTo(x, i * band + ((x / 64) % 2 ? 22 : -22));
      g.stroke();
    }
    // border
    g.strokeStyle = "#3f5f7a";
    g.lineWidth = 26;
    g.strokeRect(13, 13, w - 26, h - 26);
    g.strokeStyle = "#f2a24a";
    g.lineWidth = 8;
    g.strokeRect(34, 34, w - 68, h - 68);
  });

const wallpaper = () =>
  canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#cfe9df";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#c2e1d5";
    for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 32, h);
    g.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let y = 16; y < h; y += 64)
      for (let x = 16; x < w; x += 64) {
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fill();
      }
  }, [16, 6]);

const flowerArt = () =>
  canvasTex(256, 200, (g, w, h) => {
    g.fillStyle = "#e9f4f6";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#4a8f8a";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(w / 2, h - 20);
    g.quadraticCurveTo(w / 2 - 10, h / 2, w / 2, 70);
    g.stroke();
    g.fillStyle = "#6bb3a6";
    for (const [x, y, a] of [[w / 2 - 26, 120, -0.6], [w / 2 + 24, 140, 0.6]]) {
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.beginPath();
      g.ellipse(0, 0, 26, 10, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    const petals = ["#f28fb1", "#f6b04a", "#f28fb1", "#f6b04a", "#f28fb1", "#f6b04a"];
    petals.forEach((c, i) => {
      const a = (i / petals.length) * Math.PI * 2;
      g.fillStyle = c;
      g.beginPath();
      g.arc(w / 2 + Math.cos(a) * 22, 62 + Math.sin(a) * 22, 16, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = "#ffd23f";
    g.beginPath();
    g.arc(w / 2, 62, 14, 0, Math.PI * 2);
    g.fill();
  });

// ---------------------------------------------------------------- furniture
const WOOD = 0xc89463, WOOD_DARK = 0x9b6a43, WOOD_LIGHT = 0xdcae7c;

function addShadowBlob(scene, x, z, w, d) {
  const s = blob(1);
  s.scale.set(w, d, 1);
  s.position.set(x, 0.015, z);
  scene.add(s);
}

function bookshelf() {
  const g = new THREE.Group();
  const W = 3.4, H = 7.2, D = 1.3;
  g.add(mesh(rbox(W, 0.25, D, 0.06), WOOD, 0, H - 0.12, 0));
  g.add(mesh(rbox(0.22, H, D, 0.06), WOOD, -W / 2 + 0.11, H / 2, 0));
  g.add(mesh(rbox(0.22, H, D, 0.06), WOOD, W / 2 - 0.11, H / 2, 0));
  g.add(mesh(rbox(W, H, 0.12, 0.04), WOOD_DARK, 0, H / 2, -D / 2 + 0.06));
  const shelves = [0.15, 1.9, 3.6, 5.3];
  for (const y of shelves) g.add(mesh(rbox(W - 0.1, 0.18, D, 0.05), WOOD, 0, y, 0));
  // colourful books (+ a couple of drawer boxes like the reference)
  const r = rng(3);
  const bookCols = [0xe2475a, 0x3f7fc1, 0xf2b33d, 0x4fa86b, 0x8e6cc4, 0xf08a4b, 0x2f4f6f];
  shelves.slice(0, 3).forEach((y, si) => {
    if (si === 0) {
      g.add(mesh(rbox(1.45, 1.4, 1.05, 0.08), 0x5bb7c0, -0.78, y + 0.8, 0.05));
      g.add(mesh(rbox(1.45, 1.4, 1.05, 0.08), 0xf2c94c, 0.78, y + 0.8, 0.05));
      for (const x of [-0.78, 0.78]) g.add(mesh(rbox(0.4, 0.1, 0.1, 0.04), 0xf6ead2, x, y + 1.1, 0.6));
      return;
    }
    let x = -W / 2 + 0.35;
    while (x < W / 2 - 0.5) {
      const bw = 0.16 + r() * 0.14;
      const bh = 1.0 + r() * 0.45;
      const tilt = x > W / 2 - 1.1 && r() > 0.5 ? 0.25 : 0;
      g.add(mesh(rbox(bw, bh, 0.85, 0.03), bookCols[(r() * bookCols.length) | 0], x + bw / 2, y + 0.09 + bh / 2, 0.05, 0, 0, tilt));
      x += bw + 0.02 + tilt * 0.6;
    }
  });
  // top: a little plant and a toy
  g.add(mesh(cyl(0.32, 0.24, 0.5), 0xf6ead2, -0.9, H + 0.25, 0));
  for (const [x, y, z, s] of [[-0.9, H + 0.75, 0, 0.36], [-1.12, H + 0.6, 0.1, 0.24], [-0.7, H + 0.62, -0.05, 0.26]])
    g.add(mesh(sph(s), 0x5aa86a, x, y, z));
  g.add(mesh(rbox(0.55, 0.55, 0.55, 0.12), 0xe2475a, 0.8, H + 0.27, 0));
  return g;
}

function dresser() {
  const g = new THREE.Group();
  const W = 3.4, H = 3.0, D = 1.5;
  g.add(mesh(rbox(W, H, D, 0.1), WOOD_LIGHT, 0, H / 2 + 0.35, 0));
  g.add(mesh(rbox(W + 0.15, 0.16, D + 0.12, 0.06), WOOD, 0, H + 0.42, 0));
  const fronts = [0x5bb7c0, 0xf08a4b, 0xf2c94c];
  fronts.forEach((c, i) => {
    const y = 0.35 + 0.5 + i * 0.95;
    g.add(mesh(rbox(W - 0.3, 0.82, 0.12, 0.06), c, 0, y, D / 2 + 0.02));
    g.add(mesh(rbox(0.6, 0.1, 0.1, 0.04), 0xf6ead2, 0, y + 0.12, D / 2 + 0.12));
  });
  for (const x of [-W / 2 + 0.25, W / 2 - 0.25])
    for (const z of [-D / 2 + 0.25, D / 2 - 0.25]) g.add(mesh(cyl(0.07, 0.05, 0.4, 10), WOOD_DARK, x, 0.2, z));
  // on top: a lamp and stacked books
  g.add(mesh(cyl(0.14, 0.2, 0.15), 0x2f3640, 1.05, H + 0.58, 0));
  g.add(mesh(cyl(0.035, 0.035, 0.9), 0x2f3640, 1.05, H + 1.05, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.55, 0.55, 28, 1, true), mat(0xf6ead2, { side: THREE.DoubleSide, emissive: 0xffd9a0, emissiveIntensity: 0.35 }), 1.05, H + 1.55, 0));
  g.add(mesh(rbox(1.0, 0.18, 0.75), 0x3f7fc1, -0.8, H + 0.6, 0));
  g.add(mesh(rbox(0.9, 0.16, 0.7), 0xe2475a, -0.78, H + 0.77, 0, 0, 0.2));
  g.add(mesh(rbox(0.85, 0.15, 0.68), 0xf2c94c, -0.8, H + 0.93, 0, 0, -0.15));
  return g;
}

function armchair() {
  const g = new THREE.Group();
  const TEAL = 0x34b3c4, TEAL_D = 0x2a98a8;
  g.add(mesh(rbox(2.6, 0.75, 2.3, 0.3), TEAL, 0, 1.0, 0));
  g.add(mesh(rbox(2.6, 2.3, 0.6, 0.28), TEAL_D, 0, 2.0, -0.95, -0.12));
  for (const s of [-1, 1]) g.add(mesh(rbox(0.45, 1.05, 2.1, 0.2), TEAL_D, s * 1.2, 1.45, 0.05));
  g.add(mesh(rbox(1.8, 0.35, 1.7, 0.16), 0x43c1d1, 0, 1.48, 0.15));
  // chevron cushion
  const pillow = mesh(rbox(1.1, 0.95, 0.35, 0.16), mat(0xffffff, { map: chevronRug() }), 0, 2.05, -0.45, -0.2, 0, 0.08);
  g.add(pillow);
  for (const x of [-1.05, 1.05])
    for (const z of [-0.9, 0.9]) g.add(mesh(cyl(0.08, 0.05, 0.65, 10), WOOD_DARK, x, 0.32, z, z > 0 ? 0.15 : -0.15));
  return g;
}

function floorLamp() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(cyl(0.04, 0.04, 2.2, 8), 0x2f3640, Math.cos(a) * 0.35, 1.0, Math.sin(a) * 0.35);
    leg.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
    g.add(leg);
  }
  g.add(mesh(cyl(0.04, 0.04, 3.4, 8), 0x2f3640, 0, 3.6, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.55, 0.8, 1.0, 28, 1, true), mat(0x2b2f36, { side: THREE.DoubleSide, roughness: 0.5 }), 0, 5.4, 0));
  g.add(mesh(sph(0.22), mat(0xfff2c8, { emissive: 0xffe3a0, emissiveIntensity: 1.2 }), 0, 5.1, 0));
  return g;
}

function plant() {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.55, 0.42, 1.0), 0xf6ead2, 0, 0.5, 0));
  g.add(mesh(cyl(0.58, 0.58, 0.12), 0xe0c9a0, 0, 1.0, 0));
  const r = rng(11);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaf = mesh(sph(0.42, 16, 10), i % 2 ? 0x4f9f62 : 0x66b877, Math.cos(a) * 0.38, 1.6 + r() * 0.8, Math.sin(a) * 0.38);
    leaf.scale.set(0.45, 1.2, 0.2);
    leaf.rotation.set(Math.sin(a) * 0.5, -a, -Math.cos(a) * 0.5);
    g.add(leaf);
  }
  return g;
}

function pouf() {
  const g = new THREE.Group();
  g.add(mesh(rbox(1.5, 1.2, 1.5, 0.35), mat(0xffffff, { map: chevronRug(), roughness: 0.9 }), 0, 0.6, 0));
  return g;
}

function windowWithCurtains(x, y) {
  const g = new THREE.Group();
  g.position.set(x, y, -5.9);
  g.add(mesh(rbox(4.6, 3.4, 0.16, 0.06), 0xf6f1e6, 0, 0, 0));
  g.add(mesh(new THREE.PlaneGeometry(4.1, 2.9), new THREE.MeshBasicMaterial({ color: 0xa9dcf7 }), 0, 0, 0.09));
  // view outside: hills, sun and clouds
  g.add(mesh(new THREE.CircleGeometry(2.1, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x8ccf7e }), -0.8, -1.45, 0.1));
  g.add(mesh(new THREE.CircleGeometry(1.7, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x74bf6a }), 1.3, -1.45, 0.11));
  g.add(mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0xffd23f }), 1.1, 0.8, 0.1));
  const cloud = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const [cx, cy, r] of [[-1.2, 0.6, 0.32], [-0.8, 0.75, 0.42], [-0.35, 0.6, 0.3]])
    g.add(mesh(new THREE.CircleGeometry(r, 20), cloud, cx, cy, 0.11));
  g.add(mesh(rbox(0.12, 2.9, 0.12, 0.04), 0xf6f1e6, 0, 0, 0.14));
  g.add(mesh(rbox(4.1, 0.12, 0.12, 0.04), 0xf6f1e6, 0, 0, 0.14));
  g.add(mesh(rbox(5.0, 0.22, 0.6, 0.06), 0xf6f1e6, 0, -1.78, 0.25)); // sill
  // curtain rod + soft coral curtains with folds
  g.add(mesh(cyl(0.06, 0.06, 6.4, 10), WOOD_DARK, 0, 2.1, 0.45, 0, 0, Math.PI / 2));
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const fold = mesh(cyl(0.2, 0.26, 4.4, 14), i % 2 ? 0xf28f7a : 0xf6a28f, s * (2.45 + i * 0.28), -0.1, 0.4);
      fold.scale.z = 0.6;
      g.add(fold);
    }
  }
  return g;
}

function picture(x, y) {
  const g = new THREE.Group();
  g.position.set(x, y, -5.92);
  g.add(mesh(rbox(2.2, 2.6, 0.14, 0.05), WOOD, 0, 0, 0));
  g.add(mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshStandardMaterial({ map: flowerArt(), roughness: 0.9 }), 0, 0, 0.08));
  return g;
}

function wallClock(x, y) {
  const g = new THREE.Group();
  g.position.set(x, y, -5.9);
  g.add(mesh(cyl(0.85, 0.85, 0.16, 36), 0xf6f1e6, 0, 0, 0, Math.PI / 2));
  g.add(mesh(new THREE.TorusGeometry(0.85, 0.09, 10, 40), 0x3f7fc1, 0, 0, 0.04));
  g.add(mesh(rbox(0.07, 0.6, 0.05, 0.02), 0x2f3640, 0, 0.25, 0.12));
  g.add(mesh(rbox(0.45, 0.07, 0.05, 0.02), 0x2f3640, 0.2, 0, 0.12));
  g.add(mesh(sph(0.07), 0xe2475a, 0, 0, 0.13));
  return g;
}

function bunting() {
  const g = new THREE.Group();
  const flagGeo = new THREE.ConeGeometry(0.36, 0.7, 3);
  const cols = [0xff6b6b, 0xffd23f, 0x5cc0ea, 0x7ddc6f, 0xc58cf0];
  for (let i = 0; i < 19; i++) {
    const x = -11.5 + i * 1.25;
    const y = 11.0 - 0.45 * Math.cos((x / 11.5) * Math.PI * 0.5);
    const f = mesh(flagGeo, cols[i % cols.length], x, y, -5.7, 0, 0, Math.PI);
    f.scale.z = 0.15;
    g.add(f);
  }
  return g;
}

function table(TABLE_Y) {
  const t = new THREE.Group();
  t.add(mesh(rbox(9.8, 0.34, 5.2, 0.14), WOOD_LIGHT, -2.8, TABLE_Y - 0.17, 0));
  t.add(mesh(rbox(9.4, 0.2, 4.8, 0.08), WOOD, -2.8, TABLE_Y - 0.42, 0));
  for (const [x, z] of [[-7.2, -2.1], [1.6, -2.1], [-7.2, 2.1], [1.6, 2.1]])
    t.add(mesh(cyl(0.2, 0.13, TABLE_Y - 0.3, 14), WOOD_DARK, x, (TABLE_Y - 0.3) / 2, z));
  return t;
}

// ---------------------------------------------------------------- room
export function buildRoom(scene, TABLE_Y) {
  const floor = mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ map: woodFloor(), roughness: 0.55 }), 0, 0, 0, -Math.PI / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // big chevron rug under the table, round rug under the bag
  const rug = mesh(new THREE.PlaneGeometry(13, 8), new THREE.MeshStandardMaterial({ map: chevronRug(), roughness: 1 }), -2.8, 0.012, 0.4, -Math.PI / 2);
  rug.receiveShadow = true;
  scene.add(rug);
  for (const [r, c, y] of [[3.6, 0x86c4b0, 0.014], [3.1, 0xa9d8c4, 0.016], [2.0, 0xc4e6d6, 0.018]]) {
    const m = mesh(new THREE.CircleGeometry(r, 48), mat(c, { roughness: 1 }), 5.4, y, 0.6, -Math.PI / 2);
    m.receiveShadow = true;
    scene.add(m);
  }

  // back wall: wallpaper, white wainscot panel, chair rail and skirting
  const wall = mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshStandardMaterial({ map: wallpaper(), roughness: 0.95 }), 0, 10, -6);
  wall.receiveShadow = true;
  scene.add(wall);
  scene.add(mesh(box(60, 2.8, 0.1), 0xf6f1e6, 0, 1.4, -5.95));
  scene.add(mesh(box(60, 0.18, 0.22), WOOD_LIGHT, 0, 2.85, -5.9));
  scene.add(mesh(box(60, 0.45, 0.2), WOOD, 0, 0.22, -5.9));

  scene.add(windowWithCurtains(-3, 7.4));
  scene.add(picture(-7.6, 7.2));
  scene.add(wallClock(3.6, 8.2));
  scene.add(bunting());

  const shelf = bookshelf();
  shelf.position.set(-11.4, 0, -5.2);
  scene.add(shelf);
  addShadowBlob(scene, -11.4, -5.0, 4.6, 2.4);

  const dr = dresser();
  dr.position.set(3.4, 0, -5.0);
  scene.add(dr);
  addShadowBlob(scene, 3.4, -4.8, 4.6, 2.6);

  const chair = armchair();
  chair.position.set(10.2, 0, -2.8);
  chair.rotation.y = -0.55;
  scene.add(chair);
  addShadowBlob(scene, 10.2, -2.8, 4.4, 4.0);

  const lamp = floorLamp();
  lamp.position.set(7.6, 0, -5.0);
  scene.add(lamp);

  const pl = plant();
  pl.position.set(-8.6, 0, -4.3);
  scene.add(pl);
  addShadowBlob(scene, -8.6, -4.3, 2.2, 2.2);

  const pf = pouf();
  pf.position.set(10.6, 0, 2.6);
  pf.rotation.y = 0.3;
  scene.add(pf);
  addShadowBlob(scene, 10.6, 2.6, 2.6, 2.6);

  scene.add(table(TABLE_Y));
  const tShadow = blob(11);
  tShadow.scale.set(1, 0.6, 1);
  tShadow.position.set(-2.8, 0.02, 0.2);
  scene.add(tShadow);
}

// ---------------------------------------------------------------- lights
/** Warm afternoon light with soft real shadows + a cool fill from the right. */
export function addLights(scene, { shadowSize = 2048 } = {}) {
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a6e52, 0.75));
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.3);
  sun.position.set(-7, 16, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  const c = sun.shadow.camera;
  c.left = -17; c.right = 17; c.top = 14; c.bottom = -12; c.near = 2; c.far = 45;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdde8ff, 0.55);
  fill.position.set(9, 7, 8);
  scene.add(fill);
  return sun;
}

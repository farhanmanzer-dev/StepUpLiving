// The 3D school yard behind the menu screens, in the same soft "toy" style as
// the game room. Children can tap the sun, clouds, trees, flowers, the school
// clock, the door and the birds: each reacts with an animation and a sound.
//
// Performance: 30 FPS cap, pauses when the tab is hidden, and in "soft" mode
// (behind dialogs) it draws one still frame and stops.
import * as THREE from "three";
import { mesh, rbox, cyl, sph, mat, setupLook } from "./kit.js";
import { buildFace } from "./backpack.js";
import { sfx } from "./fx.js";

const FRAME_MS = 1000 / 30;
const CAM_POS = new THREE.Vector3(0, 7, 26);
const CAM_TARGET = new THREE.Vector3(0, 3.2, 0);

// ---------------------------------------------------------------- textures
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const skyTex = () =>
  canvasTex(4, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#3fa6d6");
    grd.addColorStop(0.6, "#86d0ee");
    grd.addColorStop(1, "#c4ecf8");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });
const grassTex = () => {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#8cc955";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = i % 3 ? "rgba(70, 140, 40, 0.18)" : "rgba(200, 240, 140, 0.25)";
      g.fillRect(Math.random() * w, Math.random() * h, 2, 5);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 30);
  return t;
};
const signTex = () =>
  canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = "#8a3d1c";
    g.font = "bold 84px Fredoka, 'Baloo 2', 'Trebuchet MS', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.letterSpacing = "10px";
    g.fillText("SCHOOL", w / 2, h / 2 + 4);
  });

// invisible, bigger tap target for small things
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
const hit = (r) => new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), hitMat);

const basic = (color, extra) => new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false, ...extra });

// ---------------------------------------------------------------- pieces
function prism(points, depth, color) {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 3 });
  return mesh(geo, color);
}

function windowPane(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(mesh(rbox(1.9, 1.75, 0.2, 0.08), 0xfff6e0));
  g.add(mesh(rbox(1.6, 1.45, 0.1, 0.04), mat(0x7cc4e4, { roughness: 0.12, metalness: 0.25 }), 0, 0, 0.08));
  g.add(mesh(rbox(0.12, 1.45, 0.08, 0.03), 0xfff6e0, 0, 0, 0.15));
  g.add(mesh(rbox(1.6, 0.12, 0.08, 0.03), 0xfff6e0, 0, 0, 0.15));
  const glint = mesh(new THREE.PlaneGeometry(0.16, 0.7), basic(0xffffff, { transparent: true, opacity: 0.6 }), -0.35, 0.25, 0.15, 0, 0, -0.6);
  g.add(glint);
  g.add(mesh(rbox(2.2, 0.2, 0.45, 0.06), 0xfff6e0, 0, -0.98, 0.15));
  return g;
}

function buildSchool(taps) {
  const g = new THREE.Group();
  const WALL = 0xf7a36b, WING = 0xf0915a, ROOF = 0xe2683a, ROOF_SIDE = 0xc9562f, TRIM = 0xb84d27;

  // centre block + gable roof
  g.add(mesh(rbox(7, 7, 5, 0.25), WALL, 0, 3.5, 0));
  const gable = prism([[-4.3, 0], [4.3, 0], [0, 3.2]], 5.2, ROOF);
  gable.position.set(0, 7, -2.6);
  g.add(gable);
  for (const s of [-1, 1]) {
    const trim = mesh(rbox(5.6, 0.42, 0.5, 0.15), TRIM, s * 2.15, 8.65, 2.75, 0, 0, -s * 0.64);
    g.add(trim);
  }
  // wings with sloped roofs
  for (const s of [-1, 1]) {
    g.add(mesh(rbox(6.4, 4.6, 4, 0.22), WING, s * 6.6, 2.3, -0.5));
    const roof = prism([[s * 3.3, 0], [s * 10.1, 0], [s * 9.0, 1.6], [s * 3.3, 1.6]], 4.4, ROOF_SIDE);
    roof.position.set(0, 4.55, -2.7);
    g.add(roof);
    g.add(mesh(rbox(7.0, 0.3, 0.4, 0.12), TRIM, s * 6.7, 4.6, 1.78));
    g.add(windowPane(s * 5.0, 2.7, 1.5));
    g.add(windowPane(s * 8.2, 2.7, 1.5));
  }

  // clock on the gable: tap to ring it
  const clock = new THREE.Group();
  clock.position.set(0, 8.4, 2.75);
  clock.add(mesh(cyl(1.0, 1.0, 0.3, 36), 0xffc93c, 0, 0, 0, Math.PI / 2));
  clock.add(mesh(cyl(0.76, 0.76, 0.32, 36), 0xfffaf0, 0, 0, 0.02, Math.PI / 2));
  const minute = new THREE.Group();
  minute.add(mesh(rbox(0.1, 0.6, 0.06, 0.03), 0x3a2a20, 0, 0.26, 0));
  const hour = new THREE.Group();
  hour.add(mesh(rbox(0.42, 0.1, 0.06, 0.03), 0x3a2a20, 0.17, 0, 0));
  hour.rotation.z = -0.4;
  for (const hand of [minute, hour]) {
    hand.position.z = 0.2;
    clock.add(hand);
  }
  clock.add(mesh(sph(0.07), 0xe2475a, 0, 0, 0.24));
  clock.add(hit(1.2));
  g.add(clock);
  taps.push({
    root: clock,
    tap: (anim) => {
      sfx.clock();
      anim(900, (k) => {
        clock.rotation.z = Math.sin(k * Math.PI * 8) * 0.18 * (1 - k);
        minute.rotation.z = -k * Math.PI * 4;
        hour.rotation.z = -0.4 - k * Math.PI * 2;
      });
    },
  });

  // sign
  g.add(mesh(rbox(4.4, 1.1, 0.25, 0.12), 0xffc93c, 0, 5.75, 2.55));
  g.add(mesh(new THREE.PlaneGeometry(4.0, 1.0), basic(0xffffff, { map: signTex(), transparent: true }), 0, 5.75, 2.69));

  // door: tap to open and close it
  g.add(mesh(rbox(3.1, 4.1, 0.3, 0.12), 0xffd35c, 0, 2.05, 2.5));
  g.add(mesh(rbox(2.6, 3.6, 0.1), 0x3a4a5a, 0, 1.85, 2.62));
  const doors = [];
  for (const s of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.position.set(s * 1.28, 0, 2.7);
    const leaf = new THREE.Group();
    leaf.position.x = -s * 0.64;
    leaf.add(mesh(rbox(1.24, 3.55, 0.16, 0.05), 0x4aa3c9, 0, 1.85, 0));
    leaf.add(mesh(rbox(0.8, 1.2, 0.06, 0.03), mat(0xbfe6f7, { roughness: 0.1, metalness: 0.2 }), 0, 2.6, 0.1));
    leaf.add(mesh(sph(0.09), 0xffd35c, -s * 0.38, 1.7, 0.12));
    hinge.add(leaf);
    g.add(hinge);
    doors.push({ hinge, s });
  }
  const doorHit = hit(1.8);
  doorHit.position.set(0, 1.9, 2.8);
  g.add(doorHit);
  taps.push({
    root: doorHit,
    tap: (anim) => {
      sfx.door();
      anim(1600, (k) => {
        const open = Math.sin(Math.PI * Math.min(1, k * 1.15)) * 1.3;
        for (const d of doors) d.hinge.rotation.y = d.s * open;
      });
    },
  });
  // steps
  g.add(mesh(rbox(4.2, 0.25, 1.3, 0.08), 0xe6d6b4, 0, 0.12, 3.2));
  g.add(mesh(rbox(3.5, 0.25, 0.8, 0.08), 0xd6c3a0, 0, 0.37, 2.95));

  // flag pole + waving flag
  g.add(mesh(cyl(0.07, 0.07, 2.6, 10), 0x8a8f99, 0, 11.3, 0));
  g.add(mesh(sph(0.13), 0xffd23f, 0, 12.65, 0));
  const flagGeo = new THREE.PlaneGeometry(1.6, 0.95, 10, 1);
  flagGeo.translate(0.8, 0, 0);
  const flag = mesh(flagGeo, mat(0xe2475a, { side: THREE.DoubleSide }), 0.07, 12.05, 0);
  g.add(flag);
  const base = flagGeo.attributes.position.array.slice();
  const wave = (t) => {
    const p = flagGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      p.setZ(i, Math.sin(x * 3.2 - t * 6) * 0.14 * x);
    }
    p.needsUpdate = true;
    flagGeo.computeVertexNormals();
  };
  return { group: g, wave };
}

function buildTree() {
  const g = new THREE.Group();
  const sway = new THREE.Group(); // shaking pivots around the trunk base
  g.add(sway);
  sway.add(mesh(cyl(0.32, 0.45, 3.2, 14), 0x8a5a36, 0, 1.6, 0));
  for (const [x, y, z, r, c] of [
    [0, 4.6, 0, 2.2, 0x4f9f62], [-1.5, 3.7, 0.3, 1.55, 0x4a965c], [1.5, 3.7, 0.3, 1.55, 0x4a965c],
    [0.3, 5.7, -0.2, 1.4, 0x5fb070], [-0.5, 5.1, 1.0, 1.0, 0x66b877],
  ])
    sway.add(mesh(sph(r), c, x, y, z));
  const apples = [];
  for (const [x, y, z] of [[1.2, 4.2, 1.5], [-1.1, 3.4, 1.45], [0.2, 5.4, 1.4], [-0.3, 3.0, 1.75]]) {
    const a = mesh(sph(0.24, 16, 12), mat(0xe2475a, { roughness: 0.35 }), x, y, z);
    sway.add(a);
    apples.push({ m: a, home: a.position.clone() });
  }
  const h = hit(2.6);
  h.position.y = 4.2;
  sway.add(h);
  return {
    group: g,
    tap: (anim) => {
      sfx.tree();
      anim(650, (k) => (sway.rotation.z = Math.sin(k * Math.PI * 5) * 0.06 * (1 - k)));
      apples.forEach(({ m, home }, i) => {
        // fall, bounce, rest on the grass, then pop back onto the branch
        anim(2600, (k) => {
          const kk = Math.max(0, k - i * 0.04);
          const ground = 0.24 - g.position.y;
          if (kk < 0.25) m.position.y = home.y + (ground - home.y) * Math.pow(kk / 0.25, 2);
          else if (kk < 0.38) m.position.y = ground + Math.sin(((kk - 0.25) / 0.13) * Math.PI) * 0.5;
          else m.position.y = ground;
          m.position.z = home.z + Math.min(1, kk / 0.25) * 0.6;
          const fade = kk > 0.85 ? (kk - 0.85) / 0.15 : 0;
          if (kk > 0.85) m.position.copy(home);
          m.scale.setScalar(kk > 0.85 ? fade : 1);
        }, () => { m.position.copy(home); m.scale.setScalar(1); });
      });
    },
  };
}

function buildBush(s = 1) {
  const g = new THREE.Group();
  for (const [x, y, z, r, c] of [[-1.1, 0.6, 0, 1.0, 0x5aa86a], [1.0, 0.55, 0, 0.95, 0x5aa86a], [0, 1.0, 0.1, 1.25, 0x63b373], [-0.3, 1.5, 0.5, 0.6, 0x7cc68a]])
    g.add(mesh(sph(r), c, x, y, z));
  g.scale.setScalar(s);
  return g;
}

const PETALS = [0xff8fb1, 0xffd23f, 0xc58cf0, 0xff8fb1, 0xffffff];
function buildFlower(i) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.04, 0.05, 0.7, 6), 0x4f8f3f, 0, 0.35, 0));
  const head = new THREE.Group();
  head.position.y = 0.75;
  const c = PETALS[i % PETALS.length];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const p = mesh(sph(0.16, 12, 8), c, Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0);
    p.scale.z = 0.5;
    head.add(p);
  }
  head.add(mesh(sph(0.12, 12, 8), 0xffc928, 0, 0, 0.06));
  head.add(hit(0.6));
  g.add(head);
  return {
    group: g,
    root: head,
    tap: (anim) => {
      sfx.flower();
      anim(850, (k) => {
        head.rotation.z = k * Math.PI * 2;
        head.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.8);
      });
    },
  };
}

function buildTuft() {
  const g = new THREE.Group();
  for (const [x, h, r] of [[-0.18, 0.5, -0.3], [0, 0.7, 0], [0.18, 0.55, 0.3]]) {
    const blade = mesh(new THREE.ConeGeometry(0.09, h, 6), 0x4f8f3f, x, h / 2, 0, 0, 0, r);
    g.add(blade);
  }
  return g;
}

function buildCloud() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const white = mat(0xffffff, { roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.45, fog: false });
  for (const [x, y, z, r] of [[0, 0.3, 0, 1.6], [-1.6, -0.2, 0, 1.15], [1.6, -0.25, 0, 1.05], [0.7, 1.0, -0.2, 1.2], [-0.8, 0.8, -0.2, 1.0]]) {
    const m = mesh(sph(r), white, x, y, z);
    m.castShadow = false;
    body.add(m);
  }
  const bottom = mesh(sph(1), white, 0, -0.5, 0);
  bottom.scale.set(2.6, 0.55, 1.1);
  body.add(bottom);
  const face = buildFace();
  face.group.scale.setScalar(0.85);
  face.group.position.set(0.1, 0, 1.6);
  body.add(face.group);
  return {
    group: g,
    root: body,
    tap: (anim) => {
      sfx.cloud();
      face.setMood("happy");
      anim(750, (k) => {
        const w = Math.sin(k * Math.PI * 3) * (1 - k) * 0.22;
        body.scale.set(1 + w, 1 - w, 1);
      }, () => face.setMood("smile"));
    },
    face,
  };
}

function buildSun() {
  const g = new THREE.Group();
  const spin = new THREE.Group();
  g.add(spin);
  const rays = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const ray = mesh(new THREE.CapsuleGeometry(0.35, 1.3, 4, 10), basic(0xffd93d), Math.cos(a) * 5.4, Math.sin(a) * 5.4, -0.4, 0, 0, a + Math.PI / 2);
    rays.add(ray);
  }
  g.add(rays);
  g.add(mesh(new THREE.CircleGeometry(4.6, 48), basic(0xfff3b0, { transparent: true, opacity: 0.45, depthWrite: false }), 0, 0, -0.6));
  spin.add(mesh(new THREE.CircleGeometry(3.4, 48), basic(0xffe066)));
  spin.add(mesh(new THREE.CircleGeometry(1.1, 32), basic(0xfff6c4, { transparent: true, opacity: 0.7 }), -1.0, 1.2, 0.01));
  const face = buildFace();
  face.group.scale.setScalar(1.9);
  face.group.position.set(0, -0.2, 0.05);
  spin.add(face.group);
  spin.add(hit(4.5));
  let fast = 0;
  return {
    group: g,
    root: spin,
    update(t, dt) { rays.rotation.z -= dt * (0.25 + fast * 4); },
    tap: (anim) => {
      sfx.sun();
      face.setMood("happy");
      anim(1100, (k) => {
        fast = 1 - k;
        spin.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.25);
        spin.rotation.z = Math.sin(k * Math.PI * 4) * 0.25 * (1 - k);
      }, () => { fast = 0; face.setMood("smile"); });
    },
  };
}

function buildBird(color) {
  const g = new THREE.Group();
  const loop = new THREE.Group();
  g.add(loop);
  const body = mesh(sph(0.5), color, 0, 0, 0);
  body.scale.set(1.2, 1, 1);
  loop.add(body);
  const belly = mesh(sph(0.32), 0xfff4dc, 0.15, -0.12, 0.25);
  loop.add(belly);
  loop.add(mesh(new THREE.ConeGeometry(0.13, 0.35, 10), 0xff7a3a, 0.68, 0.05, 0, 0, 0, -Math.PI / 2));
  for (const z of [0.3, -0.3]) {
    loop.add(mesh(sph(0.08, 10, 8), 0x2a1a10, 0.4, 0.18, z));
  }
  const wings = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(-0.05, 0.15, s * 0.35);
    const w = mesh(sph(0.42), color, 0, 0, s * 0.3);
    w.scale.set(0.9, 0.18, 0.75);
    pivot.add(w);
    loop.add(pivot);
    wings.push({ pivot, s });
  }
  loop.add(hit(1.3));
  return {
    group: g,
    root: loop,
    flap(t) { for (const { pivot, s } of wings) pivot.rotation.x = s * Math.sin(t * 16) * 0.7; },
    tap: (anim) => {
      sfx.bird();
      anim(850, (k) => {
        loop.rotation.z = k * Math.PI * 2;
        loop.position.y = Math.sin(k * Math.PI) * 1.6;
      }, () => { loop.rotation.z = 0; loop.position.y = 0; });
    },
  };
}

// ---------------------------------------------------------------- scene
export function createSchoolScene(canvas, { soft = false } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 1.5, powerPreference: "default", stencil: false });
  renderer.setPixelRatio(Math.min(dpr, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const sky = skyTex();
  scene.background = sky;
  scene.fog = new THREE.Fog(0xb8e6f6, 60, 160);
  const disposeLook = setupLook(renderer, scene, { shadows: true, envIntensity: 0.35 });
  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x6c8f4a, 0.75));
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.0);
  sun.position.set(-14, 26, 20);
  sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 22, bottom: -14, near: 2, far: 80 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 200);

  // ground, hills, road
  const ground = mesh(new THREE.CircleGeometry(140, 64), new THREE.MeshStandardMaterial({ map: grassTex(), roughness: 1 }), 0, 0, 0, -Math.PI / 2);
  scene.add(ground);
  for (const [x, z, sx, sy, sz, c] of [[-26, -34, 34, 9, 14, 0x7cc191], [28, -36, 38, 10, 14, 0x7cc191], [0, -46, 52, 8, 14, 0x8acb98], [-48, -50, 30, 12, 12, 0x86c79a], [50, -52, 30, 11, 12, 0x86c79a]]) {
    const hill = mesh(sph(1, 40, 20), mat(c, { roughness: 1 }), x, -1, z);
    hill.scale.set(sx, sy, sz);
    hill.castShadow = false;
    scene.add(hill);
  }
  const roadShape = new THREE.Shape([new THREE.Vector2(-1.7, -3.8), new THREE.Vector2(1.7, -3.8), new THREE.Vector2(7, -40), new THREE.Vector2(-7, -40)]);
  const road = mesh(new THREE.ShapeGeometry(roadShape), mat(0xcdb98e, { roughness: 1 }), 0, 0.02, 0, -Math.PI / 2);
  road.castShadow = false;
  scene.add(road);
  for (let z = 6; z < 34; z += 4.5) scene.add(mesh(rbox(0.28, 0.05, 1.8, 0.02), 0xf1e7cf, 0, 0.04, z));

  const taps = []; // { root, tap(anim) }
  const school = buildSchool(taps);
  scene.add(school.group);

  // trees, bushes, flowers and grass (edge items are re-placed on resize)
  const trees = [buildTree(), buildTree()];
  trees.forEach((t, i) => {
    t.group.scale.setScalar(i ? 1.15 : 1.05);
    scene.add(t.group);
    taps.push({ root: t.group, tap: t.tap });
  });
  for (const [x, z, s] of [[-11.6, 1.6, 1.1], [11.8, 1.4, 1.2], [-4.6, 2.9, 0.55], [4.6, 2.9, 0.55]]) {
    const b = buildBush(s);
    b.position.set(x, 0, z);
    scene.add(b);
  }
  const flowerSpots = [[-7.5, 7], [-6.6, 8.6], [7.2, 7.4], [8.3, 9.1], [-10.5, 11], [10.8, 12], [-3.8, 12.5], [4.2, 13.2]];
  flowerSpots.forEach(([x, z], i) => {
    const f = buildFlower(i);
    f.group.position.set(x, 0, z);
    scene.add(f.group);
    taps.push({ root: f.root, tap: f.tap });
  });
  for (const [x, z] of [[-9, 9.5], [9.5, 10.5], [-5.5, 15], [6.2, 15.5], [-13, 6], [13.5, 7], [-2.5, 9], [2.8, 8]]) {
    const tf = buildTuft();
    tf.position.set(x, 0, z);
    tf.rotation.y = x * 0.3;
    scene.add(tf);
  }

  // sky: sun, clouds, birds (placed in screen space on resize)
  const sunObj = buildSun();
  scene.add(sunObj.group);
  taps.push({ root: sunObj.root, tap: sunObj.tap });
  const clouds = [
    { c: buildCloud(), nx: -0.68, ny: 0.72, d: 48, s: 1.3 },
    { c: buildCloud(), nx: 0.38, ny: 0.8, d: 52, s: 1.05 },
    { c: buildCloud(), nx: -0.12, ny: 0.98, d: 56, s: 0.85 },
  ];
  for (const cl of clouds) {
    cl.c.group.scale.setScalar(cl.s);
    scene.add(cl.c.group);
    taps.push({ root: cl.c.root, tap: cl.c.tap });
  }
  const birds = [
    { b: buildBird(0xffb84d), y: 11.5, z: -4, speed: 2.4, off: 0 },
    { b: buildBird(0x8fd3ff), y: 9.8, z: -8, speed: -1.8, off: 22 },
  ];
  for (const bd of birds) {
    bd.b.group.scale.setScalar(bd.speed > 0 ? 1 : -1);
    bd.b.group.scale.y = 1;
    bd.b.group.scale.z = 1;
    scene.add(bd.b.group);
    taps.push({ root: bd.b.root, tap: bd.b.tap });
  }
  for (const t of taps) t.root.traverse((o) => (o.userData.tapRoot = t));

  // ---------------------------------------------------------- tweens + loop
  const tweens = [];
  const anim = (ms, step, done) => {
    tweens.push({ ms, t: 0, step, done });
    start();
  };
  let raf = 0, last = 0, t = 0, isSoft = soft;
  function frame(now) {
    raf = 0;
    if (document.hidden || isSoft) return;
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 2) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t = Math.min(tw.ms, tw.t + dt * 1000);
      tw.step(tw.t / tw.ms);
      if (tw.t >= tw.ms) { tweens.splice(i, 1); tw.done && tw.done(); }
    }
    animate(dt);
    renderer.render(scene, camera);
  }
  function animate(dt) {
    school.wave(t);
    sunObj.update(t, dt);
    clouds.forEach((cl, i) => {
      cl.c.group.position.x = cl.base.x + Math.sin(t * 0.07 + i * 2) * 3;
    });
    const span = 70;
    for (const bd of birds) {
      const x = (((t * bd.speed + bd.off) % span) + span) % span - span / 2;
      bd.b.group.position.set(x, bd.y + Math.sin(t * 2 + bd.off) * 0.4, bd.z);
      bd.b.flap(t);
    }
  }
  function start() {
    if (!raf && !document.hidden && !isSoft) raf = requestAnimationFrame(frame);
  }
  const onVis = () => { last = 0; start(); };
  document.addEventListener("visibilitychange", onVis);

  // ---------------------------------------------------------- layout
  const tmp = new THREE.Vector3();
  function placeAt(obj, nx, ny, dist) {
    tmp.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
    obj.position.copy(camera.position).addScaledVector(tmp, dist);
    obj.quaternion.copy(camera.quaternion); // face the camera
  }
  function halfWidthAt(z) {
    const d = camera.position.z - z;
    return Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d * camera.aspect;
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // narrow / portrait screens: step back so the whole school fits
    const f = Math.max(1, 1.5 / camera.aspect);
    camera.position.copy(CAM_TARGET).add(CAM_POS.clone().sub(CAM_TARGET).multiplyScalar(f));
    camera.lookAt(CAM_TARGET);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    placeAt(sunObj.group, 0.76, 0.74, 58);
    for (const cl of clouds) {
      placeAt(cl.c.group, cl.nx, cl.ny, cl.d);
      cl.base = cl.c.group.position.clone();
    }
    trees.forEach((tr, i) => {
      const z = 2.5;
      const x = Math.min(17, Math.max(12.5, halfWidthAt(z) * 0.8));
      tr.group.position.set(i ? x : -x, 0, z);
    });
    animate(0);
    renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  start();

  // ---------------------------------------------------------- taps
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const roots = taps.map((x) => x.root);
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hitObj = ray.intersectObjects(roots, true)[0];
    return hitObj ? hitObj.object.userData.tapRoot : null;
  }
  const onDown = (e) => {
    if (isSoft) return;
    const target = pick(e);
    if (target) target.tap(anim);
  };
  let hoverPending = false;
  const onMove = (e) => {
    if (isSoft || hoverPending || e.pointerType !== "mouse") return;
    hoverPending = true;
    requestAnimationFrame(() => {
      hoverPending = false;
      canvas.style.cursor = pick(e) ? "pointer" : "";
    });
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);

  return {
    setSoft(v) {
      isSoft = v;
      canvas.style.cursor = "";
      if (!v) { last = 0; start(); }
      else renderer.render(scene, camera);
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        o.geometry && o.geometry.dispose();
        if (o.material && o.material.map) o.material.map.dispose();
      });
      sky.dispose();
      disposeLook();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

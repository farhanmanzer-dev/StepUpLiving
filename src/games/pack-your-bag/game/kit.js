// Small helpers for building low-poly scenes from primitives.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ---------------------------------------------------------------- "toy" look
// Soft, smooth-lit materials (like painted toys / Sims-style furniture):
// physically based shading + an environment light + soft shadows.
// Materials are cached by colour so many meshes share one material.
const matCache = new Map();
export function mat(color, opts) {
  const key = opts ? `${color}-${JSON.stringify(opts)}` : color;
  if (!matCache.has(key))
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...opts }));
  return matCache.get(key);
}

/**
 * Renderer + scene setup for the soft toy look: filmic tone mapping, a
 * blurred "studio room" environment for gentle bounce light and (optionally)
 * soft real-time shadows. Returns a dispose function.
 */
export function setupLook(renderer, scene, { shadows = false, envIntensity = 0.55 } = {}) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.traverse((o) => o.geometry && o.geometry.dispose());
  pmrem.dispose();
  scene.environment = env;
  scene.environmentIntensity = envIntensity;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  return () => env.dispose();
}

// Outlines are off in the toy look (kept so older call sites still work).
export const STYLE = { outlines: false };

// Ink outlines ("inverted hull"): a copy of each mesh, pushed out along its
// normals and drawn back-faces only in a dark colour. Cheap and very anime.
const outlineCache = new Map();
function outlineMat(thickness, color) {
  const key = `${thickness}-${color}`;
  if (!outlineCache.has(key)) {
    outlineCache.set(key, new THREE.ShaderMaterial({
      uniforms: { thickness: { value: thickness }, color: { value: new THREE.Color(color) } },
      vertexShader: /* glsl */ `
        uniform float thickness;
        void main() {
          vec3 p = position + normal * thickness;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 color;
        void main() { gl_FragColor = linearToOutputTexel(vec4(color, 1.0)); }`,
      side: THREE.BackSide,
    }));
  }
  return outlineCache.get(key);
}
const noRaycast = () => {};
/** Adds ink outlines to every mesh under `root` (skips userData.noOutline). */
export function addOutlines(root, thickness = 0.03, color = 0x22203a) {
  if (!STYLE.outlines) return root;
  const list = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.noOutline && !o.userData.isOutline) list.push(o);
  });
  const m = outlineMat(thickness, color);
  for (const o of list) {
    const ol = new THREE.Mesh(o.geometry, m);
    ol.userData.isOutline = true;
    ol.userData.noOutline = true;
    ol.raycast = noRaycast;
    o.add(ol);
  }
  return root;
}

export function mesh(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, typeof color === "number" ? mat(color) : color);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  if (!m.material.isMeshBasicMaterial) m.castShadow = m.receiveShadow = true;
  return m;
}

// boxes get softly bevelled edges: nothing in a toy box has sharp corners
export const box = (w, h, d) => new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.22);
export const rbox = (w, h, d, r = Math.min(w, h, d) * 0.22) => new RoundedBoxGeometry(w, h, d, 3, r);
export const cyl = (rt, rb, h, s = 24) => new THREE.CylinderGeometry(rt, rb, h, s);
export const sph = (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h);

// Soft round "blob" contact shadow (adds grounding under the real shadows).
let blobMat = null;
function getBlobMat() {
  if (blobMat) return blobMat;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grd.addColorStop(0, "rgba(40,25,10,0.28)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
  return blobMat;
}
export function blob(size) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), getBlobMat());
  m.rotation.x = -Math.PI / 2;
  m.userData.noOutline = true;
  return m;
}

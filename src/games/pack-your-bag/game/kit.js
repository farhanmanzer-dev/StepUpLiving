// Small helpers for building low-poly scenes from primitives.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// ---------------------------------------------------------------- anime look
// Cel shading: a 3-step light ramp gives flat "anime" bands of light/shadow.
let toonRamp = null;
function getToonRamp() {
  if (!toonRamp) {
    toonRamp = new THREE.DataTexture(new Uint8Array([140, 205, 255]), 3, 1, THREE.RedFormat);
    toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter;
    toonRamp.generateMipmaps = false;
    toonRamp.needsUpdate = true;
  }
  return toonRamp;
}

// Toon materials are cached by colour so many meshes share one material.
const matCache = new Map();
export function mat(color) {
  if (!matCache.has(color)) matCache.set(color, new THREE.MeshToonMaterial({ color, gradientMap: getToonRamp() }));
  return matCache.get(color);
}

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
  return m;
}

export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r);
export const cyl = (rt, rb, h, s = 16) => new THREE.CylinderGeometry(rt, rb, h, s);
export const sph = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);

// Soft round "blob" shadow (replaces expensive real-time shadow maps).
let blobMat = null;
function getBlobMat() {
  if (blobMat) return blobMat;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grd.addColorStop(0, "rgba(0,0,0,0.38)");
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

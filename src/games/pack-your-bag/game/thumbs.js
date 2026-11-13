// Renders the real 3D bag models into PNG images for the menu (level cards),
// so menus and game share the same soft "toy" look. One short-lived WebGL
// context renders all images, then is released. Results are cached.
import * as THREE from "three";
import { setupLook, blob } from "./kit.js";
import { buildBackpack, buildLunchBag } from "./backpack.js";
import { BUILD } from "./items.js";

const SIZE = 360;

// item names that peek out of the open bags
const VARIANTS = {
  backpack: { bag: "school" },
  backpackOpen: { bag: "school", open: true, items: ["Book", "Water bottle", "Pencil"] },
  lunchBag: { bag: "lunch" },
  lunchBagFull: { bag: "lunch", open: true, items: ["Apple", "Juice box", "Banana"] },
};

function buildVariant({ bag, open, items = [] }) {
  const model = bag === "school" ? buildBackpack() : buildLunchBag();
  const root = new THREE.Group();
  root.add(model.body);
  if (open) {
    model.hinge.rotation.x = -2.2;
    model.face.setMood("happy");
    const top = model.size.h;
    items.forEach((name, i) => {
      const it = BUILD[name]();
      it.scale.setScalar(0.85);
      it.position.set((i - 1) * 0.85, top - 0.55 + (i === 1 ? 0.25 : 0), 0.1);
      it.rotation.z = (i - 1) * -0.35;
      if (name === "Book" || name === "Pencil") it.rotation.x = -1.1;
      root.add(it);
    });
  }
  const shadow = blob(model.size.w + 2.4);
  shadow.position.y = 0.01;
  root.add(shadow);
  root.rotation.y = -0.38;
  return root;
}

let cache = null;

/** Promise<{ [artName]: dataURL }> (empty object if 3D is unavailable). */
export function getBagThumbs() {
  if (cache) return cache;
  cache = new Promise((resolve) => {
    // let the menu paint first
    setTimeout(() => {
      const out = {};
      let renderer;
      try {
        const canvas = document.createElement("canvas");
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setPixelRatio(1);
        renderer.setSize(SIZE, SIZE, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const scene = new THREE.Scene();
        const disposeLook = setupLook(renderer, scene, { envIntensity: 0.6 });
        scene.add(new THREE.HemisphereLight(0xfff6e8, 0x9a8a78, 0.9));
        const sun = new THREE.DirectionalLight(0xfff0dc, 2.2);
        sun.position.set(-4, 8, 7);
        scene.add(sun);
        const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 80);

        for (const [name, v] of Object.entries(VARIANTS)) {
          const root = buildVariant(v);
          scene.add(root);
          // frame the model: fit its bounding sphere in view
          const sphere = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
          const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.98;
          camera.position.set(sphere.center.x, sphere.center.y + dist * 0.28, sphere.center.z + dist * 0.96);
          camera.lookAt(sphere.center);
          renderer.render(scene, camera);
          out[name] = canvas.toDataURL("image/png");
          scene.remove(root);
          root.traverse((o) => o.geometry && o.geometry.dispose());
        }
        disposeLook();
      } catch (e) {
        console.warn("Bag thumbnails unavailable:", e);
      } finally {
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
        }
      }
      resolve(out);
    }, 60);
  });
  return cache;
}

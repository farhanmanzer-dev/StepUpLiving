import { useEffect, useRef, useState } from "react";

// Loads the Three.js hero scene after first paint (keeps the page fast),
// and pauses it whenever it is scrolled out of view.
export default function HeroCanvas() {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let scene = null;
    let cancelled = false;
    let io = null;
    const canvas = document.createElement("canvas");
    canvas.className = "sl-hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hostRef.current.appendChild(canvas);

    import("../hero/stepsScene.js")
      .then(({ createStepsScene }) => {
        if (cancelled) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        scene = createStepsScene(canvas, { reducedMotion });
        io = new IntersectionObserver(([entry]) => scene.setActive(entry.isIntersecting), { threshold: 0.05 });
        io.observe(canvas);
        setReady(true);
      })
      .catch((e) => {
        console.warn("3D hero unavailable:", e);
        setFailed(true);
      });

    return () => {
      cancelled = true;
      io?.disconnect();
      scene?.destroy();
      canvas.remove();
    };
  }, []);

  return (
    <div className={`sl-hero-art ${ready ? "is-ready" : ""} ${failed ? "is-failed" : ""}`}>
      <div className="sl-hero-blob" aria-hidden="true" />
      <div ref={hostRef} className="sl-hero-canvas-host" />
      {/* simple fallback if WebGL is not available */}
      {failed && <div className="sl-hero-fallback" aria-hidden="true">🎒🍽️🧺🩹🍳🏠</div>}
    </div>
  );
}

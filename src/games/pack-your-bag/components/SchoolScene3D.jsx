import { useEffect, useRef, useState } from "react";
import { createSchoolScene } from "../game/schoolScene.js";
import OutdoorScene from "./OutdoorScene.jsx";

// The 3D school yard behind the menu screens (same toy look as the game room).
// It stays mounted across title -> objectives -> levels; `soft` blurs it and
// freezes it to one frame behind dialogs. Falls back to the 2D drawing.
export default function SchoolScene3D({ soft = false }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const softRef = useRef(soft);
  softRef.current = soft;

  useEffect(() => {
    if (failed) return undefined;
    const canvas = document.createElement("canvas");
    canvas.className = "yard-canvas";
    hostRef.current.appendChild(canvas);
    let s;
    try {
      s = createSchoolScene(canvas, { soft: softRef.current });
    } catch (e) {
      console.warn("3D school yard unavailable, using the 2D one:", e);
      canvas.remove();
      setFailed(true);
      return undefined;
    }
    sceneRef.current = s;
    return () => {
      s.destroy();
      canvas.remove();
      sceneRef.current = null;
    };
  }, [failed]);

  useEffect(() => {
    sceneRef.current?.setSoft(soft);
  }, [soft]);

  if (failed) return <OutdoorScene soft={soft} interactive={!soft} />;
  return <div ref={hostRef} className={`outdoor yard3d ${soft ? "soft" : ""}`} aria-hidden="true" />;
}

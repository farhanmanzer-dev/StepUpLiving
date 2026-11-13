import { useEffect, useRef, useState } from "react";
import { createMascot } from "../game/mascotScene.js";
import { beep, speak } from "../game/audio.js";

const LINES = ["Hi! Let's pack!", "Tap play!", "I love school!", "Yay!"];

// The 3D anime backpack mascot, with a speech bubble. Tap it to say hi.
export default function BackpackMascot(props) {
  // Small screens: skip the extra 3D view entirely (saves the GPU on phones).
  const [wide] = useState(() => !props.minWidth || window.innerWidth >= props.minWidth);
  return wide ? <Mascot {...props} /> : null;
}

function Mascot({ greeting = "Hi! Let's pack!", className = "" }) {
  const hostRef = useRef(null);
  const [line, setLine] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "mascot-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hostRef.current.appendChild(canvas);
    let n = 0;
    let mascot;
    try {
      mascot = createMascot(canvas, {
        onPoke: () => {
          const text = n === 0 ? greeting : LINES[n % LINES.length];
          n++;
          beep([660, 990], 160, 0.12, "triangle");
          speak(text);
          setLine({ text, id: performance.now() });
        },
      });
    } catch (e) {
      console.warn("Mascot unavailable:", e);
      canvas.remove();
      setFailed(true);
      return undefined;
    }
    // say hello on its own shortly after the screen opens
    const hello = setTimeout(() => setLine({ text: greeting, id: performance.now() }), 900);
    return () => {
      clearTimeout(hello);
      mascot.destroy();
      canvas.remove();
    };
  }, [greeting]);

  // hide the bubble after a while
  useEffect(() => {
    if (!line) return undefined;
    const id = setTimeout(() => setLine(null), 2600);
    return () => clearTimeout(id);
  }, [line]);

  if (failed) return null;
  return (
    <div className={`mascot ${className}`}>
      <div ref={hostRef} className="mascot-host" title="Tap me!" />
      {line && (
        <div key={line.id} className="mascot-bubble">
          {line.text}
        </div>
      )}
    </div>
  );
}

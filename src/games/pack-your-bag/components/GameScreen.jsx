import { useEffect, useRef, useState } from "react";
import { createGame } from "../game/engine.js";
import { click } from "../game/audio.js";
import Hud from "./Hud.jsx";
import SpeechBubble from "./SpeechBubble.jsx";
import ItemLabel from "./ItemLabel.jsx";
import HintHand from "./HintHand.jsx";
import ResultModal from "./ResultModal.jsx";

// Mounts the Three.js engine for one level. The parent remounts this
// component (via `key`) to switch levels, so each level gets a fresh engine.
export default function GameScreen({ level, hasNext, onHome, onNext, onResult, onSettings }) {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const [noGL, setNoGL] = useState(false);
  const [hud, setHud] = useState({ left: 4, total: 4, collected: [] });
  const [bubble, setBubble] = useState(null);
  const [label, setLabel] = useState(null);
  const [hint, setHint] = useState(null);
  const [result, setResult] = useState(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    // We create the canvas ourselves so React StrictMode's double mount
    // always gets a clean WebGL context.
    const canvas = document.createElement("canvas");
    canvas.className = "scene";
    hostRef.current.appendChild(canvas);
    let game;
    try {
      game = createGame(
        canvas,
        {
          onHud: setHud,
          onSay: (text, ms) => setBubble({ text, ms, id: performance.now() }),
          onLabel: setLabel,
          onHint: setHint,
          onFinish: (r) => {
            setResult(r);
            onResultRef.current(r);
          },
        },
        level
      );
    } catch (e) {
      console.error(e);
      canvas.remove();
      setNoGL(true);
      return undefined;
    }
    gameRef.current = game;
    return () => {
      game.destroy();
      canvas.remove();
      gameRef.current = null;
    };
  }, [level]);

  const replay = () => {
    click();
    setResult(null);
    gameRef.current?.restart();
  };

  if (noGL) {
    return (
      <div className="screen frosted">
        <div className="panel pop-in">
          <div className="panel-head"><h2>3D is not available</h2></div>
          <div className="panel-body center">
            <div className="big-emoji">😢</div>
            <p>This computer or browser can't show 3D graphics. Please try Chrome, Edge or Firefox, or turn on hardware acceleration.</p>
            <div className="panel-actions"><button className="btn btn-blue" onClick={onHome}>Back</button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div ref={hostRef} className="scene-host" />
      <Hud
        level={level}
        hud={hud}
        playing={!result}
        getTimeMs={() => gameRef.current?.getTimeMs() ?? 0}
        onHome={() => { click(); onHome(); }}
        onHelp={() => { click(); gameRef.current?.help(); }}
        onSettings={() => { click(); onSettings(); }}
      />
      {!result && label && <ItemLabel label={label} />}
      {!result && hint && !label && <HintHand hint={hint} />}
      <SpeechBubble bubble={bubble} />
      {result && (
        <ResultModal
          result={result}
          hasNext={hasNext}
          onAgain={replay}
          onLevels={() => { click(); onHome(); }}
          onNext={() => { click(); onNext(); }}
        />
      )}
    </div>
  );
}

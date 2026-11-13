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
  // error: null | { kind: "webgl" | "crash", message }
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [hud, setHud] = useState({ left: 4, total: 4, collected: [] });
  const [bubble, setBubble] = useState(null);
  const [label, setLabel] = useState(null);
  const [hint, setHint] = useState(null);
  const [result, setResult] = useState(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (error) return undefined;
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
      console.error("[Pack Your Bag] could not start the level:", e);
      canvas.remove();
      // First failure: retry once quietly. A 3D view that just closed (menu
      // mascot, landing hero) may still be giving the GPU back.
      if (attempt === 0) {
        const id = setTimeout(() => setAttempt(1), 400);
        return () => clearTimeout(id);
      }
      setError({ kind: e?.code === "NO_WEBGL" ? "webgl" : "crash", message: String(e?.message || e) });
      return undefined;
    }
    gameRef.current = game;
    return () => {
      game.destroy();
      canvas.remove();
      gameRef.current = null;
    };
  }, [level, attempt, error]);

  const replay = () => {
    click();
    setResult(null);
    gameRef.current?.restart();
  };

  const retry = () => {
    click();
    setError(null);
    setAttempt((a) => a + 1);
  };

  if (error) {
    const webgl = error.kind === "webgl";
    return (
      <div className="screen frosted">
        <div className="panel pop-in">
          <div className="panel-head"><h2>{webgl ? "3D needs a moment" : "Oops! Something went wrong"}</h2></div>
          <div className="panel-body center">
            <div className="big-emoji">{webgl ? "🎒" : "🙈"}</div>
            {webgl ? (
              <p>
                The 3D view could not start. This can happen when many 3D tabs are open or the
                graphics card was busy. Press <b>Try again</b>.
              </p>
            ) : (
              <p>The level could not start. Press <b>Try again</b> or reload the page.</p>
            )}
            {webgl && (
              <p className="error-tip">
                Still not working? Close other tabs, and in Chrome or Edge turn on
                <i> Settings → System → Use graphics acceleration when available</i>, then restart the browser.
              </p>
            )}
            <details className="error-details">
              <summary>Details for teachers</summary>
              <code>{error.message}</code>
            </details>
            <div className="panel-actions error-actions">
              <button className="btn btn-green" onClick={onHome}>Back</button>
              <button className="btn btn-blue" onClick={() => window.location.reload()}>Reload page</button>
              <button className="btn btn-orange" onClick={retry} autoFocus>Try again</button>
            </div>
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

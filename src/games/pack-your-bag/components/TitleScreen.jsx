import { useEffect, useMemo, useRef, useState } from "react";
import BackpackMascot from "./BackpackMascot.jsx";
import { beep, fanfare, speak, unlockAudio } from "../game/audio.js";
import { poke } from "../game/fx.js";

const WORDS = [
  { text: "PACK", cls: "w-green", start: 0 },
  { text: "YOUR", cls: "w-blue", start: 4 },
  { text: "BAG", cls: "w-purple", start: 8 },
];

// each title letter plays a note of a happy scale when tapped
const NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093];

// school things floating in bubbles: pop them to pack the bag
const ITEMS = [
  { emoji: "📚", name: "Books", x: 8, y: 24 },
  { emoji: "✏️", name: "Pencil", x: 20, y: 46 },
  { emoji: "🍎", name: "Apple", x: 7, y: 66 },
  { emoji: "🖍️", name: "Crayons", x: 91, y: 38 },
  { emoji: "🥪", name: "Lunch", x: 85, y: 66 },
];

const CONFETTI = ["#ff6b6b", "#ffd23f", "#5cc0ea", "#7ddc6f", "#c58cf0", "#ff9f43"];

// a burst of little stars wherever the child taps
function TapSparkles() {
  const [bursts, setBursts] = useState([]);
  useEffect(() => {
    const onDown = (e) => {
      const id = performance.now() + Math.random();
      setBursts((b) => [...b.slice(-5), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 750);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return (
    <div className="tap-sparkles" aria-hidden="true">
      {bursts.map((b) => (
        <div key={b.id} className="tap-burst" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ "--a": `${i * 45}deg`, "--c": CONFETTI[i % CONFETTI.length] }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2 + Math.random() * 1.5,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 200,
        color: CONFETTI[i % CONFETTI.length],
        round: i % 3 === 0,
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            left: `${b.left}%`,
            background: b.color,
            borderRadius: b.round ? "50%" : "2px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            "--rot": `${b.rot}deg`,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function TitleScreen({ onPlay }) {
  const [popped, setPopped] = useState([]); // bubbles already popped
  const [packed, setPacked] = useState([]); // { slot, emoji } landed in the tray
  const [flyers, setFlyers] = useState([]); // items flying into the tray
  const [say, setSay] = useState(null);
  const [round, setRound] = useState(0);
  const slotRefs = useRef([]);
  const count = useRef(0);
  const done = packed.length === ITEMS.length;

  // browsers only allow sound after a tap: unlock it on the first one
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerup", unlock);
    return () => window.removeEventListener("pointerup", unlock);
  }, []);

  const popBubble = (i, e) => {
    if (popped.includes(i)) return;
    const item = ITEMS[i];
    const slot = count.current++;
    const r = e.currentTarget.getBoundingClientRect();
    const s = slotRefs.current[slot]?.getBoundingClientRect() || r;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    setPopped((p) => [...p, i]);
    setFlyers((f) => [
      ...f,
      { id: `${round}-${i}`, slot, emoji: item.emoji, x, y, dx: s.left + s.width / 2 - x, dy: s.top + s.height / 2 - y },
    ]);
    beep([880, 1320], 110, 0.14, "sine");
    speak(item.name);
    setSay({ text: `${item.name}! ✨`, id: performance.now() });
  };

  const land = (f) => {
    setFlyers((all) => all.filter((x) => x.id !== f.id));
    setPacked((p) => [...p, { slot: f.slot, emoji: f.emoji }]);
    beep([660, 990], 120, 0.1, "triangle");
  };

  // everything packed: cheer, then start a new round a little later
  useEffect(() => {
    if (!done) return undefined;
    fanfare();
    speak("Yay! My bag is ready! Tap play!");
    setSay({ text: "Yay! My bag is ready!", id: performance.now() });
    const id = setTimeout(() => {
      count.current = 0;
      setPopped([]);
      setPacked([]);
      setRound((r) => r + 1);
    }, 7000);
    return () => clearTimeout(id);
  }, [done]);

  const tapLetter = (e, n) => {
    poke(e.currentTarget, "boing", 280);
    beep([NOTES[n % NOTES.length]], 240, 0.14, "triangle");
  };

  return (
    <div className="screen title-screen">
      <TapSparkles />
      {done && <Confetti key={round} />}

      {/* floating bubbles with school things inside */}
      <div className="bubble-layer">
        {ITEMS.map((it, i) =>
          popped.includes(i) ? null : (
            <button
              key={`${round}-${i}`}
              className="item-bubble"
              style={{ left: `${it.x}%`, top: `${it.y}%`, "--d": `${i * -0.7}s`, "--in": `${0.6 + i * 0.15}s` }}
              onClick={(e) => popBubble(i, e)}
              aria-label={`Pack the ${it.name}`}
            >
              <span className="item-emoji" aria-hidden="true">{it.emoji}</span>
            </button>
          )
        )}
        {popped.length === 0 && (
          <span className="bubble-hint" style={{ left: `${ITEMS[0].x}%`, top: `${ITEMS[0].y}%` }} aria-hidden="true">
            👆
          </span>
        )}
      </div>

      {flyers.map((f) => (
        <span
          key={f.id}
          className="item-flyer"
          style={{ left: f.x, top: f.y, "--dx": `${f.dx}px`, "--dy": `${f.dy}px` }}
          onAnimationEnd={() => land(f)}
          aria-hidden="true"
        >
          {f.emoji}
        </span>
      ))}

      <div className="title-stage">
        <BackpackMascot className="mascot-title" greeting="Hi! Pop the bubbles!" say={say} />
        <div className="title-burst" aria-hidden="true" />

        <div className={`pack-tray ${done ? "full" : ""}`} aria-live="polite">
          <span className="pack-tray-bag" aria-hidden="true">🎒</span>
          <span className="pack-tray-slots">
            {ITEMS.map((_, k) => {
              const got = packed.find((p) => p.slot === k);
              return (
                <span key={k} ref={(el) => (slotRefs.current[k] = el)} className={`pack-slot ${got ? "on" : ""}`}>
                  {got ? got.emoji : ""}
                </span>
              );
            })}
          </span>
          <span className="sr-only">{packed.length} of {ITEMS.length} packed</span>
        </div>

        <div className="title-card pop-in">
          <div className="title-pattern" aria-hidden="true" />
          <span className="card-sparkle s1" aria-hidden="true">✦</span>
          <span className="card-sparkle s2" aria-hidden="true">✦</span>
          <span className="card-sparkle s3" aria-hidden="true">✦</span>
          <h1 className="game-title" aria-label="Pack your bag">
            {WORDS.map((w) => (
              <span key={w.text} className={`word ${w.cls}`} aria-hidden="true">
                {[...w.text].map((ch, i) => (
                  <span
                    key={i}
                    className="letter"
                    style={{ animationDelay: `${0.35 + (w.start + i) * 0.06}s, ${(w.start + i) * 0.12}s` }}
                    onPointerDown={(e) => tapLetter(e, w.start + i)}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <button className={`btn btn-orange btn-play ${done ? "ready" : ""}`} onClick={onPlay} autoFocus>
            <span className="btn-play-shine" aria-hidden="true" />
            PLAY
          </button>
          <p className="title-tip">{done ? "Your bag is ready! Tap PLAY!" : "Tap the bubbles, the sun, the trees… everything!"}</p>
        </div>
      </div>
    </div>
  );
}

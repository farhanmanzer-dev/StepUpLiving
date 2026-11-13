import { useEffect, useState } from "react";
import { EMOJI } from "../game/items.js";
import IconButton from "./IconButton.jsx";

const fmt = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function Hud({ level, hud, playing, getTimeMs, onHome, onHelp, onSettings }) {
  const [time, setTime] = useState("0:00");

  useEffect(() => {
    setTime(fmt(getTimeMs()));
    if (!playing) return undefined;
    const id = setInterval(() => setTime(fmt(getTimeMs())), 500);
    return () => clearInterval(id);
    // getTimeMs reads from the engine; re-run only when play state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const slots = Array.from({ length: hud.total }, (_, i) => hud.collected[i]);
  const verb = level.mode === "identify" ? "Find" : "Pack";

  return (
    <header className="hud">
      <div className="hud-left">
        <IconButton icon="home" label="Levels" onClick={onHome} color="green" />
        <div className="hud-info">
          <div className="pill pill-level">Level {level.id}</div>
          <div className="pill pill-time" aria-label="time">⏱ {time}</div>
        </div>
      </div>

      <div className="tray" aria-label={`${hud.collected.length} of ${hud.total} done`}>
        <span className="tray-title">{verb} {hud.total} things</span>
        <div className="tray-slots">
          {slots.map((name, i) => (
            <div key={i + (name || "")} className={`slot ${name ? "filled" : ""}`} title={name || ""}>
              {name ? EMOJI[name] : <span className="slot-num">{i + 1}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="hud-right">
        <IconButton icon="bulb" label="Help me" onClick={onHelp} color="yellow" disabled={!playing} />
        <IconButton icon="gear" label="Settings" onClick={onSettings} color="blue" />
      </div>
    </header>
  );
}

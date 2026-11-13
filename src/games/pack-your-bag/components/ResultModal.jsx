import { useMemo } from "react";

const TITLES = ["", "Good try!", "Great job!", "Excellent!"];
const SUBTITLES = ["", "You did it! Try again for more stars.", "Well done! Almost perfect.", "Perfect! You got everything right."];
const CONFETTI_COLS = ["#ff6b6b", "#ffd23f", "#5cc0ea", "#7ddc6f", "#c58cf0", "#ff9f43"];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Confetti({ count }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.6,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        color: CONFETTI_COLS[i % CONFETTI_COLS.length],
        round: i % 3 === 0,
      })),
    [count]
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

export default function ResultModal({ result, hasNext, onAgain, onLevels, onNext }) {
  const { stars, accuracy, timeSeconds, correct, wrong } = result;
  return (
    <div className="overlay dim">
      <Confetti count={stars * 22} />
      <div className="result-card pop-in" role="dialog" aria-label="Level finished">
        <div className="stars" aria-label={`${stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? "on" : ""} style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
              ★
            </span>
          ))}
        </div>
        <h2 className="result-title">{TITLES[stars]}</h2>
        <p className="subtitle">{SUBTITLES[stars]}</p>
        <div className="stats">
          <div className="stat"><b>{accuracy}%</b><small>🎯 Right</small></div>
          <div className="stat"><b>{fmt(timeSeconds)}</b><small>⏱ Time</small></div>
          <div className="stat good"><b>{correct}</b><small>✅ Correct</small></div>
          <div className="stat bad"><b>{wrong}</b><small>🙈 Oops</small></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-green" onClick={onAgain}>↻ Replay</button>
          <button className="btn btn-blue" onClick={onLevels}>☰ Levels</button>
          {hasNext && (
            <button className="btn btn-orange" onClick={onNext} autoFocus>
              Next ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { LEVELS } from "../levels.js";
import BagArt from "./BagArt.jsx";
import BackpackMascot from "./BackpackMascot.jsx";

function Stars({ count }) {
  return (
    <div className="badge-stars" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "on" : ""}>★</span>
      ))}
    </div>
  );
}

export default function LevelSelect({ stars, onPick }) {
  return (
    <div className="screen level-screen">
      <BackpackMascot className="mascot-corner" minWidth={1100} greeting="Pick a level!" />
      <h1 className="screen-title">Level Selection</h1>
      <div className="levels">
        {LEVELS.map((lv, i) => (
          <button
            key={lv.id}
            className={`level-card theme-${lv.theme}`}
            onClick={() => onPick(lv)}
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            <Stars count={stars[lv.id] || 0} />
            <span className="badge">
              <span className="badge-rays" aria-hidden="true" />
              <BagArt name={lv.art} />
            </span>
            <span className="level-name">{lv.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

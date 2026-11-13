import { useEffect, useState } from "react";
import { LEVELS } from "../levels.js";
import BagArt from "./BagArt.jsx";
import BackpackMascot from "./BackpackMascot.jsx";
import { getBagThumbs } from "../game/thumbs.js";

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
  // real 3D renders of the bags (falls back to the flat drawings)
  const [thumbs, setThumbs] = useState({});
  useEffect(() => {
    let alive = true;
    getBagThumbs().then((t) => alive && setThumbs(t));
    return () => { alive = false; };
  }, []);

  return (
    <div className="screen level-screen">
      <BackpackMascot className="mascot-corner" minWidth={1100} greeting="Pick a level!" />
      <h1 className="screen-title">Choose a Level</h1>
      <div className="levels">
        {LEVELS.map((lv, i) => (
          <button
            key={lv.id}
            className={`level-card theme-${lv.theme}`}
            onClick={() => onPick(lv)}
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            <span className="level-num" aria-hidden="true">{lv.id}</span>
            <Stars count={stars[lv.id] || 0} />
            <span className="badge">
              <span className="badge-rays" aria-hidden="true" />
              <span className="badge-floor" aria-hidden="true" />
              {thumbs[lv.art] ? (
                <img className="bag-render" src={thumbs[lv.art]} alt="" draggable="false" />
              ) : (
                <BagArt name={lv.art} />
              )}
            </span>
            <span className="level-name">{lv.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

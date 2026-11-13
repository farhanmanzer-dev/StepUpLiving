import BackpackMascot from "./BackpackMascot.jsx";

const WORDS = [
  { text: "PACK", cls: "w-green", start: 0 },
  { text: "YOUR", cls: "w-blue", start: 4 },
  { text: "BAG", cls: "w-purple", start: 8 },
];

export default function TitleScreen({ onPlay }) {
  return (
    <div className="screen title-screen">
      <div className="title-stage">
        <BackpackMascot className="mascot-title" greeting="Hi! Let's pack!" />
        <div className="title-card pop-in">
          <div className="title-pattern" aria-hidden="true" />
          <h1 className="game-title" aria-label="Pack your bag">
            {WORDS.map((w) => (
              <span key={w.text} className={`word ${w.cls}`} aria-hidden="true">
                {[...w.text].map((ch, i) => (
                  <span key={i} className="letter" style={{ animationDelay: `${0.35 + (w.start + i) * 0.06}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <button className="btn btn-orange btn-play" onClick={onPlay} autoFocus>
            PLAY
          </button>
        </div>
      </div>
    </div>
  );
}

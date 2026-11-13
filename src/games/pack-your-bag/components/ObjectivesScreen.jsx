import Panel from "./Panel.jsx";
import BackpackMascot from "./BackpackMascot.jsx";
import { OBJECTIVES } from "../levels.js";

const BULLETS = ["🎯", "🎒", "🧺", "✋", "⭐"];

export default function ObjectivesScreen({ onNext }) {
  return (
    <div className="screen frosted">
      <BackpackMascot className="mascot-corner" minWidth={1100} greeting="Let's learn together!" />
      <Panel title="Learning Objectives" icon="📜" action="Next ▶" onAction={onNext} className="objectives-panel">
        <ul className="objectives">
          {OBJECTIVES.map((o, i) => (
            <li key={o} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <span className="obj-icon" aria-hidden="true">{BULLETS[i]}</span>
              {o}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

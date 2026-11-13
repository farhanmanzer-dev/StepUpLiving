import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { CATEGORIES, GAMES } from "../games.js";
import GameCard from "./GameCard.jsx";

const TABS = [{ id: "all", short: "All games", icon: "✨" }, ...CATEGORIES];

function ComingSoonPanel({ cat }) {
  return (
    <motion.div
      className="sl-soon-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="sl-soon-icon" aria-hidden="true">{cat.icon}</span>
      <div>
        <h4>{cat.label} are on the way</h4>
        <p>{cat.blurb} New games will appear here as soon as they are ready.</p>
      </div>
    </motion.div>
  );
}

function CategorySection({ cat }) {
  const games = GAMES.filter((g) => g.category === cat.id);
  return (
    <section className="sl-cat" aria-labelledby={`cat-${cat.id}`}>
      <div className="sl-cat-head">
        <h3 id={`cat-${cat.id}`}>
          <span aria-hidden="true">{cat.icon}</span> {cat.label}
        </h3>
        <span className="sl-cat-count">{games.length ? `${games.length} games` : "Coming soon"}</span>
      </div>
      {games.length ? (
        <motion.div layout className="sl-grid">
          <AnimatePresence mode="popLayout">
            {games.map((g, i) => <GameCard key={g.id} game={g} index={i} />)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <ComingSoonPanel cat={cat} />
      )}
    </section>
  );
}

export default function GameLibrary() {
  const [tab, setTab] = useState("all");
  const shown = tab === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === tab);

  return (
    <div className="sl-library">
      <LayoutGroup>
        <div className="sl-tabs" role="tablist" aria-label="Game types">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`sl-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {tab === t.id && (
                <motion.span layoutId="sl-tab-pill" className="sl-tab-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
              )}
              <span className="sl-tab-label">
                <span aria-hidden="true">{t.icon}</span> {t.short}
              </span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {shown.map((c) => <CategorySection key={c.id} cat={c} />)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

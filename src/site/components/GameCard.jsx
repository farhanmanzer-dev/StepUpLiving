import { motion } from "framer-motion";
import { useNavigate } from "react-router";

function GameCover({ game }) {
  const { cover } = game;
  const words = game.title.split(" ");
  return (
    <div className="sl-cover" style={{ background: cover.bg }}>
      <h3 className="sl-cover-title" aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} style={{ color: cover.title[i % cover.title.length] }}>{w} </span>
        ))}
      </h3>
      <div className="sl-cover-art" aria-hidden="true">
        {cover.art.map((e, i) => (
          <span key={i} className={`sl-sticker s${i}`}>{e}</span>
        ))}
        {cover.wrong && (
          <span className="sl-sticker sl-sticker-wrong">
            {cover.wrong}
            <i>✕</i>
          </span>
        )}
      </div>
    </div>
  );
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" /></svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function GameCard({ game, index = 0 }) {
  const navigate = useNavigate();
  const live = !!game.route;

  return (
    <motion.article
      layout
      className={`sl-card ${live ? "" : "is-soon"}`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <div className="sl-card-media">
        <GameCover game={game} />
        <span className="sl-card-badge">{game.category.toUpperCase()}</span>
        {!live && <span className="sl-card-soon">Coming soon</span>}
        {live && game.levels && <span className="sl-card-levels">{game.levels} levels</span>}
      </div>
      <div className="sl-card-body">
        <h3 className="sl-card-title">{game.title}</h3>
        <p className="sl-card-skill">{game.skill}</p>
        {live ? (
          <motion.button className="sl-play" onClick={() => navigate(game.route)} whileTap={{ scale: 0.97 }}>
            <span className="sl-play-label"><PlayIcon /> Play now</span>
            <span className="sl-play-arrow"><ArrowIcon /></span>
          </motion.button>
        ) : (
          <button className="sl-play is-disabled" disabled aria-label={`${game.title} is coming soon`}>
            <span className="sl-play-label">Coming soon</span>
          </button>
        )}
      </div>
    </motion.article>
  );
}

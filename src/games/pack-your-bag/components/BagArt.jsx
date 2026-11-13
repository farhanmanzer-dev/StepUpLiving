// Flat illustrations of the four bags used on the Level Selection screen.
const ART = {
  // blue anime backpack (matches the 3D model): flap + strap + buckle + pocket
  backpack: (
    <g stroke="#22203a" strokeWidth="2.5" strokeLinejoin="round">
      <rect x="16" y="62" width="12" height="32" rx="5" fill="#4cb8f5" />
      <rect x="92" y="62" width="12" height="32" rx="5" fill="#4cb8f5" />
      <path d="M26 46 Q26 14 60 14 Q94 14 94 46 L94 92 Q94 106 80 106 L40 106 Q26 106 26 92Z" fill="#4cb8f5" />
      <path d="M25 46 Q25 12 60 12 Q95 12 95 46 L95 52 Q60 68 25 52Z" fill="#2e5077" />
      <rect x="55" y="6" width="10" height="50" rx="5" fill="#5677a3" />
      <rect x="53" y="38" width="14" height="14" rx="2" fill="none" stroke="#e8b130" strokeWidth="3" />
      <path d="M36 80 L84 80 Q84 98 60 98 Q36 98 36 80Z" fill="#2e5077" />
      <circle cx="60" cy="101" r="2.5" fill="#e8b130" strokeWidth="1.5" />
      <g stroke="none">
        <ellipse cx="49" cy="68" rx="4.5" ry="6" fill="#1b1f33" />
        <ellipse cx="71" cy="68" rx="4.5" ry="6" fill="#1b1f33" />
        <circle cx="47.5" cy="66" r="1.8" fill="#fff" />
        <circle cx="69.5" cy="66" r="1.8" fill="#fff" />
        <ellipse cx="41" cy="74" rx="4" ry="2" fill="#ff8fb1" />
        <ellipse cx="79" cy="74" rx="4" ry="2" fill="#ff8fb1" />
      </g>
      <path d="M57 75 Q60 78 63 75" fill="none" strokeWidth="2" />
    </g>
  ),
  backpackOpen: (
    <g stroke="#22203a" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M30 34 Q30 4 60 4 Q90 4 90 34Z" fill="#2e5077" />
      <rect x="36" y="18" width="13" height="34" rx="2" fill="#ffd23f" transform="rotate(-10 42 35)" />
      <rect x="51" y="14" width="13" height="38" rx="2" fill="#4cc26a" />
      <rect x="66" y="20" width="13" height="32" rx="2" fill="#ff7a59" transform="rotate(9 72 36)" />
      <rect x="16" y="66" width="12" height="30" rx="5" fill="#4cb8f5" />
      <rect x="92" y="66" width="12" height="30" rx="5" fill="#4cb8f5" />
      <path d="M26 46 Q26 38 34 38 L86 38 Q94 38 94 46 L94 94 Q94 108 80 108 L40 108 Q26 108 26 94Z" fill="#4cb8f5" />
      <path d="M36 84 L84 84 Q84 101 60 101 Q36 101 36 84Z" fill="#2e5077" />
      <g stroke="none">
        <path d="M44 64 Q49 57 54 64" fill="none" stroke="#1b1f33" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 64 Q71 57 76 64" fill="none" stroke="#1b1f33" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="41" cy="72" rx="4" ry="2" fill="#ff8fb1" />
        <ellipse cx="79" cy="72" rx="4" ry="2" fill="#ff8fb1" />
        <path d="M54 72 Q60 80 66 72Z" fill="#7a1f2b" />
      </g>
    </g>
  ),
  lunchBag: (
    <>
      <path d="M38 40 Q60 6 82 40" fill="none" stroke="#c96fa0" strokeWidth="7" strokeLinecap="round" />
      <rect x="22" y="38" width="76" height="66" rx="14" fill="#f6c6de" />
      <rect x="22" y="38" width="76" height="14" rx="7" fill="#e79cc3" />
      <rect x="32" y="62" width="56" height="34" rx="8" fill="#fff" opacity="0.75" />
      <rect x="32" y="62" width="56" height="34" rx="8" fill="none" stroke="#c96fa0" strokeWidth="3" />
      <rect x="8" y="50" width="16" height="50" rx="6" fill="#ffb31f" />
      <rect x="10" y="42" width="12" height="10" rx="3" fill="#3a6fb0" />
    </>
  ),
  lunchBagFull: (
    <>
      <circle cx="46" cy="36" r="13" fill="#e23a3a" />
      <path d="M46 24 L48 16" stroke="#6b4423" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="54" cy="18" rx="6" ry="3" fill="#4caf50" />
      <rect x="70" y="18" width="14" height="30" rx="4" fill="#ff9f2e" />
      <path d="M80 18 L86 6" stroke="#4db3ec" strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="40" width="80" height="66" rx="14" fill="#7d4fb3" />
      <rect x="20" y="40" width="80" height="12" rx="6" fill="#5e3590" />
      <rect x="30" y="64" width="60" height="32" rx="8" fill="#a37bd6" />
      <path d="M74 70 l3.5 7 7.7 1.1 -5.6 5.4 1.3 7.6 -6.9 -3.6 -6.9 3.6 1.3 -7.6 -5.6 -5.4 7.7 -1.1Z" fill="#ffd23f" />
      <rect x="104" y="54" width="12" height="44" rx="5" fill="#ffb31f" />
      <rect x="106" y="46" width="8" height="10" rx="2" fill="#3a6fb0" />
    </>
  ),
};

export default function BagArt({ name }) {
  return (
    <svg viewBox="0 0 120 120" className="bag-art" aria-hidden="true">
      <ellipse cx="60" cy="110" rx="38" ry="6" fill="#000" opacity="0.15" />
      {ART[name]}
    </svg>
  );
}

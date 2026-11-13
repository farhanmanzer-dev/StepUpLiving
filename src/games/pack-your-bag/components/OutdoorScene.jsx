// Full-screen illustrated backdrop for the menu screens (pure SVG, no images).
// It "covers" the screen like background-size: cover.
function Cloud({ x, y, s = 1, className }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="20" rx="78" ry="26" fill="#fff" />
      <circle cx="-30" cy="8" r="30" fill="#fff" />
      <circle cx="12" cy="-4" r="40" fill="#fff" />
      <circle cx="46" cy="12" r="26" fill="#fff" />
    </g>
  );
}

function Bush({ x, y, s = 1, c = "#5aa86a", c2 = "#6fbe7c" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-38" cy="0" r="34" fill={c} />
      <circle cx="0" cy="-18" r="44" fill={c} />
      <circle cx="40" cy="0" r="32" fill={c} />
      <circle cx="-6" cy="-30" r="22" fill={c2} opacity="0.7" />
      <rect x="-72" y="0" width="144" height="34" fill={c} />
    </g>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-10" y="-40" width="20" height="90" rx="6" fill="#8a5a36" />
      <circle cx="0" cy="-90" r="62" fill="#4f9f62" />
      <circle cx="-44" cy="-56" r="42" fill="#4f9f62" />
      <circle cx="44" cy="-56" r="42" fill="#4f9f62" />
      <circle cx="-14" cy="-112" r="30" fill="#66b877" />
      <circle cx="30" cy="-70" r="8" fill="#e2475a" />
      <circle cx="-30" cy="-90" r="8" fill="#e2475a" />
      <circle cx="8" cy="-50" r="8" fill="#e2475a" />
    </g>
  );
}

function Tuft({ x, y }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M-18 0 Q-14 -22 -6 -26 Q-8 -10 -2 0 Q2 -30 10 -34 Q8 -14 12 0 Q18 -18 26 -20 Q20 -8 22 0Z"
      fill="#4f8f3f"
    />
  );
}

function Flower({ x, y, c = "#ff8fb1" }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1.5" y="0" width="3" height="16" fill="#4f8f3f" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={Math.sin((a * Math.PI) / 180) * 6} r="5" fill={c} />
      ))}
      <circle r="4" fill="#ffd23f" />
    </g>
  );
}

function School() {
  return (
    <g transform="translate(800 0)">
      {/* wings */}
      <rect x="-300" y="378" width="210" height="190" fill="#f0915a" />
      <rect x="90" y="378" width="210" height="190" fill="#f0915a" />
      <path d="M-320 384 L-280 330 L-90 330 L-90 384Z" fill="#c9562f" />
      <path d="M320 384 L280 330 L90 330 L90 384Z" fill="#c9562f" />
      <rect x="-320" y="378" width="230" height="12" rx="4" fill="#a8452a" />
      <rect x="90" y="378" width="230" height="12" rx="4" fill="#a8452a" />
      {/* wing windows */}
      {[-262, -168, 128, 222].map((x) => (
        <g key={x}>
          <rect x={x} y="420" width="64" height="58" rx="6" fill="#fff6e0" />
          <rect x={x + 6} y="426" width="52" height="46" rx="3" fill="#7cc4e4" />
          <rect x={x + 30} y="426" width="4" height="46" fill="#fff6e0" />
          <rect x={x + 6} y="447" width="52" height="4" fill="#fff6e0" />
          <path d={`M${x + 10} 466 l14 -14`} stroke="#bfe6f7" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
      {/* centre block */}
      <rect x="-110" y="300" width="220" height="268" fill="#f7a36b" />
      <path d="M-140 312 L0 196 L140 312Z" fill="#e2683a" />
      <path d="M-140 312 L0 196 L140 312" fill="none" stroke="#b84d27" strokeWidth="16" strokeLinejoin="round" />
      {/* clock */}
      <circle cx="0" cy="262" r="34" fill="#ffc93c" />
      <circle cx="0" cy="262" r="25" fill="#fffaf0" />
      <path d="M0 262 L0 244 M0 262 L12 268" stroke="#3a2a20" strokeWidth="4" strokeLinecap="round" />
      {/* sign */}
      <rect x="-82" y="326" width="164" height="40" rx="10" fill="#ffc93c" />
      <text x="0" y="355" textAnchor="middle" fontSize="26" fontWeight="700" fill="#8a3d1c" fontFamily="Fredoka, sans-serif" letterSpacing="3">
        SCHOOL
      </text>
      {/* door */}
      <rect x="-54" y="440" width="108" height="128" rx="10" fill="#ffd35c" />
      <rect x="-44" y="452" width="40" height="116" rx="4" fill="#4aa3c9" />
      <rect x="4" y="452" width="40" height="116" rx="4" fill="#4aa3c9" />
      <circle cx="-12" cy="512" r="4" fill="#ffd35c" />
      <circle cx="12" cy="512" r="4" fill="#ffd35c" />
      <rect x="-70" y="560" width="140" height="12" rx="4" fill="#d6c3a0" />
      {/* flag */}
      <rect x="-2" y="140" width="4" height="60" fill="#8a8f99" />
      <path className="flag" d="M2 142 L46 154 L2 168Z" fill="#e2475a" />
    </g>
  );
}

function Swing({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#b98a5a" strokeWidth="10" strokeLinecap="round" fill="none">
      <path d="M-90 120 L-60 -60 L-30 120" />
      <path d="M90 120 L60 -60 L30 120" />
      <path d="M-66 -58 L66 -58" strokeWidth="12" />
      <g className="swing" stroke="#8d6a46" strokeWidth="3">
        <path d="M-22 -56 L-22 60 M22 -56 L22 60" />
        <rect x="-30" y="58" width="60" height="10" rx="4" fill="#e2475a" stroke="none" />
      </g>
    </g>
  );
}

export default function OutdoorScene({ variant = "school", soft = false }) {
  return (
    <div className={`outdoor ${soft ? "soft" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4fb0d9" />
            <stop offset="1" stopColor="#a8e0f2" />
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fc957" />
            <stop offset="1" stopColor="#6fae45" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cbb98f" />
            <stop offset="1" stopColor="#b9a57a" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#sky)" />
        <g className="sun">
          <circle cx="1390" cy="120" r="90" fill="#fff3b0" opacity="0.5" />
          <circle cx="1390" cy="120" r="62" fill="#ffe066" />
        </g>
        <Cloud x={260} y={120} s={1} className="cloud c1" />
        <Cloud x={1080} y={90} s={0.75} className="cloud c2" />
        <Cloud x={620} y={60} s={0.6} className="cloud c3" />

        {/* far hills */}
        <ellipse cx="250" cy="600" rx="420" ry="160" fill="#7cc191" />
        <ellipse cx="1380" cy="610" rx="460" ry="170" fill="#7cc191" />
        <ellipse cx="800" cy="640" rx="600" ry="120" fill="#8acb98" />

        <School />

        <Tree x={170} y={520} s={1.1} />
        <Tree x={1450} y={520} s={1.2} />
        <Bush x={420} y={560} s={1} />
        <Bush x={1190} y={560} s={1.1} />

        {/* ground + road */}
        <rect y="560" width="1600" height="340" fill="url(#grass)" />
        <path d="M730 568 L870 568 L1260 900 L340 900Z" fill="url(#road)" />
        <path d="M800 600 L800 640 M800 690 L800 750 M800 810 L800 890" stroke="#e8dcc0" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="640" cy="780" rx="40" ry="8" fill="#a8956c" opacity="0.5" />
        <ellipse cx="960" cy="700" rx="30" ry="6" fill="#a8956c" opacity="0.5" />

        {variant === "park" && <Swing x={1300} y={660} />}

        <Tuft x={240} y={720} />
        <Tuft x={1380} y={760} />
        <Tuft x={520} y={850} />
        <Tuft x={1120} y={830} />
        <Flower x={300} y={640} />
        <Flower x={340} y={660} c="#ffd23f" />
        <Flower x={1250} y={650} c="#c58cf0" />
        <Flower x={1290} y={672} />
        <Flower x={110} y={820} c="#ffd23f" />
        <Flower x={1500} y={840} c="#c58cf0" />
      </svg>
    </div>
  );
}

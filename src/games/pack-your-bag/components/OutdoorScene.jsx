// 2D fallback backdrop (pure SVG) used when the 3D school yard cannot start.
// It "covers" the screen like background-size: cover.
// With `interactive`, children can tap the sun, clouds, trees, flowers, the
// school clock and the birds: each one reacts with an animation and a sound.
import { poke, sfx } from "../game/fx.js";

const tapper = (cls, ms, sound) => (e) => {
  poke(e.currentTarget, cls, ms);
  sound();
};

// ------------------------------------------------------------ pieces
// little anime face: big shiny eyes, blush and a smile; ^ ^ eyes when tapped
function Face({ x = 0, y = 0, s = 1, ink = "#4a3a5a" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="eyes-open">
        <g className="blink">
          <ellipse cx="-12" cy="0" rx="4.5" ry="6" fill={ink} />
          <ellipse cx="12" cy="0" rx="4.5" ry="6" fill={ink} />
          <circle cx="-10.5" cy="-2.2" r="1.8" fill="#fff" />
          <circle cx="13.5" cy="-2.2" r="1.8" fill="#fff" />
        </g>
      </g>
      <g className="eyes-happy" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round">
        <path d="M-17 2 Q-12 -6 -7 2" />
        <path d="M7 2 Q12 -6 17 2" />
      </g>
      <ellipse cx="-20" cy="8" rx="5" ry="3" fill="#ff8fa8" opacity="0.6" />
      <ellipse cx="20" cy="8" rx="5" ry="3" fill="#ff8fa8" opacity="0.6" />
      <path className="mouth" d="M-5 7 Q0 12 5 7" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      <path className="mouth-open" d="M-6 6 Q0 16 6 6Z" fill="#c2405a" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    </g>
  );
}

function Cloud({ x, y, s = 1, className }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="tap tap-cloud" onPointerDown={tapper("boop", 800, sfx.cloud)}>
        <ellipse cx="0" cy="20" rx="78" ry="26" fill="#fff" />
        <circle cx="-30" cy="8" r="30" fill="#fff" />
        <circle cx="12" cy="-4" r="40" fill="#fff" />
        <circle cx="46" cy="12" r="26" fill="#fff" />
        <ellipse cx="0" cy="38" rx="70" ry="8" fill="#dcefff" opacity="0.8" />
        <Face x={8} y={14} s={0.9} ink="#5b6f9a" />
      </g>
    </g>
  );
}

function Sun() {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g transform="translate(1390 120)">
      <g className="sun">
        <g className="sun-rays">
          {rays.map((a) => (
            <rect key={a} x="-7" y="-122" width="14" height="30" rx="7" fill="#ffd93d" opacity="0.85" transform={`rotate(${a})`} />
          ))}
        </g>
        <g className="tap tap-sun" onPointerDown={tapper("boop", 1100, sfx.sun)}>
          <circle r="90" fill="#fff3b0" opacity="0.5" />
          <circle r="62" fill="#ffe066" />
          <circle cx="-18" cy="-22" r="16" fill="#fff6c4" opacity="0.7" />
          <Face y={6} s={1.5} ink="#7a4a12" />
        </g>
      </g>
    </g>
  );
}

function Bush({ x, y, s = 1, c = "#5aa86a", c2 = "#6fbe7c" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-38" cy="0" r="34" fill="url(#bushG)" />
      <circle cx="40" cy="0" r="32" fill="url(#bushG)" />
      <circle cx="0" cy="-18" r="44" fill="url(#bushG)" />
      <circle cx="-12" cy="-36" r="16" fill={c2} opacity="0.55" />
      <rect x="-72" y="0" width="144" height="34" fill={c} />
    </g>
  );
}

const APPLES = [
  { cx: 30, cy: -70, d: 0 },
  { cx: -30, cy: -90, d: 0.12 },
  { cx: 8, cy: -50, d: 0.22 },
];

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="tap tap-tree" onPointerDown={tapper("boop", 2600, sfx.tree)}>
        <ellipse cx="0" cy="50" rx="80" ry="14" fill="url(#groundShadow)" />
        <rect x="-10" y="-40" width="20" height="90" rx="6" fill="url(#trunkG)" />
        <circle cx="-44" cy="-56" r="42" fill="url(#crownG)" />
        <circle cx="44" cy="-56" r="42" fill="url(#crownG)" />
        <circle cx="0" cy="-90" r="62" fill="url(#crownG)" />
        <circle cx="-18" cy="-114" r="24" fill="#9bdba6" opacity="0.45" />
        {APPLES.map((a) => (
          <g key={a.cx} className="apple" style={{ "--fall": `${44 - a.cy}px`, animationDelay: `${a.d}s` }}>
            <circle cx={a.cx} cy={a.cy} r="8" fill="url(#appleG)" />
            <circle cx={a.cx - 2.5} cy={a.cy - 2.5} r="2.2" fill="#fff" opacity="0.6" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Tuft({ x, y }) {
  return (
    <path
      className="tuft"
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
      <g className="tap tap-flower" onPointerDown={tapper("boop", 900, sfx.flower)}>
        <circle r="20" fill="transparent" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={Math.sin((a * Math.PI) / 180) * 6} r="5" fill={c} />
        ))}
        <circle r="4" fill="#ffd23f" />
      </g>
    </g>
  );
}

function School() {
  return (
    <g transform="translate(800 0)">
      {/* wings */}
      <ellipse cx="0" cy="572" rx="360" ry="22" fill="url(#groundShadow)" />
      <rect x="-300" y="378" width="210" height="190" fill="url(#wingG)" />
      <rect x="90" y="378" width="210" height="190" fill="url(#wingG)" />
      {/* brick hints */}
      {[-262, -200, -140, 120, 180, 250].map((bx, i) => (
        <rect key={bx} x={bx} y={500 + (i % 3) * 20} width="26" height="9" rx="3" fill="#d9733f" opacity="0.5" />
      ))}
      <path d="M-320 384 L-280 330 L-90 330 L-90 384Z" fill="url(#roofSideG)" />
      <path d="M320 384 L280 330 L90 330 L90 384Z" fill="url(#roofSideG)" />
      {/* roof tile rows */}
      <path d="M-300 357 L-90 357 M-289 343 L-90 343 M300 357 L90 357 M289 343 L90 343" stroke="#a8452a" strokeWidth="3" opacity="0.45" />
      <rect x="-320" y="378" width="230" height="12" rx="4" fill="#a8452a" />
      <rect x="90" y="378" width="230" height="12" rx="4" fill="#a8452a" />
      {/* wing windows */}
      {[-262, -168, 128, 222].map((x) => (
        <g key={x}>
          <rect x={x} y="420" width="64" height="58" rx="6" fill="#fff6e0" />
          <rect x={x + 6} y="426" width="52" height="46" rx="3" fill="url(#glassG)" />
          <rect x={x + 30} y="426" width="4" height="46" fill="#fff6e0" />
          <rect x={x + 6} y="447" width="52" height="4" fill="#fff6e0" />
          <path d={`M${x + 10} 466 l14 -14`} stroke="#e4f6fd" strokeWidth="5" strokeLinecap="round" />
          <rect x={x - 4} y="476" width="72" height="9" rx="4" fill="#fff6e0" />
          <rect x={x - 4} y="483" width="72" height="4" rx="2" fill="#000" opacity="0.08" />
        </g>
      ))}
      {/* centre block */}
      <rect x="-110" y="300" width="220" height="268" fill="url(#wallG)" />
      {/* shadow under the roof edge */}
      <rect x="-110" y="300" width="220" height="16" fill="#000" opacity="0.1" />
      <path d="M-140 312 L0 196 L140 312Z" fill="url(#roofG)" />
      <path d="M-100 300 L0 216 L30 241 L-62 300Z" fill="#fff" opacity="0.12" />
      <path d="M-140 312 L0 196 L140 312" fill="none" stroke="#b84d27" strokeWidth="16" strokeLinejoin="round" />
      {/* clock: tap to ring it */}
      <g className="tap tap-clock" onPointerDown={tapper("boop", 1000, sfx.clock)}>
        <circle cx="0" cy="262" r="34" fill="#ffc93c" />
        <circle cx="0" cy="262" r="25" fill="#fffaf0" />
        <path className="clock-min" d="M0 262 L0 244" stroke="#3a2a20" strokeWidth="4" strokeLinecap="round" />
        <path className="clock-hour" d="M0 262 L12 268" stroke="#3a2a20" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* sign */}
      <rect x="-82" y="326" width="164" height="40" rx="10" fill="#ffc93c" />
      <text x="0" y="355" textAnchor="middle" fontSize="26" fontWeight="700" fill="#8a3d1c" fontFamily="Fredoka, sans-serif" letterSpacing="3">
        SCHOOL
      </text>
      {/* door */}
      <rect x="-54" y="440" width="108" height="128" rx="10" fill="#ffd35c" />
      <rect x="-44" y="452" width="40" height="116" rx="4" fill="url(#doorG)" />
      <rect x="4" y="452" width="40" height="116" rx="4" fill="url(#doorG)" />
      <rect x="-38" y="462" width="28" height="36" rx="3" fill="#b8e6f8" opacity="0.55" />
      <rect x="10" y="462" width="28" height="36" rx="3" fill="#b8e6f8" opacity="0.55" />
      <circle cx="-12" cy="512" r="4" fill="#ffd35c" />
      <circle cx="12" cy="512" r="4" fill="#ffd35c" />
      <rect x="-80" y="560" width="160" height="10" rx="4" fill="#e6d6b4" />
      <rect x="-92" y="568" width="184" height="10" rx="4" fill="#d6c3a0" />
      {/* flag */}
      <rect x="-2" y="140" width="4" height="60" fill="#8a8f99" />
      <path className="flag" d="M2 142 L46 154 L2 168Z" fill="#e2475a" />
    </g>
  );
}

// a round little bird flying across the sky; tap it and it does a loop
function Bird({ y, s = 1, c = "#ffb84d", dur = 26, delay = 0, reverse = false }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className={`bird-fly ${reverse ? "rev" : ""}`} style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <g className="bird-bob" transform={`scale(${reverse ? -s : s} ${s})`}>
          <g className="tap tap-bird" onPointerDown={tapper("boop", 900, sfx.bird)}>
            <circle r="34" fill="transparent" />
            <ellipse rx="18" ry="15" fill={c} />
            <ellipse cx="4" cy="5" rx="10" ry="7" fill="#fff4dc" />
            <path d="M16 -2 L26 2 L16 6Z" fill="#ff7a3a" />
            <circle cx="8" cy="-5" r="3" fill="#3a2a20" />
            <circle cx="9" cy="-6" r="1" fill="#fff" />
            <ellipse cx="6" cy="2" rx="3" ry="1.8" fill="#ff8fa8" opacity="0.7" />
            <path className="wing" d="M-4 -2 Q-14 -22 -22 -10 Q-14 -4 -4 -2Z" fill={c} stroke="#e0902a" strokeWidth="1.5" />
          </g>
        </g>
      </g>
    </g>
  );
}

function Sparkle({ x, y, s = 1, d = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="sky-sparkle"
        style={{ animationDelay: `${d}s` }}
        d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z"
        fill="#fff"
      />
    </g>
  );
}

export default function OutdoorScene({ variant = "school", soft = false, interactive = false }) {
  return (
    <div className={`outdoor ${soft ? "soft" : ""} ${interactive ? "interactive" : ""}`} aria-hidden="true">
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
          {/* soft "3D" shading for the scenery */}
          <linearGradient id="wallG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffb985" />
            <stop offset="0.6" stopColor="#f7a36b" />
            <stop offset="1" stopColor="#e88a50" />
          </linearGradient>
          <linearGradient id="wingG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f39c66" />
            <stop offset="1" stopColor="#e07e48" />
          </linearGradient>
          <linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f07b48" />
            <stop offset="1" stopColor="#cf5a2e" />
          </linearGradient>
          <linearGradient id="roofSideG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9653a" />
            <stop offset="1" stopColor="#b54a26" />
          </linearGradient>
          <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b8e6f8" />
            <stop offset="0.5" stopColor="#7cc4e4" />
            <stop offset="1" stopColor="#5aaed6" />
          </linearGradient>
          <linearGradient id="doorG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fb6db" />
            <stop offset="1" stopColor="#3b8fb8" />
          </linearGradient>
          <radialGradient id="crownG" cx="0.38" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#7fcb8b" />
            <stop offset="0.6" stopColor="#4f9f62" />
            <stop offset="1" stopColor="#3b8150" />
          </radialGradient>
          <radialGradient id="bushG" cx="0.4" cy="0.25" r="0.8">
            <stop offset="0" stopColor="#7cc68a" />
            <stop offset="1" stopColor="#4a9a5c" />
          </radialGradient>
          <linearGradient id="trunkG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a06c42" />
            <stop offset="1" stopColor="#74482a" />
          </linearGradient>
          <linearGradient id="hillG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#92d0a3" />
            <stop offset="1" stopColor="#6db083" />
          </linearGradient>
          <radialGradient id="appleG" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#ff8a8a" />
            <stop offset="1" stopColor="#d2304a" />
          </radialGradient>
          <radialGradient id="groundShadow">
            <stop offset="0" stopColor="#2f5a1f" stopOpacity="0.35" />
            <stop offset="1" stopColor="#2f5a1f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#sky)" />

        <Sparkle x={120} y={260} s={0.8} d={0} />
        <Sparkle x={480} y={200} s={0.6} d={1.1} />
        <Sparkle x={1010} y={230} s={0.7} d={0.6} />
        <Sparkle x={1230} y={300} s={0.9} d={1.8} />
        <Sparkle x={700} y={140} s={0.5} d={2.4} />
        <Sparkle x={1540} y={260} s={0.6} d={0.9} />

        <Sun />
        <Cloud x={260} y={120} s={1} className="cloud c1" />
        <Cloud x={1080} y={90} s={0.75} className="cloud c2" />
        <Cloud x={620} y={60} s={0.6} className="cloud c3" />

        <Bird y={210} s={1.1} dur={24} delay={-6} />
        <Bird y={290} s={0.85} c="#8fd3ff" dur={31} delay={-20} reverse />

        {/* far hills */}
        <ellipse cx="250" cy="600" rx="420" ry="160" fill="url(#hillG)" />
        <ellipse cx="1380" cy="610" rx="460" ry="170" fill="url(#hillG)" />
        <ellipse cx="160" cy="470" rx="160" ry="30" fill="#fff" opacity="0.12" />
        <ellipse cx="1300" cy="470" rx="180" ry="32" fill="#fff" opacity="0.12" />
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

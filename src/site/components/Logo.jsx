// Step Up Living mark: three rising steps with a person celebrating on top.
export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="3" y="30" width="13" height="15" rx="3.5" fill="#ff8a65" />
      <rect x="17.5" y="22" width="13" height="23" rx="3.5" fill="#ffc93c" />
      <rect x="32" y="14" width="13" height="31" rx="3.5" fill="#2bb3a3" />
      <circle cx="38.5" cy="5.5" r="3.6" fill="#1b2150" />
      <path d="M32.5 4.5 L35.5 9.5 L41.5 9.5 L44.5 4.5" fill="none" stroke="#1b2150" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ onClick }) {
  return (
    <button className="sl-logo" onClick={onClick} aria-label="Step Up Living, back to top">
      <LogoMark />
      <span className="sl-logo-text">
        Step Up <b>Living</b>
      </span>
    </button>
  );
}

// Round icon buttons used on every screen (settings, home, fullscreen...).
const ICONS = {
  gear: (
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.3 4.6-.1-1.1 2-1.6-2-3.4-2.4.9a8 8 0 0 0-1.9-1.1L15.5 3h-4l-.4 2.6a8 8 0 0 0-1.9 1.1l-2.4-.9-2 3.4 2 1.6a8 8 0 0 0 0 2.2l-2 1.6 2 3.4 2.4-.9c.6.5 1.2.8 1.9 1.1l.4 2.6h4l.4-2.6c.7-.3 1.3-.6 1.9-1.1l2.4.9 2-3.4-2-1.6.1-1.1Z" />
  ),
  home: <path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3L12 3Z" />,
  back: <path d="M15.5 4 7 12l8.5 8 2-2-6.4-6 6.4-6-2-2Z" />,
  expand: <path d="M3 3h7v2.5H5.5V10H3V3Zm11 0h7v7h-2.5V5.5H14V3ZM3 14h2.5v4.5H10V21H3v-7Zm15.5 0H21v7h-7v-2.5h4.5V14Z" />,
  shrink: <path d="M7.5 3H10v7H3V7.5h4.5V3ZM14 3h2.5v4.5H21V10h-7V3ZM3 14h7v7H7.5v-4.5H3V14Zm11 0h7v2.5h-4.5V21H14v-7Z" />,
  bulb: <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Zm-3 17h6v1.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5V19Z" />,
  replay: <path d="M12 4V1L7 5.5 12 10V6.5a5.5 5.5 0 1 1-5.5 5.5H4a8 8 0 1 0 8-8Z" />,
};

export default function IconButton({ icon, label, onClick, color = "white", className = "", disabled }) {
  return (
    <button className={`icon-btn icon-${color} ${className}`} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg>
    </button>
  );
}

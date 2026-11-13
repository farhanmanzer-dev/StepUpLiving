import { useEffect, useState } from "react";
import IconButton from "./IconButton.jsx";

export default function FullscreenButton() {
  const [full, setFull] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  if (!document.fullscreenEnabled) return null;
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };
  return (
    <IconButton
      icon={full ? "shrink" : "expand"}
      label={full ? "Exit full screen" : "Full screen"}
      onClick={toggle}
      color="dark"
      className="fullscreen-btn"
    />
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo.jsx";

const LINKS = [
  { id: "games", label: "Games" },
  { id: "skills", label: "Skills" },
  { id: "how", label: "How it works" },
  { id: "access", label: "Accessibility" },
];

// We use HashRouter, so in-page links scroll with JS instead of "#id" hrefs.
export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: reduce ? "auto" : "smooth" });
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className={`sl-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="sl-nav-inner">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <nav className="sl-nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}>{l.label}</button>
          ))}
        </nav>
        <button className="sl-btn sl-btn-primary sl-nav-cta" onClick={() => go("games")}>
          Play now
        </button>
        <button
          className={`sl-burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="sl-mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {LINKS.map((l, i) => (
              <motion.button
                key={l.id}
                onClick={() => go(l.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                {l.label}
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

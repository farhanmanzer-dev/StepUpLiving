import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar, { scrollToId } from "./components/Navbar.jsx";
import HeroCanvas from "./components/HeroCanvas.jsx";
import GameLibrary from "./components/GameLibrary.jsx";
import { LogoMark } from "./components/Logo.jsx";

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  { icon: "🎒", title: "School & routines", text: "Get ready for the day: pack a bag, follow a morning routine.", color: "coral" },
  { icon: "🍽️", title: "Home & mealtimes", text: "Set the table, tidy up and help around the house.", color: "sun" },
  { icon: "🧺", title: "Self-care", text: "Wash clothes, stay clean and look after yourself.", color: "teal" },
  { icon: "🩹", title: "Safety & first aid", text: "Know what to do when someone gets hurt.", color: "sky" },
  { icon: "🍳", title: "Cooking", text: "Find the right tools and stay safe in the kitchen.", color: "lilac" },
  { icon: "🛒", title: "Out in the community", text: "Shopping, money and getting around (coming soon).", color: "pink" },
];

const STEPS = [
  { n: 1, icon: "👆", title: "Choose a game", text: "Pick a daily-life task. Every game starts with clear, spoken instructions." },
  { n: 2, icon: "🧩", title: "Practise with help", text: "Try as many times as needed. Gentle hints appear when someone gets stuck." },
  { n: 3, icon: "⭐", title: "Celebrate & repeat", text: "Earn stars, hear cheers and build confidence step by step." },
];

const ACCESS = [
  { icon: "🔊", title: "Voice guidance", text: "Instructions and feedback are read aloud." },
  { icon: "💡", title: "Automatic hints", text: "A glowing ring and a pointing hand show what to do next." },
  { icon: "🖐️", title: "Big, clear targets", text: "Large buttons that work with a mouse, touch screen or tablet." },
  { icon: "☀️", title: "Adjustable settings", text: "Change brightness, music, sound effects and voice volume." },
  { icon: "🌈", title: "No failing, ever", text: "Mistakes get a friendly “try again” and everyone finishes with stars." },
  { icon: "💻", title: "Runs on school PCs", text: "Light graphics that work on older computers and save battery." },
];

export default function Landing() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const ctx = gsap.context(() => {
      // hero entrance
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".sl-eyebrow", { y: 20, opacity: 0, duration: 0.5 })
        .from(".sl-hero h1 .sl-word", { y: 60, opacity: 0, rotate: 4, duration: 0.7, stagger: 0.06 }, "-=0.2")
        .from(".sl-hero-lead", { y: 20, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(".sl-hero-ctas > *", { y: 20, opacity: 0, duration: 0.45, stagger: 0.08 }, "-=0.3")
        .from(".sl-hero-chips li", { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }, "-=0.2")
        .from(".sl-hero-art", { scale: 0.9, opacity: 0, duration: 0.9 }, 0.2);

      // headings and generic reveals
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      // staggered groups of cards
      gsap.utils.toArray("[data-stagger]").forEach((group) => {
        gsap.from(group.children, {
          y: 50, opacity: 0, scale: 0.95, duration: 0.6, stagger: 0.09, ease: "back.out(1.4)",
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
      });
      // the dashed path that links the 3 steps draws itself
      const path = document.querySelector(".sl-how-path path");
      if (path) {
        const len = path.getTotalLength();
        gsap.fromTo(path, { strokeDashoffset: len, strokeDasharray: len }, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ".sl-how", start: "top 75%", end: "bottom 60%", scrub: 0.6 },
        });
      }
      // floating background shapes drift with scroll
      gsap.utils.toArray(".sl-float").forEach((el, i) => {
        gsap.to(el, { y: (i % 2 ? -1 : 1) * 120, rotate: i % 2 ? 40 : -40, ease: "none", scrollTrigger: { scrub: 1 } });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="sl-page" ref={root}>
      <a className="sl-skip" href="#main" onClick={(e) => { e.preventDefault(); scrollToId("games"); }}>Skip to games</a>
      <Navbar />

      <main id="main">
        {/* ------------------------------------------------ hero */}
        <section className="sl-hero">
          <span className="sl-float f1" aria-hidden="true" />
          <span className="sl-float f2" aria-hidden="true" />
          <span className="sl-float f3" aria-hidden="true" />
          <div className="sl-container sl-hero-grid">
            <div className="sl-hero-copy">
              <p className="sl-eyebrow">
                <span aria-hidden="true">🌱</span> Life-skill games for people with intellectual &amp; developmental disabilities
              </p>
              <h1>
                <span className="sl-line">
                  <span className="sl-word">Small</span> <span className="sl-word">steps</span> <span className="sl-word">to</span>
                </span>
                <span className="sl-line sl-hl">
                  <span className="sl-word">independent</span> <span className="sl-word">living</span>
                </span>
              </h1>
              <p className="sl-hero-lead">
                Friendly 2D, 3D, AR and VR games for practising everyday tasks like packing a bag,
                setting the table and washing clothes, at each learner’s own pace.
              </p>
              <div className="sl-hero-ctas">
                <button className="sl-btn sl-btn-primary sl-btn-lg" onClick={() => scrollToId("games")}>
                  <span aria-hidden="true">▶</span> Start playing
                </button>
                <button className="sl-btn sl-btn-ghost sl-btn-lg" onClick={() => scrollToId("how")}>
                  How it helps
                </button>
              </div>
              <ul className="sl-hero-chips">
                <li><span aria-hidden="true">🔊</span> Voice instructions</li>
                <li><span aria-hidden="true">💡</span> Gentle hints</li>
                <li><span aria-hidden="true">⭐</span> Stars, not scores</li>
              </ul>
            </div>
            <HeroCanvas />
          </div>
          <svg className="sl-hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40 C 240 90 480 0 720 30 C 960 60 1200 10 1440 40 L1440 90 L0 90Z" />
          </svg>
        </section>

        {/* ------------------------------------------------ games */}
        <section id="games" className="sl-section sl-games">
          <div className="sl-container">
            <div className="sl-section-head" data-reveal>
              <span className="sl-kicker">Game library</span>
              <h2>Choose a game and start practising</h2>
              <p>Each game turns a real daily task into a short, playful activity with voice guidance.</p>
            </div>
            <GameLibrary />
          </div>
        </section>

        {/* ------------------------------------------------ skills */}
        <section id="skills" className="sl-section sl-skills">
          <div className="sl-container">
            <div className="sl-section-head" data-reveal>
              <span className="sl-kicker">What learners practise</span>
              <h2>Everyday skills, one step at a time</h2>
            </div>
            <div className="sl-skill-grid" data-stagger>
              {SKILLS.map((s) => (
                <div key={s.title} className={`sl-skill c-${s.color}`}>
                  <span className="sl-skill-icon" aria-hidden="true">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ how it works */}
        <section id="how" className="sl-section sl-how">
          <div className="sl-container">
            <div className="sl-section-head" data-reveal>
              <span className="sl-kicker">How it works</span>
              <h2>Simple enough to play alone, rich enough to keep learning</h2>
            </div>
            <div className="sl-how-wrap">
              <svg className="sl-how-path" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
                <path d="M80 90 C 260 -10 380 140 500 60 S 760 -10 920 70" />
              </svg>
              <ol className="sl-how-steps" data-stagger>
                {STEPS.map((s) => (
                  <li key={s.n} className="sl-how-step">
                    <span className="sl-how-num">{s.n}</span>
                    <span className="sl-how-icon" aria-hidden="true">{s.icon}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ accessibility */}
        <section id="access" className="sl-section sl-access">
          <div className="sl-container">
            <div className="sl-section-head" data-reveal>
              <span className="sl-kicker">Designed for every learner</span>
              <h2>Built with accessibility at the centre</h2>
            </div>
            <div className="sl-access-grid" data-stagger>
              {ACCESS.map((a) => (
                <div key={a.title} className="sl-access-item">
                  <span className="sl-access-icon" aria-hidden="true">{a.icon}</span>
                  <div>
                    <h3>{a.title}</h3>
                    <p>{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ call to action */}
        <section className="sl-section sl-cta-wrap">
          <div className="sl-container">
            <div className="sl-cta" data-reveal>
              <div>
                <h2>For classrooms, centres and homes</h2>
                <p>
                  Teachers, therapists and families can use the games together with learners.
                  Each game can report stars, accuracy and time to your learning portal.
                </p>
              </div>
              <button className="sl-btn sl-btn-light sl-btn-lg" onClick={() => scrollToId("games")}>
                Explore the games <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="sl-footer">
        <div className="sl-container sl-footer-inner">
          <div className="sl-footer-brand">
            <LogoMark size={34} />
            <div>
              <strong>Step Up Living</strong>
              <span>Small steps to independent living.</span>
            </div>
          </div>
          <p className="sl-footer-note">© {new Date().getFullYear()} Step Up Living. Made with care for every learner.</p>
        </div>
      </footer>
    </div>
  );
}

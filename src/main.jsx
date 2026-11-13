import { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, useLocation } from "react-router";
import Landing from "./site/Landing.jsx";
import "./site/landing.css";

// Games are loaded only when opened, so the landing page stays light.
const PackYourBag = lazy(() => import("./games/pack-your-bag/PackYourBag.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="sl-loading" role="status">
      <span className="sl-loading-dot" />
      <span className="sl-loading-dot" />
      <span className="sl-loading-dot" />
      <span className="sl-visually-hidden">Loading game…</span>
    </div>
  );
}

// HashRouter: works from any folder, on any static host and inside iframes.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/games/pack-your-bag" element={<PackYourBag />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>
);

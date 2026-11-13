import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./pack-your-bag.css";
import { LEVELS } from "./levels.js";
import { loadSettings, saveSettings, loadStars, saveStars } from "./storage.js";
import { setVolumes, startMusic, unlockAudio, click } from "./game/audio.js";
import OutdoorScene from "./components/OutdoorScene.jsx";
import TitleScreen from "./components/TitleScreen.jsx";
import ObjectivesScreen from "./components/ObjectivesScreen.jsx";
import LevelSelect from "./components/LevelSelect.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import GameScreen from "./components/GameScreen.jsx";
import IconButton from "./components/IconButton.jsx";
import FullscreenButton from "./components/FullscreenButton.jsx";

// Screen flow: title -> objectives -> levels -> game (-> results) -> levels ...
export default function PackYourBag() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("title");

  // The game is a full-screen app: stop the page behind it from scrolling.
  useEffect(() => {
    document.documentElement.classList.add("pyb-lock");
    return () => document.documentElement.classList.remove("pyb-lock");
  }, []);
  const [level, setLevel] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [stars, setStars] = useState(loadStars);

  useEffect(() => {
    setVolumes({ music: settings.music, sfx: settings.sfx, voice: settings.voice });
    saveSettings(settings);
  }, [settings]);

  const go = (next) => {
    click();
    setScreen(next);
  };

  const play = () => {
    unlockAudio();
    startMusic();
    go("objectives");
  };

  const pickLevel = (lv) => {
    click();
    setLevel(lv);
    setScreen("game");
  };

  const recordResult = (r) => {
    setStars((prev) => {
      if ((prev[r.level] || 0) >= r.stars) return prev;
      const next = { ...prev, [r.level]: r.stars };
      saveStars(next);
      return next;
    });
  };

  const idx = level ? LEVELS.findIndex((l) => l.id === level.id) : -1;
  const inMenu = screen !== "game";

  return (
    <main className="app" style={settings.brightness !== 1 ? { filter: `brightness(${settings.brightness})` } : undefined}>
      {inMenu && <OutdoorScene soft={screen !== "title"} interactive={screen === "title"} />}

      {screen === "title" && <TitleScreen onPlay={play} />}
      {screen === "objectives" && <ObjectivesScreen onNext={() => go("levels")} />}
      {screen === "levels" && <LevelSelect stars={stars} onPick={pickLevel} />}
      {screen === "game" && level && (
        <GameScreen
          key={level.id}
          level={level}
          hasNext={idx < LEVELS.length - 1}
          onHome={() => setScreen("levels")}
          onNext={() => setLevel(LEVELS[idx + 1])}
          onResult={recordResult}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {inMenu && (
        <div className="corner corner-tr">
          <IconButton icon="gear" label="Settings" color="blue" onClick={() => { click(); setShowSettings(true); }} />
        </div>
      )}
      {screen === "title" && (
        <div className="corner corner-tl">
          <IconButton icon="home" label="All games" color="green" onClick={() => { click(); navigate("/"); }} />
        </div>
      )}
      {screen === "levels" && (
        <div className="corner corner-tl">
          <IconButton icon="back" label="Back" color="green" onClick={() => go("title")} />
        </div>
      )}
      <FullscreenButton />

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => { click(); setShowSettings(false); }}
        />
      )}
    </main>
  );
}

import Panel from "./Panel.jsx";

function Slider({ label, value, min = 0, max = 1, onChange, indent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={`slider-row ${indent ? "indent" : ""}`}>
      <span className="slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--pct": `${pct}%` }}
      />
    </label>
  );
}

export default function SettingsPanel({ settings, onChange, onClose }) {
  const set = (key) => (v) => onChange({ ...settings, [key]: v });
  return (
    <div className="overlay frosted" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Panel title="Settings" icon="⚙️" action="Ok" onAction={onClose} className="settings-panel">
        <div className="setting-group">
          <h3><span aria-hidden="true">☀️</span> Brightness</h3>
          <Slider label="Screen" value={settings.brightness} min={0.6} max={1.3} onChange={set("brightness")} indent />
        </div>
        <div className="setting-group">
          <h3><span aria-hidden="true">🔊</span> Volume</h3>
          <Slider label="Music" value={settings.music} onChange={set("music")} indent />
          <Slider label="Sounds" value={settings.sfx} onChange={set("sfx")} indent />
          <Slider label="Voice" value={settings.voice} onChange={set("voice")} indent />
        </div>
      </Panel>
    </div>
  );
}

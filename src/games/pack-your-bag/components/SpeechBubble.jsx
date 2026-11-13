import { useEffect, useState } from "react";

// Shows the latest message from the backpack, then fades it out.
export default function SpeechBubble({ bubble }) {
  const [shown, setShown] = useState(null);

  useEffect(() => {
    if (!bubble) return undefined;
    setShown(bubble);
    const id = setTimeout(() => setShown(null), bubble.ms || 2400);
    return () => clearTimeout(id);
  }, [bubble]);

  const tone = shown && /^oops/i.test(shown.text) ? "oops" : shown && /^(yes|great|excellent|good)/i.test(shown.text) ? "yay" : "";

  return (
    <div className="bubble-wrap" aria-live="polite">
      {shown && (
        <div key={shown.id} className={`bubble ${tone}`}>
          <span className="bubble-face" aria-hidden="true">{tone === "oops" ? "🙈" : tone === "yay" ? "🎉" : "🎒"}</span>
          <span>{shown.text}</span>
        </div>
      )}
    </div>
  );
}

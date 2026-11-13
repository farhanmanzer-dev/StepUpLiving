// A little hand that shows what to do: drag (item -> bag) or tap (to = null).
export default function HintHand({ hint }) {
  const to = hint.to || hint.from;
  const style = {
    "--fx": `${hint.from.x}px`,
    "--fy": `${hint.from.y}px`,
    "--tx": `${to.x}px`,
    "--ty": `${to.y}px`,
  };
  return (
    <div className={`hint-hand ${hint.to ? "drag" : "tap"}`} style={style} aria-hidden="true">
      👆
    </div>
  );
}

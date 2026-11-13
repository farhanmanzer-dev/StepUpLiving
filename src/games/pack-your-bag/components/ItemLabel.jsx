import { EMOJI } from "../game/items.js";

// Name tag that floats above the item under the pointer.
export default function ItemLabel({ label }) {
  return (
    <div className="item-label" style={{ left: label.x, top: label.y }}>
      <span aria-hidden="true">{EMOJI[label.name]}</span> {label.name}
    </div>
  );
}

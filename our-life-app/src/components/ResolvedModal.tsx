"use client";

import type { Item } from "@/lib/types";
import { Icon } from "@/components/Icon";

export function ResolvedModal({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const text = item.resolutionNote || item.ai?.outcome || item.text;

  return (
    <div
      className="overlay-backdrop center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="bloom-ring" />
        <button className="ci-close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <div className="check-badge">
          <Icon name="check" size={28} />
        </div>
        <div className="resolved-text">{text}</div>
        <div className="resolved-sub">Resolved together — not just ticked off.</div>
      </div>
    </div>
  );
}

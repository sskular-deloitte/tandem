"use client";

import { useState } from "react";
import type { Item, OwnershipResponse } from "@/lib/types";

const RESPONSES: { value: OwnershipResponse; label: string }[] = [
  { value: "take", label: "I'll take this" },
  { value: "together", label: "Let's do it together" },
  { value: "discuss", label: "Can we discuss it?" },
  { value: "not_now", label: "Not now" },
];

export function NegotiationSheet({
  item,
  onRespond,
  onClose,
}: {
  item: Item;
  onRespond: (response: OwnershipResponse) => Promise<void> | void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);

  function closeWith(cb?: () => void) {
    setClosing(true);
    setTimeout(() => {
      onClose();
      cb?.();
    }, 230);
  }

  async function handleRespond(response: OwnershipResponse) {
    setBusy(true);
    try {
      await onRespond(response);
      closeWith();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="overlay-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWith();
      }}
    >
      <div className={`sheet ${closing ? "closing" : ""}`}>
        <div className="sheet-handle" />
        <div className="sheet-item">{item.ai?.outcome ?? item.text}</div>
        <div className="sheet-sub">{item.ai?.nextStep ?? ""}</div>
        <div className="respond-grid">
          {RESPONSES.map((r) => (
            <button
              key={r.value}
              className="respond-btn"
              disabled={busy}
              onClick={() => handleRespond(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

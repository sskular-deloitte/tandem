"use client";

import { useState } from "react";
import Image from "next/image";
import type { Item, OwnershipResponse } from "@/lib/types";
import { Icon } from "@/components/Icon";

const RESPONSES: { value: OwnershipResponse; label: string; icon: string }[] = [
  { value: "take", label: "I'll take this", icon: "pan_tool" },
  { value: "together", label: "Let's do it together", icon: "diversity_1" },
  { value: "discuss", label: "Can we discuss it?", icon: "chat_bubble" },
  { value: "not_now", label: "Not now", icon: "bedtime" },
];

export function ItemDetailSheet({
  item,
  otherLabel,
  onSave,
  onShare,
  onRespond,
  onClose,
}: {
  item: Item;
  otherLabel: string;
  onSave: (updates: { outcome: string; nextStep: string; suggestedDate: string }) => Promise<void> | void;
  onShare: () => Promise<void> | void;
  onRespond: (response: OwnershipResponse) => Promise<void> | void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(item.ai?.outcome ?? item.text);
  const [nextStep, setNextStep] = useState(item.ai?.nextStep ?? "");
  const [suggestedDate, setSuggestedDate] = useState(item.ai?.suggestedDate ?? "");

  function closeWith(cb?: () => void) {
    setClosing(true);
    setTimeout(() => {
      onClose();
      cb?.();
    }, 230);
  }

  function saveField(field: "outcome" | "nextStep" | "suggestedDate", value: string) {
    onSave({
      outcome: field === "outcome" ? value : outcome,
      nextStep: field === "nextStep" ? value : nextStep,
      suggestedDate: field === "suggestedDate" ? value : suggestedDate,
    });
  }

  async function handleShare() {
    setBusy(true);
    try {
      await onShare();
      closeWith();
    } finally {
      setBusy(false);
    }
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

        {item.state === "resolved" && (
          <div className="text-center" style={{ marginBottom: 18, position: "relative" }}>
            <div className="bloom-ring" />
            <div className="check-badge" style={{ margin: "0 auto 10px" }}>
              <Icon name="check" size={24} />
            </div>
            <div className="resolved-sub">Resolved together — not just ticked off.</div>
          </div>
        )}

        <div className="sug-field">
          <div className="sug-label">Name</div>
          <textarea
            className="sug-value"
            rows={2}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            onBlur={(e) => saveField("outcome", e.target.value)}
          />
        </div>
        <div className="sug-field">
          <div className="sug-label">Description</div>
          <textarea
            className="sug-value"
            rows={2}
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            onBlur={(e) => saveField("nextStep", e.target.value)}
          />
        </div>
        <div className="sug-field">
          <div className="sug-label">Date</div>
          <input
            className="sug-value"
            value={suggestedDate}
            onChange={(e) => setSuggestedDate(e.target.value)}
            onBlur={(e) => saveField("suggestedDate", e.target.value)}
          />
        </div>

        {item.resolutionNote && (
          <div className="sheet-sub" style={{ marginTop: -4 }}>
            {item.resolutionNote}
          </div>
        )}

        {item.private && (
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 6 }}
            onClick={handleShare}
            disabled={busy}
          >
            <Icon name="diversity_1" size={16} /> Share with {otherLabel}
          </button>
        )}

        {item.state === "needs_agreement" && (
          <div style={{ marginTop: 14 }}>
            <Image
              src="/brand/untangling-together.webp"
              alt=""
              width={900}
              height={506}
              className="brand-inline"
              style={{ maxWidth: 160, marginBottom: 10 }}
            />
            <div className="respond-grid">
              {RESPONSES.map((r) => (
                <button
                  key={r.value}
                  className="respond-btn"
                  disabled={busy}
                  onClick={() => handleRespond(r.value)}
                >
                  <Icon name={r.icon} size={16} /> {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

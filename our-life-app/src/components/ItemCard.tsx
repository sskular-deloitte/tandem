"use client";

import { useState } from "react";
import type { Item, OwnershipResponse, UserId } from "@/lib/types";
import { USER_LABELS, otherUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { respondToItem, resolveItem, shareItem } from "@/lib/api";

const STATE_LABELS: Record<Item["state"], string> = {
  on_my_mind: "On my mind (private)",
  shared: "Shared",
  needs_agreement: "Needs agreement",
  agreed: "Agreed / Planned",
  resolved: "Resolved",
};

const STATE_COLORS: Record<Item["state"], string> = {
  on_my_mind: "bg-stone-100 text-stone-600",
  shared: "bg-sky-50 text-sky-700",
  needs_agreement: "bg-amber-50 text-amber-700",
  agreed: "bg-emerald-50 text-emerald-700",
  resolved: "bg-stone-200 text-stone-500",
};

const OWNERSHIP_OPTIONS: { value: OwnershipResponse; label: string }[] = [
  { value: "take", label: "I'll take this" },
  { value: "together", label: "Let's do it together" },
  { value: "discuss", label: "Can we discuss it?" },
  { value: "not_now", label: "Not now" },
];

function ownerLabel(item: Item, viewer: UserId): string {
  if (!item.ownerType) return "Not agreed";
  if (item.ownerType === "together") return "Together";
  return item.ownerType === viewer ? "Me" : USER_LABELS[item.ownerType];
}

export function ItemCard({
  item,
  viewer,
  onChange,
}: {
  item: Item;
  viewer: UserId;
  onChange: (updated: Item) => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const canRespond =
    item.state === "needs_agreement" &&
    item.createdBy !== viewer &&
    !item.ownershipResponse;

  const canShare = item.private && item.createdBy === viewer;

  const canResolve = item.state === "agreed";

  async function handleShare() {
    setBusy(true);
    try {
      const updated = await shareItem(item.id);
      onChange(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleRespond(response: OwnershipResponse) {
    setBusy(true);
    try {
      const updated = await respondToItem(item.id, response, viewer);
      onChange(updated);
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      const updated = await resolveItem(item.id, note.trim());
      onChange(updated);
      setResolving(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-stone-900 font-medium">{item.text}</p>
        <span
          className={`shrink-0 text-xs px-2 py-1 rounded-full ${STATE_COLORS[item.state]}`}
        >
          {STATE_LABELS[item.state]}
        </span>
      </div>

      {item.ai && (
        <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-sm">
          <p className="text-[11px] uppercase tracking-wide text-stone-400 font-medium">
            AI suggestion {item.ai.isFallback ? "(offline fallback)" : ""}
          </p>
          <p>
            <span className="text-stone-400">Outcome: </span>
            <span className="text-stone-700">{item.ai.outcome}</span>
          </p>
          <p>
            <span className="text-stone-400">Next step: </span>
            <span className="text-stone-700">{item.ai.nextStep}</span>
          </p>
          <p>
            <span className="text-stone-400">Suggested date: </span>
            <span className="text-stone-700">{item.ai.suggestedDate}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          Captured by{" "}
          {item.createdBy === viewer ? "me" : USER_LABELS[item.createdBy]}
        </span>
        <span>Owner: {ownerLabel(item, viewer)}</span>
      </div>

      {item.resolutionNote && (
        <p className="text-sm text-stone-600 italic bg-emerald-50 rounded-xl p-3">
          &ldquo;{item.resolutionNote}&rdquo;
        </p>
      )}

      {canShare && (
        <Button size="sm" variant="secondary" onClick={handleShare} disabled={busy}>
          Share with {USER_LABELS[otherUser(viewer)]}
        </Button>
      )}

      {canRespond && (
        <div className="flex flex-wrap gap-2 pt-1">
          {OWNERSHIP_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => handleRespond(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}

      {canResolve && !resolving && (
        <Button size="sm" variant="secondary" onClick={() => setResolving(true)}>
          Mark resolved
        </Button>
      )}

      {canResolve && resolving && (
        <div className="space-y-2 pt-1">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Nursery contacted, dates confirmed"
            className="w-full rounded-xl border border-stone-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleResolve} disabled={busy || !note.trim()}>
              Confirm resolved
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setResolving(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

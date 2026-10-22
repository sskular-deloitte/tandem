"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { fetchItems, respondToItem } from "@/lib/api";
import type { Item, ItemState, OwnershipResponse } from "@/lib/types";
import { USER_AVATAR_CLASS, USER_INITIAL, USER_LABELS } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { NegotiationSheet } from "@/components/NegotiationSheet";
import { ResolvedModal } from "@/components/ResolvedModal";
import { useToast } from "@/components/Toast";
import { BottomNav } from "@/components/BottomNav";

const POLL_MS = 3000;

const SECTIONS: {
  key: ItemState;
  label: string;
  dot: string;
  empty: string;
}[] = [
  { key: "on_my_mind", label: "On my mind", dot: "#C9BFB3", empty: "Nothing private right now." },
  { key: "shared", label: "Shared", dot: "var(--tertiary)", empty: "Nothing freshly shared." },
  { key: "needs_agreement", label: "Needs agreement", dot: "var(--accent)", empty: "Nothing waiting on agreement." },
  { key: "agreed", label: "Agreed / Planned", dot: "var(--sage-dark)", empty: "Nothing agreed yet." },
  { key: "resolved", label: "Resolved", dot: "var(--sage)", empty: "Nothing resolved yet." },
];

export default function AppPage() {
  const router = useRouter();
  const { userId, clearUserId, loaded } = useIdentity();
  const toast = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [mountedAt, setMountedAt] = useState<number | null>(null);
  const [negotiatingItem, setNegotiatingItem] = useState<Item | null>(null);
  const [resolvedItem, setResolvedItem] = useState<Item | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const fresh = await fetchItems(userId);
    setItems(fresh);
  }, [userId]);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  useEffect(() => {
    setMountedAt(Date.now());
  }, []);

  useEffect(() => {
    if (!userId) return;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [userId, refresh]);

  if (!loaded || !userId) return null;

  function handleCardClick(item: Item) {
    if (item.state === "needs_agreement") {
      setNegotiatingItem(item);
    } else if (item.state === "resolved") {
      setResolvedItem(item);
    }
  }

  async function handleRespond(response: OwnershipResponse) {
    if (!negotiatingItem || !userId) return;
    await respondToItem(negotiatingItem.id, response, userId);
    if (response === "take" || response === "together") {
      toast("Agreed — moved to Agreed/Planned.");
    } else if (response === "discuss") {
      toast("Noted — flagged to discuss together.");
    } else if (response === "not_now") {
      toast("No problem — it'll stay visible for later.");
    }
    refresh();
  }

  return (
    <main className="min-h-screen px-5 py-8 pb-28">
      <div className="w-full max-w-[760px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`mini-avatar ${USER_AVATAR_CLASS[userId]}`}>
              {USER_INITIAL[userId]}
            </div>
            <div>
              <div className="font-bold text-[15px]">
                {USER_LABELS[userId]}
              </div>
              <div className="text-xs text-[var(--text-soft)]">
                Our shared space
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap justify-end">
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                if (!confirm("Reset all demo data for both William and Sam?")) return;
                await fetch("/api/reset", { method: "POST" });
                refresh();
              }}
            >
              Reset demo
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearUserId();
                router.push("/");
              }}
            >
              Switch
            </button>
          </div>
        </div>

        {SECTIONS.map((section) => {
          const sectionItems = items
            .filter((i) => i.state === section.key)
            .sort((a, b) => b.updatedAt - a.updatedAt);
          return (
            <div key={section.key}>
              <div className="section-label">
                <span className="section-dot" style={{ background: section.dot }} />
                {section.label} ({sectionItems.length})
              </div>
              {sectionItems.length === 0 && (
                <div className="empty-note">{section.empty}</div>
              )}
              {sectionItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  justAdded={mountedAt !== null && item.createdAt > mountedAt}
                  onClick={
                    item.state === "needs_agreement" || item.state === "resolved"
                      ? () => handleCardClick(item)
                      : undefined
                  }
                />
              ))}
            </div>
          );
        })}
      </div>

      {negotiatingItem && (
        <NegotiationSheet
          item={negotiatingItem}
          onRespond={handleRespond}
          onClose={() => setNegotiatingItem(null)}
        />
      )}
      {resolvedItem && (
        <ResolvedModal item={resolvedItem} onClose={() => setResolvedItem(null)} />
      )}
      <BottomNav />
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useIdentity } from "@/lib/useIdentity";
import { fetchItems } from "@/lib/api";
import type { Item, ItemState } from "@/lib/types";
import { USER_LABELS, otherUser } from "@/lib/types";
import { CaptureForm } from "@/components/CaptureForm";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";

const POLL_MS = 3000;

const GROUPS: { state: ItemState; title: string }[] = [
  { state: "on_my_mind", title: "On my mind" },
  { state: "needs_agreement", title: "Needs agreement" },
  { state: "shared", title: "Shared" },
  { state: "agreed", title: "Agreed / Planned" },
  { state: "resolved", title: "Resolved" },
];

export default function AppPage() {
  const router = useRouter();
  const { userId, clearUserId, loaded } = useIdentity();
  const [items, setItems] = useState<Item[]>([]);
  const [lastSync, setLastSync] = useState<number>(0);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const fresh = await fetchItems(userId);
    setItems(fresh);
    setLastSync(Date.now());
  }, [userId]);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  useEffect(() => {
    if (!userId) return;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [userId, refresh]);

  if (!loaded || !userId) return null;

  function handleItemChange(updated: Item) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleCreated(item: Item) {
    setItems((prev) => [item, ...prev]);
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-stone-900">Our Life</p>
            <p className="text-xs text-stone-400">
              Signed in as {USER_LABELS[userId]} · partner:{" "}
              {USER_LABELS[otherUser(userId)]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/checkin">
              <Button size="sm" variant="secondary">
                Check-in
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => { clearUserId(); router.push("/"); }}>
              Switch
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <CaptureForm userId={userId} onCreated={handleCreated} />

        <p className="text-[11px] text-stone-400 text-right">
          Synced {lastSync ? "just now" : "..."}
        </p>

        {GROUPS.map((group) => {
          const groupItems = items.filter((i) => i.state === group.state);
          if (groupItems.length === 0) return null;
          return (
            <section key={group.state} className="space-y-2">
              <h2 className="text-sm font-medium text-stone-500">
                {group.title} ({groupItems.length})
              </h2>
              <div className="space-y-2">
                {groupItems
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      viewer={userId}
                      onChange={handleItemChange}
                    />
                  ))}
              </div>
            </section>
          );
        })}

        {items.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-10">
            Nothing on your mind yet. Capture something above to get started.
          </p>
        )}
      </div>
    </main>
  );
}

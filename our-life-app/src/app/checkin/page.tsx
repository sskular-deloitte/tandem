"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useIdentity } from "@/lib/useIdentity";
import { fetchItems } from "@/lib/api";
import type { Item } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";

interface Prompt {
  title: string;
  question: string;
  filter: (item: Item) => boolean;
}

const PROMPTS: Prompt[] = [
  {
    title: "Needs a decision",
    question: "What needs a decision this week?",
    filter: (i) => i.state === "needs_agreement",
  },
  {
    title: "Upcoming actions",
    question: "What's planned and coming up?",
    filter: (i) => i.state === "agreed",
  },
  {
    title: "Still on someone's mind",
    question: "Is anything private that should be shared?",
    filter: (i) => i.state === "on_my_mind",
  },
  {
    title: "Recent wins",
    question: "What got resolved recently?",
    filter: (i) => i.state === "resolved",
  },
];

export default function CheckinPage() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const [items, setItems] = useState<Item[]>([]);
  const [step, setStep] = useState(0);
  const [loadedItems, setLoadedItems] = useState(false);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  useEffect(() => {
    if (!userId) return;
    fetchItems(userId).then((fresh) => {
      setItems(fresh);
      setLoadedItems(true);
    });
  }, [userId]);

  if (!loaded || !userId || !loadedItems) return null;

  function handleChange(updated: Item) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  const isDone = step >= PROMPTS.length;

  if (isDone) {
    const resolvedCount = items.filter((i) => i.state === "resolved").length;
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white rounded-2xl border border-stone-200 p-8">
          <h1 className="text-xl font-semibold text-stone-900">
            Check-in complete
          </h1>
          <p className="text-stone-500 text-sm">
            You reviewed {PROMPTS.length} areas. {resolvedCount} items are
            currently resolved.
          </p>
          <Link href="/app">
            <Button>Back to inbox</Button>
          </Link>
        </div>
      </main>
    );
  }

  const prompt = PROMPTS[step];
  const relevantItems = items.filter(prompt.filter);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="font-semibold text-stone-900">Weekly check-in</p>
          <Link href="/app">
            <Button size="sm" variant="ghost">
              Exit
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center gap-1">
          {PROMPTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i <= step ? "bg-stone-800" : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-medium text-stone-900">
            {prompt.question}
          </h2>
          <p className="text-xs text-stone-400">{prompt.title}</p>
        </div>

        <div className="space-y-2">
          {relevantItems.length === 0 && (
            <p className="text-center text-sm text-stone-400 py-6">
              Nothing here right now.
            </p>
          )}
          {relevantItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              viewer={userId}
              onChange={handleChange}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={() => setStep((s) => s + 1)}>
            {step === PROMPTS.length - 1 ? "Finish check-in" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  );
}

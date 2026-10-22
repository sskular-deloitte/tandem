"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createItem } from "@/lib/api";
import type { Item, UserId } from "@/lib/types";

export function CaptureForm({
  userId,
  onCreated,
}: {
  userId: UserId;
  onCreated: (item: Item) => void;
}) {
  const [text, setText] = useState("");
  const [choosing, setChoosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function startCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setChoosing(true);
  }

  async function finalize(isPrivate: boolean) {
    setSubmitting(true);
    try {
      const item = await createItem(text.trim(), userId, isPrivate);
      onCreated(item);
      setText("");
      setChoosing(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
      {!choosing ? (
        <form onSubmit={startCapture} className="space-y-3">
          <label className="block text-sm text-stone-500">
            What&apos;s on your mind?
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. the boiler is making a noise"
            rows={2}
            className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          />
          <Button type="submit" disabled={!text.trim()}>
            Save
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            &ldquo;{text}&rdquo; — keep this private, or share it now?
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => finalize(true)}
            >
              Keep private
            </Button>
            <Button disabled={submitting} onClick={() => finalize(false)}>
              Share now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

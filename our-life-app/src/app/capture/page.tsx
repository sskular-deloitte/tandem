"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { createItem, structureText } from "@/lib/api";
import type { AiSuggestion, SuggestedOwner } from "@/lib/types";
import { USER_LABELS, otherUser } from "@/lib/types";

type Step = "write" | "share" | "thinking" | "suggest";

const OWNER_OPTIONS: { value: SuggestedOwner; label: (other: string) => string }[] = [
  { value: "creator", label: () => "Me" },
  { value: "partner", label: (other) => other },
  { value: "together", label: () => "Together" },
  { value: "not_agreed", label: () => "Not agreed" },
];

export default function CapturePage() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const [step, setStep] = useState<Step>("write");
  const [text, setText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<SuggestedOwner | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  if (!loaded || !userId) return null;

  const currentUserId = userId;
  const other = USER_LABELS[otherUser(currentUserId)];

  function handleSave() {
    if (!text.trim()) return;
    setStep("share");
  }

  async function choosePrivacy(privateChoice: boolean) {
    setIsPrivate(privateChoice);
    setStep("thinking");
    const ai = await structureText(text.trim());
    setSuggestion(ai);
    setSelectedOwner(null);
    setStep("suggest");
  }

  async function confirmAndSave() {
    if (!suggestion) return;
    setSaving(true);
    try {
      await createItem(text.trim(), currentUserId, isPrivate, {
        ...suggestion,
        suggestedOwner: selectedOwner ?? suggestion.suggestedOwner,
      });
      router.push("/app");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[560px]">
        {step === "write" && (
          <>
            <div className="text-center mb-[26px]">
              <div className="eyebrow">
                Hi, <span>{USER_LABELS[userId]}</span>
              </div>
              <h1 className="page-title">What&apos;s on your mind?</h1>
            </div>
            <textarea
              ref={textareaRef}
              autoFocus
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="e.g. the boiler is making a noise..."
              className="capture-input"
            />
            <div className="flex justify-center mt-5">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!text.trim()}
              >
                Save
              </button>
            </div>
            <p className="hint">
              No category, deadline, or owner needed. Just get it out of your
              head.
            </p>
          </>
        )}

        {step === "share" && (
          <>
            <p className="page-subtitle text-center !mb-0">
              Keep this to yourself, or let {other} see it?
            </p>
            <div className="flex gap-4 mt-7">
              <div
                className="card choice-card"
                onClick={() => choosePrivacy(true)}
              >
                <div className="choice-icon">🔒</div>
                <div className="choice-title">Keep private</div>
                <div className="choice-sub">Only visible to you</div>
              </div>
              <div
                className="card choice-card"
                onClick={() => choosePrivacy(false)}
              >
                <div className="choice-icon">🤝</div>
                <div className="choice-title">Share now</div>
                <div className="choice-sub">Visible to you both</div>
              </div>
            </div>
          </>
        )}

        {(step === "thinking" || step === "suggest") && (
          <>
            <div className="eyebrow text-center">Turning that into a plan</div>
            <div className="card quote-card">&ldquo;{text}&rdquo;</div>

            {step === "thinking" && (
              <div className="flex items-center gap-2.5 justify-center py-10 text-[var(--text-soft)] font-bold">
                Thinking it through
                <span className="think-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}

            {step === "suggest" && suggestion && (
              <div className="card" style={{ padding: 26 }}>
                <div className="ai-tag">✨ AI suggested — not a fact</div>

                <EditableField
                  label="Suggested outcome"
                  value={suggestion.outcome}
                  onChange={(v) =>
                    setSuggestion((s) => (s ? { ...s, outcome: v } : s))
                  }
                />
                <EditableField
                  label="Suggested next step"
                  value={suggestion.nextStep}
                  onChange={(v) =>
                    setSuggestion((s) => (s ? { ...s, nextStep: v } : s))
                  }
                />
                <EditableField
                  label="Suggested date"
                  value={suggestion.suggestedDate}
                  onChange={(v) =>
                    setSuggestion((s) => (s ? { ...s, suggestedDate: v } : s))
                  }
                />

                <div className="sug-field">
                  <div className="sug-label">Suggested ownership</div>
                  <div className="chip-row">
                    {OWNER_OPTIONS.map((opt) => {
                      const current = selectedOwner ?? suggestion.suggestedOwner;
                      return (
                        <button
                          key={opt.value}
                          className={`chip ${current === opt.value ? "selected" : ""}`}
                          onClick={() => setSelectedOwner(opt.value)}
                        >
                          {opt.label(other)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center mt-[22px]">
                  <button
                    className="btn btn-primary"
                    onClick={confirmAndSave}
                    disabled={saving}
                  >
                    Looks good, save it
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sug-field">
      <div className="sug-label">
        {label} <span className="pencil">✎ edit</span>
      </div>
      <textarea
        className="sug-value"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

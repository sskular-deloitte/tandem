"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { createItem, structureText } from "@/lib/api";
import { useSpeechToText } from "@/lib/useSpeechToText";
import { USER_LABELS } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { BottomNav } from "@/components/BottomNav";

type Step = "write" | "thinking";

// Next.js's client router cache can reuse an already-mounted /capture
// instance when navigating to it again, which would otherwise leave stale
// text/suggestion state from the previous capture. Keying the wizard on a
// query param that changes on every "+ New" click forces a fresh mount.
export default function CapturePage() {
  return (
    <Suspense fallback={null}>
      <CapturePageInner />
    </Suspense>
  );
}

function CapturePageInner() {
  const searchParams = useSearchParams();
  return <CaptureWizard key={searchParams.get("n") ?? "default"} />;
}

function CaptureWizard() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const [step, setStep] = useState<Step>("write");
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const speech = useSpeechToText({
    onResult: (transcript) => {
      setText((prev) => (prev && !prev.endsWith(" ") ? prev + " " : prev) + transcript);
    },
  });

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  if (!loaded || !userId) return null;

  const currentUserId = userId;

  // Every new entry is kept private by default - the user can share it from
  // the "Shared" tab whenever they're ready. The AI fills in sensible
  // outcome/next-step/date/owner details automatically; nothing requires a
  // separate review step before saving.
  async function handleSave() {
    if (!text.trim()) return;
    if (speech.listening) speech.stop();
    setStep("thinking");
    const ai = await structureText(text.trim());
    await createItem(text.trim(), currentUserId, true, ai);
    router.push("/app");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16 pb-28">
      <div className="w-full max-w-[560px]">
        {step === "write" && (
          <>
            <div className="text-center mb-[26px]">
              <div className="eyebrow">
                Hi, <span>{USER_LABELS[userId]}</span>
              </div>
              <h1 className="page-title">What&apos;s on your mind?</h1>
            </div>
            <div className="capture-input-wrap">
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
              {speech.supported && (
                <button
                  type="button"
                  className={`mic-btn ${speech.listening ? "listening" : ""}`}
                  onClick={() => (speech.listening ? speech.stop() : speech.start())}
                  aria-label={speech.listening ? "Stop voice input" : "Start voice input"}
                  aria-pressed={speech.listening}
                >
                  <Icon name={speech.listening ? "stop" : "mic"} size={20} filled={speech.listening} />
                </button>
              )}
            </div>
            {speech.listening && (
              <p className="hint mic-hint">
                <span className="think-dots">
                  <span />
                  <span />
                  <span />
                </span>
                Listening...
              </p>
            )}
            {speech.error && (
              <p className="hint mic-error">
                Couldn&apos;t hear you — you can still type instead.
              </p>
            )}
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
              head{speech.supported ? ", by typing or speaking" : ""}.
            </p>
          </>
        )}

        {step === "thinking" && (
          <>
            <div className="eyebrow text-center">Turning that into a plan</div>
            <div className="card quote-card">&ldquo;{text}&rdquo;</div>
            <div className="flex items-center gap-2.5 justify-center py-10 text-[var(--text-soft)] font-bold">
              Thinking it through
              <span className="think-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

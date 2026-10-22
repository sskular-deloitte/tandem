"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { ONBOARDING_QUESTIONS } from "@/lib/onboardingQuestions";
import { BottomNav } from "@/components/BottomNav";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  if (!loaded || !userId) return null;

  const question = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;

  async function finish(finalAnswers: Record<string, string>) {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers: finalAnswers }),
      });
    } finally {
      router.push("/app");
    }
  }

  function advance() {
    const updated = { ...answers, [question.key]: value };
    setAnswers(updated);
    setValue("");
    if (isLast) {
      finish(updated);
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    setValue("");
    if (isLast) {
      finish(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16 pb-28">
      <div className="w-full max-w-[560px]">
        <div className="ob-dots">
          {ONBOARDING_QUESTIONS.map((q, i) => (
            <div key={q.key} className={`ob-dot ${i <= step ? "on" : ""}`} />
          ))}
        </div>

        <div className="card ob-card">
          <div className="ob-q">{question.label}</div>
          <textarea
            key={question.key}
            autoFocus
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type an answer, or just skip..."
            className="ob-input"
          />
          <div className="ob-actions">
            <button className="btn-text" onClick={skip} disabled={saving}>
              Skip
            </button>
            <button className="btn btn-primary" onClick={advance} disabled={saving}>
              {isLast ? "Let's go" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

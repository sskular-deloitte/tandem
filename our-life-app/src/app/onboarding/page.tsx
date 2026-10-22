"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { ONBOARDING_QUESTIONS } from "@/lib/onboardingQuestions";
import { Button } from "@/components/ui/button";
import { USER_LABELS } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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

  function next(value: string) {
    const updated = { ...answers, [question.key]: value };
    setAnswers(updated);
    if (isLast) {
      finish(updated);
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    if (isLast) {
      finish(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-1">
          <p className="text-sm text-stone-400">
            Hi {USER_LABELS[userId]} — getting to know your household
          </p>
          <div className="flex justify-center gap-1 pt-1">
            {ONBOARDING_QUESTIONS.map((q, i) => (
              <div
                key={q.key}
                className={`h-1.5 w-6 rounded-full ${
                  i <= step ? "bg-stone-800" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        </div>

        <OnboardingForm
          key={question.key}
          question={question}
          onSubmit={next}
          onSkip={skip}
          saving={saving}
          isLast={isLast}
        />
      </div>
    </main>
  );
}

function OnboardingForm({
  question,
  onSubmit,
  onSkip,
  saving,
  isLast,
}: {
  question: { key: string; label: string; placeholder: string };
  onSubmit: (value: string) => void;
  onSkip: () => void;
  saving: boolean;
  isLast: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
      <p className="text-lg font-medium text-stone-900">{question.label}</p>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={question.placeholder}
        rows={3}
        className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
      />
      <div className="flex justify-between gap-2">
        <Button variant="ghost" onClick={onSkip} disabled={saving}>
          Skip
        </Button>
        <Button
          onClick={() => onSubmit(value)}
          disabled={saving || !value.trim()}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

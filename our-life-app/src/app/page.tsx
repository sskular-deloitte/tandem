"use client";

import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import { USER_LABELS, type UserId } from "@/lib/types";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { userId, setUserId, loaded } = useIdentity();

  useEffect(() => {
    if (loaded && userId) {
      router.replace("/app");
    }
  }, [loaded, userId, router]);

  function choose(id: UserId) {
    setUserId(id);
    router.push("/onboarding");
  }

  if (!loaded) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">Our Life</h1>
          <p className="text-stone-500">
            Get it out of your head. Make it visible. Work it out together.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-stone-500">Who&apos;s this?</p>
          <div className="grid grid-cols-2 gap-3">
            {(["william", "sam"] as UserId[]).map((id) => (
              <button
                key={id}
                onClick={() => choose(id)}
                className="rounded-2xl border border-stone-200 bg-white p-6 hover:border-stone-400 hover:shadow-sm transition-all"
              >
                <div className="text-lg font-medium text-stone-900">
                  {USER_LABELS[id]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-stone-400">
          Demo mode — no account needed. Open this page in a second window and
          pick the other person to try it together.
        </p>
      </div>
    </main>
  );
}

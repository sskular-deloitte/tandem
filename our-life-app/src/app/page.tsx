"use client";

import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/useIdentity";
import type { UserId } from "@/lib/types";
import { useEffect } from "react";

const IDENTITIES: {
  id: UserId;
  name: string;
  avatarClass: string;
  initial: string;
}[] = [
  { id: "william", name: "William", avatarClass: "avatar-william", initial: "W" },
  { id: "sam", name: "Sam", avatarClass: "avatar-sam", initial: "S" },
];

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
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[560px] text-center">
        <div className="eyebrow">Welcome back</div>
        <h1 className="page-title">Who&apos;s using this?</h1>
        <p className="page-subtitle">No password needed — just pick yourself.</p>

        <div className="flex gap-[18px] justify-center flex-wrap">
          {IDENTITIES.map((identity) => (
            <div
              key={identity.id}
              className="card id-card"
              onClick={() => choose(identity.id)}
            >
              <div className={`id-avatar ${identity.avatarClass}`}>
                {identity.initial}
              </div>
              <div className="id-name">{identity.name}</div>
              <div className="id-sub">Continue as {identity.name}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getOnboarding, saveOnboarding } from "@/lib/store";
import type { UserId } from "@/lib/types";

export async function GET() {
  const state = await getOnboarding();
  return NextResponse.json({ onboarding: state });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, answers } = body as {
    userId: UserId;
    answers: Record<string, string>;
  };

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const state = await getOnboarding();
  state[userId] = answers;
  await saveOnboarding(state);

  return NextResponse.json({ onboarding: state });
}

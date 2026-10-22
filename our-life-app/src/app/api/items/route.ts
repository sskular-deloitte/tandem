import { NextRequest, NextResponse } from "next/server";
import { addItem, getAllItems } from "@/lib/store";
import type { AiSuggestion, Item, UserId } from "@/lib/types";

function visibleTo(items: Item[], userId: UserId): Item[] {
  return items.filter((item) => !item.private || item.createdBy === userId);
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") as UserId | null;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const items = await getAllItems();
  return NextResponse.json({ items: visibleTo(items, userId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, createdBy, isPrivate, ai } = body as {
    text: string;
    createdBy: UserId;
    isPrivate: boolean;
    ai: AiSuggestion;
  };

  if (!text || !createdBy || !ai) {
    return NextResponse.json(
      { error: "text, createdBy and ai required" },
      { status: 400 }
    );
  }

  const now = Date.now();
  const item: Item = {
    id: `item_${now}_${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdBy,
    private: isPrivate,
    state: isPrivate ? "on_my_mind" : "needs_agreement",
    ai,
    ownershipResponse: null,
    ownerType: null,
    resolutionNote: null,
    createdAt: now,
    updatedAt: now,
  };

  await addItem(item);

  return NextResponse.json({ item });
}

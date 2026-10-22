import { NextRequest, NextResponse } from "next/server";
import { addItem, getAllItems } from "@/lib/store";
import { structureEntry } from "@/lib/ai";
import type { Item, UserId } from "@/lib/types";

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
  const { text, createdBy, isPrivate } = body as {
    text: string;
    createdBy: UserId;
    isPrivate: boolean;
  };

  if (!text || !createdBy) {
    return NextResponse.json(
      { error: "text and createdBy required" },
      { status: 400 }
    );
  }

  const ai = await structureEntry(text);

  const now = Date.now();
  const item: Item = {
    id: `item_${now}_${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdBy,
    private: isPrivate,
    state: isPrivate ? "on_my_mind" : "shared",
    ai,
    ownershipResponse: null,
    ownerType: null,
    resolutionNote: null,
    createdAt: now,
    updatedAt: now,
  };

  if (!isPrivate) {
    item.state = "needs_agreement";
  }

  await addItem(item);

  return NextResponse.json({ item });
}

import { NextRequest, NextResponse } from "next/server";
import { getItem, updateItem } from "@/lib/store";
import type {
  Item,
  ItemState,
  OwnershipResponse,
  UserId,
} from "@/lib/types";

type EditableFields = {
  outcome: string;
  nextStep: string;
  suggestedDate: string;
};

type Action =
  | { type: "share" }
  | { type: "respond"; response: OwnershipResponse; respondingUser: UserId }
  | { type: "resolve"; note: string }
  | { type: "edit"; updates: EditableFields };

function applyOwnershipResponse(
  item: Item,
  response: OwnershipResponse,
  respondingUser: UserId
): Partial<Item> {
  switch (response) {
    case "take":
      return {
        ownershipResponse: response,
        ownerType: respondingUser,
        state: "agreed" as ItemState,
      };
    case "together":
      return {
        ownershipResponse: response,
        ownerType: "together",
        state: "agreed" as ItemState,
      };
    case "discuss":
    case "not_now":
      // Stays in needs_agreement - these responses acknowledge the item
      // without resolving ownership, matching the prototype's behaviour of
      // just showing a toast rather than moving the item.
      return { ownershipResponse: response };
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const action = (await req.json()) as Action;

  let updates: Partial<Item> = {};

  if (action.type === "share") {
    updates = { private: false, state: "needs_agreement" };
  } else if (action.type === "respond") {
    updates = applyOwnershipResponse(
      { ownerType: null } as Item,
      action.response,
      action.respondingUser
    );
  } else if (action.type === "resolve") {
    updates = { state: "resolved", resolutionNote: action.note };
  } else if (action.type === "edit") {
    const existing = await getItem(id);
    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    updates = {
      ai: existing.ai
        ? { ...existing.ai, ...action.updates }
        : {
            ...action.updates,
            suggestedOwner: "not_agreed",
            neutralShareText: action.updates.outcome,
            isFallback: false,
          },
    };
  }

  const item = await updateItem(id, updates);
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

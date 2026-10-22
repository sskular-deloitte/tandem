import { NextRequest, NextResponse } from "next/server";
import { updateItem } from "@/lib/store";
import type {
  Item,
  ItemState,
  OwnershipResponse,
  UserId,
} from "@/lib/types";

type Action =
  | { type: "share" }
  | { type: "respond"; response: OwnershipResponse; respondingUser: UserId }
  | { type: "resolve"; note: string };

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
      return {
        ownershipResponse: response,
        state: "needs_agreement" as ItemState,
      };
    case "not_now":
      return {
        ownershipResponse: response,
        state: "shared" as ItemState,
      };
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
  }

  const item = await updateItem(id, updates);
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

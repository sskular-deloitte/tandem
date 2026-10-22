import type { AiSuggestion, Item, OwnershipResponse, UserId } from "./types";

export async function fetchItems(userId: UserId): Promise<Item[]> {
  const res = await fetch(`/api/items?userId=${userId}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items as Item[];
}

export async function structureText(text: string): Promise<AiSuggestion> {
  const res = await fetch("/api/structure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return data.ai as AiSuggestion;
}

export async function createItem(
  text: string,
  createdBy: UserId,
  isPrivate: boolean,
  ai: AiSuggestion
): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, createdBy, isPrivate, ai }),
  });
  const data = await res.json();
  return data.item as Item;
}

export async function shareItem(id: string): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "share" }),
  });
  const data = await res.json();
  return data.item as Item;
}

export async function respondToItem(
  id: string,
  response: OwnershipResponse,
  respondingUser: UserId
): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "respond", response, respondingUser }),
  });
  const data = await res.json();
  return data.item as Item;
}

export async function resolveItem(id: string, note: string): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "resolve", note }),
  });
  const data = await res.json();
  return data.item as Item;
}

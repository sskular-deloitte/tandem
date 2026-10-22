import type { Item, OwnershipResponse, UserId } from "./types";

export async function fetchItems(userId: UserId): Promise<Item[]> {
  const res = await fetch(`/api/items?userId=${userId}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items as Item[];
}

export async function createItem(
  text: string,
  createdBy: UserId,
  isPrivate: boolean
): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, createdBy, isPrivate }),
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

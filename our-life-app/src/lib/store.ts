import { Redis } from "@upstash/redis";
import type { Item, OnboardingState } from "./types";

const ITEMS_KEY = "our-life:items";
const ONBOARDING_KEY = "our-life:onboarding";

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

// Local in-memory fallback so the app is usable in local dev before
// Upstash credentials are configured. Not suitable for production/Vercel
// since serverless invocations don't share memory across requests.
const memory: { items: Item[]; onboarding: OnboardingState } = {
  items: [],
  onboarding: {},
};

export async function getAllItems(): Promise<Item[]> {
  if (redis) {
    const raw = await redis.get<Item[]>(ITEMS_KEY);
    return raw ?? [];
  }
  return memory.items;
}

export async function saveAllItems(items: Item[]): Promise<void> {
  if (redis) {
    await redis.set(ITEMS_KEY, items);
    return;
  }
  memory.items = items;
}

export async function addItem(item: Item): Promise<void> {
  const items = await getAllItems();
  items.push(item);
  await saveAllItems(items);
}

export async function updateItem(
  id: string,
  updates: Partial<Item>
): Promise<Item | null> {
  const items = await getAllItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: Date.now() };
  await saveAllItems(items);
  return items[idx];
}

export async function getOnboarding(): Promise<OnboardingState> {
  if (redis) {
    const raw = await redis.get<OnboardingState>(ONBOARDING_KEY);
    return raw ?? {};
  }
  return memory.onboarding;
}

export async function saveOnboarding(state: OnboardingState): Promise<void> {
  if (redis) {
    await redis.set(ONBOARDING_KEY, state);
    return;
  }
  memory.onboarding = state;
}

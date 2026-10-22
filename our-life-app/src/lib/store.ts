import { Redis } from "@upstash/redis";
import type { Item, OnboardingState } from "./types";

// Items are stored as individual fields in a single Redis hash, keyed by
// item id. This means concurrent writes from two browser windows each only
// touch their own field (HSET), avoiding the race condition of a
// read-whole-array -> modify -> write-whole-array pattern where one
// request's write can silently clobber another's.
const ITEMS_HASH_KEY = "our-life:items";
const ONBOARDING_KEY = "our-life:onboarding";

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

// Local in-memory fallback so the app is usable in local dev before
// Upstash credentials are configured. Not suitable for production/Vercel
// since serverless invocations don't share memory across requests.
const memory: { items: Map<string, Item>; onboarding: OnboardingState } = {
  items: new Map(),
  onboarding: {},
};

export async function getAllItems(): Promise<Item[]> {
  if (redis) {
    const all = await redis.hgetall<Record<string, Item>>(ITEMS_HASH_KEY);
    return all ? Object.values(all) : [];
  }
  return Array.from(memory.items.values());
}

export async function addItem(item: Item): Promise<void> {
  if (redis) {
    await redis.hset(ITEMS_HASH_KEY, { [item.id]: item });
    return;
  }
  memory.items.set(item.id, item);
}

export async function updateItem(
  id: string,
  updates: Partial<Item>
): Promise<Item | null> {
  if (redis) {
    const existing = await redis.hget<Item>(ITEMS_HASH_KEY, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await redis.hset(ITEMS_HASH_KEY, { [id]: updated });
    return updated;
  }
  const existing = memory.items.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  memory.items.set(id, updated);
  return updated;
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

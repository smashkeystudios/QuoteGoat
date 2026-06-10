import { kv } from "@vercel/kv";

export async function getKV<T>(key: string): Promise<T | null> {
  return kv.get<T>(key);
}

export async function setKV(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
  if (opts?.ex) {
    await kv.set(key, value, { ex: opts.ex });
  } else {
    await kv.set(key, value);
  }
}

export async function delKV(key: string): Promise<void> {
  await kv.del(key);
}

export async function appendToList<T>(listKey: string, item: T): Promise<T[]> {
  const existing = (await kv.get<T[]>(listKey)) ?? [];
  const updated = [...existing, item];
  await kv.set(listKey, updated);
  return updated;
}

export async function prependToList<T>(listKey: string, item: T): Promise<T[]> {
  const existing = (await kv.get<T[]>(listKey)) ?? [];
  const updated = [item, ...existing];
  await kv.set(listKey, updated);
  return updated;
}

export async function removeFromList<T>(
  listKey: string,
  predicate: (item: T) => boolean
): Promise<T[]> {
  const existing = (await kv.get<T[]>(listKey)) ?? [];
  const updated = existing.filter((item) => !predicate(item));
  await kv.set(listKey, updated);
  return updated;
}

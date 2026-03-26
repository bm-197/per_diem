import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const DEFAULT_TTL = 300; // 5 minutes in seconds

/** Retrieve a cached value by key. Returns null on cache miss. */
export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

/** Store a value in cache with TTL (defaults to 5 minutes). */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  await redis.set(key, value, { ex: ttl });
}

/** Delete a single cache key. */
export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

/** Delete all cache keys matching a glob pattern (e.g., "catalog:*"). */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, { match: pattern });
    cursor = String(result[0]);
    keys.push(...(result[1] as string[]));
  } while (cursor !== "0");

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

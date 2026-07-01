import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client for caching and performance optimization.
 * Optional: works without env var (caching disabled in dev).
 */
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export const cacheClient = redis

export interface CacheOptions {
  ttl?: number // seconds, default 3600 (1 hour)
  tags?: string[] // cache invalidation tags
}

/**
 * Get value from cache, or compute and cache it.
 */
export async function getCached<T>(
  key: string,
  compute: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  if (!cacheClient) {
    return compute()
  }

  const cached = await cacheClient.get<T>(key).catch(() => null)
  if (cached) return cached

  const value = await compute()
  await cacheClient.setex(key, options.ttl || 3600, value).catch(() => null)

  return value
}

/**
 * Set value in cache.
 */
export async function setCached<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  if (!cacheClient) return

  await cacheClient.setex(key, options.ttl || 3600, value).catch(() => null)
}

/**
 * Invalidate cache by pattern or tag.
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!cacheClient) return

  try {
    const keys = await cacheClient.keys(pattern)
    if (keys.length > 0) {
      await cacheClient.del(...keys)
    }
  } catch {
    // Redis optional - ignore errors
  }
}

export const CACHE_KEYS = {
  PROMPTS: (userId: string) => `prompts:${userId}`,
  SYSTEM_PROMPTS: () => 'prompts:system',
  CHAT: (chatId: string) => `chat:${chatId}`,
  USER_CHATS: (userId: string) => `chats:${userId}`,
  ADMIN_STATS: () => 'admin:stats',
} as const

/**
 * Rate limiting — Upstash Redis in production, in-memory fallback for dev.
 */

type RateLimitResult = { success: boolean; remaining: number; reset: number };

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function memoryRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    reset: entry.resetAt,
  };
}

export async function rateLimit(
  identifier: string,
  limit = MAX_REQUESTS
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");
      const ratelimit = new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(limit, "1 m"),
        analytics: true,
      });
      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch {
      // fall through to memory
    }
  }

  return memoryRateLimit(identifier);
}

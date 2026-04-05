import Redis from "ioredis"

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.error("[Redis] Max retries reached — giving up")
        return null
      }
      const delay = Math.min(times * 200, 2000)
      console.warn(`[Redis] Retrying connection (attempt ${times})...`)
      return delay
    },
    reconnectOnError(err) {
      const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"]
      if (targetErrors.some((e) => err.message.includes(e))) {
        return true
      }
      return false
    },
  })

  client.on("connect", () => {
    console.log("[Redis] Connected")
  })

  client.on("error", (err) => {
    console.error("[Redis] Error:", err.message)
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

// ============================================
// KEY HELPERS
// Key naming convention: fluxcart:{entity}:{id}
// ============================================

export const RedisKeys = {
  // Guest cart — keyed by session ID from cookie
  guestCart: (sessionId: string) => `fluxcart:cart:guest:${sessionId}`,

  // Authenticated user cart cache
  userCart: (userId: string) => `fluxcart:cart:user:${userId}`,

  // Product listing cache (by query fingerprint)
  productList: (query: string) => `fluxcart:products:list:${query}`,

  // Single product cache
  product: (slug: string) => `fluxcart:product:${slug}`,

  // Category list cache
  categoryList: () => `fluxcart:categories:list`,
} as const

// ============================================
// TTL CONSTANTS (in seconds)
// ============================================

export const RedisTTL = {
  guestCart: 60 * 60 * 24 * 7,  // 7 days
  userCart: 60 * 60 * 24,        // 24 hours
  productList: 60,                // 1 minute
  product: 60 * 5,               // 5 minutes
  categoryList: 60 * 10,         // 10 minutes
} as const
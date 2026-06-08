import { NextRequest } from 'next/server'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
  blockMs?: number
}

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type Bucket = {
  count: number
  windowStart: number
  blockedUntil?: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
  if (buckets.size < 5000) return

  for (const [key, bucket] of buckets) {
    const expiredWindow = now - bucket.windowStart > 60 * 60 * 1000
    const unblocked = !bucket.blockedUntil || bucket.blockedUntil <= now
    if (expiredWindow && unblocked) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  cleanup(now)

  const { key, limit, windowMs, blockMs = windowMs } = options
  const current = buckets.get(key)

  if (current?.blockedUntil && current.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.blockedUntil - now) / 1000)
    }
  }

  if (!current || now - current.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  current.count += 1

  if (current.count > limit) {
    current.blockedUntil = now + blockMs
    buckets.set(key, current)

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(blockMs / 1000)
    }
  }

  buckets.set(key, current)
  return { allowed: true, retryAfterSeconds: 0 }
}
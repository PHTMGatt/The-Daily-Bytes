import type { NextFunction, Request, Response } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  maxKeys?: number;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/** Fixed-window in-memory limiter. Returns whether the hit is allowed and seconds until reset. */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly windowMs: number, private readonly max: number, private readonly maxKeys = 5000) {}

  hit(key: string, now = Date.now()) {
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      if (!bucket && this.buckets.size >= this.maxKeys) this.prune(now);
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    return {
      allowed: bucket.count <= this.max,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  private prune(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    // Still full of live buckets: drop the oldest so memory stays bounded.
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
  }
}

export const createRateLimitMiddleware = ({ windowMs, max, maxKeys, message }: RateLimitOptions) => {
  const limiter = new RateLimiter(windowMs, max, maxKeys);

  return (req: Request, res: Response, next: NextFunction) => {
    const { allowed, retryAfterSeconds } = limiter.hit(req.ip || 'unknown');
    if (allowed) return next();

    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ message: message || 'Too many requests. Please try again shortly.' });
  };
};

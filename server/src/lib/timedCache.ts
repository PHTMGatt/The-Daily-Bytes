interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export class TimedCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
  ) {}

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= now) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T, now = Date.now()) {
    if (this.maxEntries <= 0) return;

    if (!this.store.has(key) && this.store.size >= this.maxEntries) {
      let oldestKey: string | undefined;
      let oldestCreatedAt = Number.POSITIVE_INFINITY;

      for (const [candidateKey, entry] of this.store) {
        if (entry.createdAt < oldestCreatedAt) {
          oldestCreatedAt = entry.createdAt;
          oldestKey = candidateKey;
        }
      }

      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    });
  }
}

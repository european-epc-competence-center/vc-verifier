interface CacheEntry<T> {
  value: T;
  freshUntil: number;   // treat as fresh before this time
  staleUntil: number;   // discard completely after this time
}

/**
 * Two-tier TTL cache:
 *  - "fresh" entries are returned normally within freshTtlHours
 *  - "stale" entries are kept for staleTtlHours total and returned only as
 *    a fallback (via getStale()) when a live fetch fails
 */
export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private freshTtlMs: number;
  private staleTtlMs: number;

  constructor(freshTtlHours: number = 1, staleTtlHours: number = 24) {
    this.freshTtlMs = freshTtlHours * 60 * 60 * 1000;
    this.staleTtlMs = staleTtlHours * 60 * 60 * 1000;

    // Clean up fully-expired (past staleUntil) entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, value: T): void {
    const now = Date.now();
    this.cache.set(key, {
      value,
      freshUntil: now + this.freshTtlMs,
      staleUntil: now + this.staleTtlMs,
    });
  }

  /** Returns the value only if the fresh TTL has not expired. */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.freshUntil) return undefined;
    return entry.value;
  }

  /**
   * Returns the value even if the fresh TTL has expired, as long as the
   * stale TTL has not expired. Use as fallback when the live fetch fails.
   */
  getStale(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.staleUntil) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.staleUntil) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`TTL cache cleanup: removed ${keysToDelete.length} fully-expired entries`);
    }
  }
}

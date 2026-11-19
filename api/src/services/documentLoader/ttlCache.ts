interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlHours: number = 1) {
    this.ttlMs = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    // Clean up expired entries every 5 minutes
    // Housekeeping must not keep an otherwise idle process alive.
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000).unref();
  }

  set(key: string, value: T): void {
    const expiresAt = Date.now() + this.ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Loads the value live and caches it, so the cache only bridges short
   * upstream outages: when loading fails with an error `isTransient` accepts,
   * the last cached value (at most one TTL old) is served instead. Any other
   * failure is authoritative and evicts the key, so a rejected value is never
   * served by a later fallback.
   */
  async load(
    key: string,
    loadLive: () => Promise<T>,
    isTransient: (error: unknown) => boolean = () => true
  ): Promise<T> {
    try {
      const value = await loadLive();
      this.set(key, value);
      return value;
    } catch (error) {
      if (!isTransient(error)) {
        this.delete(key);
        throw error;
      }
      const cached = this.get(key);
      if (cached === undefined) throw error;
      console.warn(`Refreshing ${key} failed, serving cached copy:`, error);
      return cached;
    }
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
    this.cleanup(); // Clean up expired entries before returning size
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
    if (keysToDelete.length > 0) {
      console.log(`TTL cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }
}

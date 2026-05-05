/**
 * Generic Cache Utility
 * Provides a simple LRU cache with TTL support
 */

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  lastAccessAt: number;
  accessCount: number;
  expired: boolean;
  evicted: boolean;
}

export interface CacheConfig {
  maxSize: number;
  ttl: number;
  trackStats: boolean;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  expired: number;
  evicted: number;
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private hits = 0;
  private misses = 0;
  private expiredCount = 0;
  private evictedCount = 0;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 300000, // 5 minutes default
      trackStats: config.trackStats ?? true,
    };

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Get a value from the cache
   */
  public get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      entry.expired = true;
      this.expiredCount++;
      this.misses++;
      return null;
    }

    // Update access stats
    entry.lastAccessAt = Date.now();
    entry.accessCount++;
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  public set(key: string, value: T, ttl?: number): void {
    const now = Date.now();

    // Check if we need to make room
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + (ttl ?? this.config.ttl),
      lastAccessAt: now,
      accessCount: 0,
      expired: false,
      evicted: false,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists in the cache
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      entry.expired = true;
      return false;
    }
    return true;
  }

  /**
   * Delete a key from the cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.expiredCount = 0;
    this.evictedCount = 0;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      expired: this.expiredCount,
      evicted: this.evictedCount,
    };
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessAt < oldestAccess) {
        oldestAccess = entry.lastAccessAt;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      if (entry) {
        entry.evicted = true;
      }
      this.cache.delete(lruKey);
      this.evictedCount++;
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        entry.expired = true;
        this.cache.delete(key);
        this.expiredCount++;
      }
    }
  }

  /**
   * Dispose of the cache and cleanup timer
   */
  public dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

import * as vscode from 'vscode';
import type { IFileStatsCacheService } from '../di/interfaces/IFileStatsCacheService';
import type { ILogger } from '../di/interfaces/ILogger';
import { CacheEntry, CacheConfig, FileStats } from '../types/extension';
import { Logger } from '../utils/logger';

export class FileStatsCacheService implements IFileStatsCacheService {
  private static instance: FileStatsCacheService | undefined;
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;
  private logger: ILogger;
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor(logger: ILogger) {
    this.cache = new Map();
    this.config = {
      maxEntries: 100,
      ttl: 300000,
    };
    this.logger = logger;
    this.logger.info('FileStatsCacheService initialized');
  }

  /**
   * Create a new FileStatsCacheService instance (DI pattern)
   */
  public static create(logger: ILogger): FileStatsCacheService {
    return new FileStatsCacheService(logger);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): FileStatsCacheService {
    FileStatsCacheService.instance ??= new FileStatsCacheService(Logger.getInstance());
    return FileStatsCacheService.instance;
  }

  public async get(uri: vscode.Uri): Promise<FileStats | null> {
    const key = uri.toString();

    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.cacheMisses++;
        this.logger.debug(`Cache miss for: ${key}`);
        return null;
      }

      if (this.isExpired(entry)) {
        this.logger.debug(`Cache entry expired for: ${key}`);
        this.cache.delete(key);
        this.cacheMisses++;
        return null;
      }

      const currentMtime = await this.getFileMtime(uri);
      if (currentMtime !== null && currentMtime !== entry.fileMtime) {
        this.logger.debug(`File modified, cache invalid for: ${key}`);
        this.cache.delete(key);
        this.cacheMisses++;
        return null;
      }

      entry.hitCount++;
      entry.lastAccessed = Date.now();
      this.cacheHits++;
      this.logger.debug(`Cache hit for: ${key} (hits: ${entry.hitCount})`);

      this.logger.debug(`total hits: ${this.cacheHits}, misses: ${this.cacheMisses}`);

      return entry.stats;
    } catch (error) {
      this.logger.warn(`Error reading from cache for ${key}`, error);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Get the previous size for a file from the cache
   * Returns undefined if file not in cache or no previous size available
   */
  public getPreviousSize(uri: vscode.Uri): number | undefined {
    const key = uri.toString();
    const entry = this.cache.get(key);
    return entry?.previousSize;
  }

  public set(uri: vscode.Uri, stats: FileStats): void {
    const key = uri.toString();

    try {
      const existingEntry = this.cache.get(key);

      const currentSize = stats.size;
      const previousSize = existingEntry?.stats.size;
      const sizeChanged = existingEntry?.stats.size !== currentSize;

      // Build entry object, only adding optional properties when they have values
      const entry: CacheEntry = {
        stats,
        cachedAt: Date.now(),
        fileMtime: stats.lastModified.getTime(),
        hitCount: 0,
        lastAccessed: Date.now(),
        ...(previousSize !== undefined && { previousSize }),
        ...(sizeChanged && { lastSizeChange: new Date() }),
        ...(!sizeChanged && existingEntry?.lastSizeChange && { lastSizeChange: existingEntry.lastSizeChange }),
      };

      this.cache.set(key, entry);
      this.logger.debug(`Cached file stats for: ${key}`, {
        size: currentSize,
        previousSize,
        hasChange: previousSize !== undefined && previousSize !== currentSize,
      });
    } catch (error) {
      this.logger.warn(`Error writing to cache for ${key}`, error);
    }
  }

  public invalidate(uri: vscode.Uri): void {
    const key = uri.toString();
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache invalidated for: ${key} (cache size: ${this.cache.size})`);
    }
  }

  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.logger.info(`Cache cleared (${size} entries removed)`);
  }

  public getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const hitRate =
      this.cacheHits + this.cacheMisses > 0
        ? (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100
        : 0;
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate,
    };
  }

  private isExpired(entry: CacheEntry): boolean {
    const age = Date.now() - entry.cachedAt;
    return age > this.config.ttl;
  }

  private async getFileMtime(uri: vscode.Uri): Promise<number | null> {
    try {
      const stats = await vscode.workspace.fs.stat(uri);
      return stats.mtime;
    } catch {
      return null;
    }
  }

  public dispose(): void {
    this.logger.info('Disposing FileStatsCacheService');
    this.cache.clear();
  }
}

import * as vscode from 'vscode';
import { FileStats } from '../../types/extension';

/**
 * File stats cache service interface for dependency injection
 */
export interface IFileStatsCacheService {
  /**
   * Get cached file stats for a URI
   */
  get(uri: vscode.Uri): Promise<FileStats | null>;

  /**
   * Get the previous size for a file from the cache
   */
  getPreviousSize(uri: vscode.Uri): number | undefined;

  /**
   * Cache file stats for a URI
   */
  set(uri: vscode.Uri, stats: FileStats): void;

  /**
   * Invalidate cache entry for a URI
   */
  invalidate(uri: vscode.Uri): void;

  /**
   * Clear all cache entries
   */
  clear(): void;

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };

  /**
   * Dispose of resources
   */
  dispose(): void;
}

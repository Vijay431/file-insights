import { FileStats } from '../../types/extension';

/**
 * Notification service interface for dependency injection
 */
export interface INotificationService {
  /**
   * Check file size limits and show warnings if configured
   */
  checkSizeLimit(fileStats: FileStats): Promise<void>;

  /**
   * Clear warning history
   */
  clearWarnings(filePath?: string): void;

  /**
   * Get warning history
   */
  getWarningHistory(): Map<string, unknown>;
}

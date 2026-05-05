import { FileInsightsConfig } from '../../types/extension';

/**
 * Configuration service interface for dependency injection
 */
export interface IConfigurationService {
  /**
   * Get the complete configuration object
   */
  getConfiguration(): FileInsightsConfig;

  /**
   * Check if the extension is enabled
   */
  isEnabled(): boolean;

  /**
   * Get the display format setting
   */
  getDisplayFormat(): 'auto' | 'bytes' | 'kb' | 'mb' | 'gb';

  /**
   * Register a callback for configuration changes
   * @returns Disposable that cleans up the listener
   */
  onConfigurationChanged(callback: () => void): { dispose: () => void };

  /**
   * Update a configuration value
   */
  updateConfiguration<T>(key: string, value: T, target?: unknown): Promise<void>;

  /**
   * Enable the extension
   */
  enableExtension(): Promise<void>;

  /**
   * Disable the extension
   */
  disableExtension(): Promise<void>;

  /**
   * Export settings to a JSON file
   */
  exportSettings(): Promise<void>;

  /**
   * Import settings from a JSON file
   */
  importSettings(): Promise<void>;
}

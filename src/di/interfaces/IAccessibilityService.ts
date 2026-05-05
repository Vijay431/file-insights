/**
 * Accessibility service interface for dependency injection
 * Provides screen reader support and accessibility announcements
 */
export interface IAccessibilityService {
  /**
   * Announce a message to screen readers
   * @param message The message to announce
   * @param verbosity The verbosity level (minimal, normal, verbose)
   */
  announce(message: string, verbosity?: 'minimal' | 'normal' | 'verbose'): Promise<void>;

  /**
   * Announce a successful operation
   * @param operation The operation that succeeded
   * @param detail Optional detail about the success
   */
  announceSuccess(operation: string, detail?: string): Promise<void>;

  /**
   * Announce an error
   * @param operation The operation that failed
   * @param error The error message
   */
  announceError(operation: string, error: string): Promise<void>;

  /**
   * Check if screen reader is enabled
   */
  isEnabled(): boolean;
}

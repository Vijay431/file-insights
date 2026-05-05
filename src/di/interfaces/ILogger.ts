/**
 * Logger service interface for dependency injection
 */
export interface ILogger {
  /**
   * Log debug-level message
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log info-level message
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log warning-level message
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log error-level message with optional error object
   */
  error(message: string, error?: unknown, ...args: unknown[]): void;

  /**
   * Show the output channel
   */
  show(): void;

  /**
   * Dispose of resources
   */
  dispose(): void;

  /**
   * Set the log level
   */
  setLogLevel(level: number): void;

  /**
   * Set the log format (text or json)
   */
  setLogFormat(format: string): void;
}

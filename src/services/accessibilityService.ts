import * as vscode from 'vscode';

import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { ILogger } from '../di/interfaces/ILogger';

/**
 * Accessibility Service
 * Provides screen reader support and accessibility announcements
 */
export class AccessibilityService implements IAccessibilityService {
  private static instance: AccessibilityService | undefined;
  private logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Create a new AccessibilityService instance (DI pattern)
   */
  public static create(logger: ILogger): AccessibilityService {
    return new AccessibilityService(logger);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): AccessibilityService {
    AccessibilityService.instance ??= new AccessibilityService(
      ({
        warn: () => {},
        info: () => {},
        debug: () => {},
        error: () => {},
        show: () => {},
        dispose: () => {},
        setLogLevel: () => {},
        setLogFormat: () => {},
      }),
    );
    return AccessibilityService.instance;
  }

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   */
  public async announce(message: string): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }
    await vscode.window.showInformationMessage(message);
    this.logger.debug(`Accessibility announcement: ${message}`);
  }

  /**
   * Announce a successful operation
   * @param operation The operation that succeeded
   * @param detail Optional detail about the success
   */
  public async announceSuccess(
    operation: string,
    detail?: string,
  ): Promise<void> {
    const message = detail
      ? `${operation} succeeded. ${detail}`
      : `${operation} succeeded.`;
    await this.announce(message);
  }

  /**
   * Announce an error
   * @param operation The operation that failed
   * @param error The error message
   */
  public async announceError(
    operation: string,
    error: string,
  ): Promise<void> {
    const message = `${operation} failed. ${error}`;
    await this.announce(message);
  }

  /**
   * Check if screen reader is enabled
   */
  public isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('accessibility');
    return config.get<boolean>('screenReaderEnabled', false);
  }
}


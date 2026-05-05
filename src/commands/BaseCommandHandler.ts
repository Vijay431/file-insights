import * as vscode from 'vscode';

import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { ILogger } from '../di/interfaces/ILogger';

/**
 * Result type for command execution
 */
export interface CommandResult {
  success: boolean;
  message?: string | undefined;
  error?: unknown;
}

/**
 * Abstract base class for command handlers
 * Provides common utilities for command execution, user interaction, and accessibility
 */
export abstract class BaseCommandHandler {
  protected constructor(
    protected logger: ILogger,
    protected accessibility: IAccessibilityService,
  ) {}

  /**
   * Execute the command
   * Subclasses must implement this method
   */
  public abstract execute(): Promise<CommandResult>;

  /**
   * Create a success result
   */
  protected success(message?: string): CommandResult {
    if (message) {
      return { success: true, message };
    }
    return { success: true };
  }

  /**
   * Create an error result
   */
  protected error(error: unknown, message?: string): CommandResult {
    if (message) {
      return { success: false, error, message };
    }
    return { success: false, error };
  }

  /**
   * Get the active text editor
   */
  protected getActiveEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  /**
   * Get the active text editor, throwing an error if none exists
   * Use this method when the command requires an active editor to function
   * @throws Error if no active text editor is available
   */
  protected getRequiredActiveEditor(): vscode.TextEditor {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error('No active text editor available');
    }
    return editor;
  }

  /**
   * Check if there is a selection in the active editor
   */
  protected hasSelection(): boolean {
    const editor = this.getActiveEditor();
    if (!editor) {
      return false;
    }
    return !editor.selection.isEmpty;
  }

  /**
   * Get the selected text from the active editor
   */
  protected getSelectedText(): string | undefined {
    const editor = this.getActiveEditor();
    if (!editor || !this.hasSelection()) {
      return undefined;
    }
    return editor.document.getText(editor.selection);
  }

  /**
   * Show an information message to the user
   */
  protected async showInfo(message: string, ...items: string[]): Promise<string | undefined> {
    this.logger.info(message);
    return await vscode.window.showInformationMessage(message, ...items);
  }

  /**
   * Show a warning message to the user
   */
  protected async showWarning(message: string, ...items: string[]): Promise<string | undefined> {
    this.logger.warn(message);
    return await vscode.window.showWarningMessage(message, ...items);
  }

  /**
   * Show an error message to the user
   */
  protected async showError(message: string, ...items: string[]): Promise<string | undefined> {
    this.logger.error(message);
    return await vscode.window.showErrorMessage(message, ...items);
  }

  /**
   * Make an accessibility announcement
   */
  protected async announce(
    message: string,
    _verbosity?: 'minimal' | 'normal' | 'verbose',
  ): Promise<void> {
    await this.accessibility.announce(message);
  }

  /**
   * Announce a successful operation
   */
  protected async announceSuccess(operation: string, detail?: string): Promise<void> {
    await this.accessibility.announceSuccess(operation, detail);
  }

  /**
   * Announce an error
   */
  protected async announceError(operation: string, error: string): Promise<void> {
    await this.accessibility.announceError(operation, error);
  }

  /**
   * Log an info message
   */
  protected logInfo(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  /**
   * Log a debug message
   */
  protected logDebug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }

  /**
   * Log a warning message
   */
  protected logWarn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }

  /**
   * Log an error message
   */
  protected logError(message: string, error?: unknown, ...args: unknown[]): void {
    this.logger.error(message, error, ...args);
  }
}

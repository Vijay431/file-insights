import * as vscode from 'vscode';

/**
 * Status Bar Manager interface for dependency injection
 * Manages the status bar UI, updates, and event handling
 */
export interface IStatusBarManager {
  /**
   * Initialize the status bar manager
   * Sets up event listeners and initial display
   */
  initialize(): void;

  /**
   * Update file stats for the current document
   * @param document - The text document to update stats for
   */
  updateFileStats(document: vscode.TextDocument): void;

  /**
   * Show the status bar
   */
  show(): void;

  /**
   * Hide the status bar
   */
  hide(): void;

  /**
   * Dispose of resources
   */
  dispose(): void;
}

import * as vscode from 'vscode';

/**
 * Extension Manager interface for dependency injection
 * Manages the extension lifecycle and component coordination
 */
export interface IExtensionManager {
  /**
   * Activate the extension
   * @param context - VS Code extension context
   */
  activate(context: vscode.ExtensionContext): Promise<void>;

  /**
   * Deactivate the extension
   */
  deactivate(): void;

  /**
   * Register all extension commands
   */
  registerCommands(): void;

  /**
   * Check if the extension is currently active and enabled
   */
  isActive(): boolean;
}

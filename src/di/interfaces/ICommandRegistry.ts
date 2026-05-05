import * as vscode from 'vscode';

/**
 * Command Registry interface for dependency injection
 * Manages command registration and lifecycle
 */
export interface ICommandRegistry {
  /**
   * Register a command with VS Code
   * @param id - The command ID
   * @param handler - The command handler function
   * @returns A disposable that unregisters the command
   */
  registerCommand(
    id: string,
    handler: (...args: unknown[]) => unknown,
  ): vscode.Disposable;

  /**
   * Dispose of all registered commands
   */
  dispose(): void;
}

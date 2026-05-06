import * as vscode from 'vscode';

import type { ICommandRegistry } from '../di/interfaces/ICommandRegistry';
import type { ILogger } from '../di/interfaces/ILogger';

/**
 * Centralized command factory and lifecycle management
 * Tracks all command disposables for proper cleanup
 */
export class CommandRegistry implements ICommandRegistry {
  private commands = new Map<string, vscode.Disposable>();

  constructor(private logger: ILogger) {}

  /**
   * Factory method to create CommandRegistry instance
   * Used for DI container registration
   */
  public static create(logger: ILogger): CommandRegistry {
    return new CommandRegistry(logger);
  }

  public registerCommand(
    id: string,
    handler: (...args: unknown[]) => unknown,
  ): vscode.Disposable {
    if (this.commands.has(id)) {
      this.logger.warn(`Command already registered: ${id}. Disposing previous registration.`);
      this.commands.get(id)?.dispose();
    }

    this.logger.debug(`Registering command: ${id}`);

    const disposable = vscode.commands.registerCommand(id, handler);
    this.commands.set(id, disposable);

    return disposable;
  }

  public dispose(): void {
    this.logger.debug('Disposing CommandRegistry');

    this.commands.forEach((disposable, id) => {
      try {
        disposable.dispose();
        this.logger.debug(`Disposed command: ${id}`);
      } catch (error) {
        this.logger.warn(`Error disposing command: ${id}`, error);
      }
    });

    this.commands.clear();
  }

  /**
   * Get the number of registered commands
   */
  public get size(): number {
    return this.commands.size;
  }

  /**
   * Check if a command is registered
   */
  public has(id: string): boolean {
    return this.commands.has(id);
  }
}

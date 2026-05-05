import * as vscode from 'vscode';

import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { IContextMenuManager } from '../di/interfaces/IContextMenuManager';
import type { ILogger } from '../di/interfaces/ILogger';

/**
 * Manages VS Code context menu visibility and command registration
 * Sets context variables for when clauses in package.json
 */
export class ContextMenuManager implements IContextMenuManager {
  private disposables: vscode.Disposable[] = [];

  constructor(
    private configService: IConfigurationService,
    private logger: ILogger,
  ) {}

  /**
   * Factory method to create ContextMenuManager instance
   * Used for DI container registration
   */
  public static create(
    configService: IConfigurationService,
    logger: ILogger,
  ): ContextMenuManager {
    return new ContextMenuManager(configService, logger);
  }

  public async initialize(): Promise<void> {
    this.logger.debug('Initializing ContextMenuManager');

    // Update enabled context
    await this.updateEnabledContext();

    // Subscribe to configuration changes
    this.subscribeToConfigChanges();

    this.logger.debug('ContextMenuManager initialized');
  }

  private async updateEnabledContext(): Promise<void> {
    const enabled = this.configService.isEnabled();
    await vscode.commands.executeCommand(
      'setContext',
      'fileInsights.enabled',
      enabled,
    );
    this.logger.debug(`Context variable set: fileInsights.enabled = ${enabled}`);
  }

  private subscribeToConfigChanges(): void {
    const disposable = this.configService.onConfigurationChanged(() => {
      void this.updateEnabledContext();
    });
    this.disposables.push(disposable);
  }

  public dispose(): void {
    this.logger.debug('Disposing ContextMenuManager');
    this.disposables.forEach((disposable) => {
      try {
        disposable.dispose();
      } catch (error) {
        this.logger.warn('Error disposing ContextMenuManager resource', error);
      }
    });
    this.disposables = [];
  }
}

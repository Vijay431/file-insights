import * as vscode from 'vscode';

import { ConfigurationService } from '../services/configurationService';
import { Logger } from '../utils/logger';

import { StatusBarManager } from './statusBarManager';

export class ExtensionManager {
  private logger: Logger;
  private configService: ConfigurationService;
  private statusBarManager: StatusBarManager;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.logger = Logger.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.statusBarManager = new StatusBarManager();
  }

  public async activate(context: vscode.ExtensionContext): Promise<void> {
    this.logger.info('Activating File Insights extension');

    try {
      // Initialize components
      await this.initializeComponents();

      // Register commands
      this.registerCommands(context);

      // Register disposables with VS Code context
      this.disposables.forEach((disposable) => {
        context.subscriptions.push(disposable);
      });

      // Add our own disposables
      context.subscriptions.push({ dispose: () => this.dispose() });

      this.logger.info('File Insights extension activated successfully');

      // Show activation message (only in debug mode and when enabled)
      if (process.env['NODE_ENV'] === 'development' && this.configService.isEnabled()) {
        vscode.window.showInformationMessage('File Insights extension is now active');
      }
    } catch (error) {
      this.logger.error('Failed to activate extension', error);
      vscode.window.showErrorMessage('Failed to activate File Insights extension');
      throw error;
    }
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Initialize status bar manager
      this.statusBarManager.initialize();

      this.logger.debug('All components initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing components', error);
      throw error;
    }
  }

  private registerCommands(context: vscode.ExtensionContext): void {
    const commands = [
      vscode.commands.registerCommand(
        'fileInsights.enable',
        () => this.configService.enableExtension(),
      ),
      vscode.commands.registerCommand(
        'fileInsights.disable',
        () => this.configService.disableExtension(),
      ),
    ];

    commands.forEach((command) => {
      context.subscriptions.push(command);
      this.disposables.push(command);
    });

    this.logger.debug('Commands registered successfully');
  }

  public deactivate(): void {
    this.logger.info('Deactivating File Insights extension');
    this.dispose();
  }

  private dispose(): void {
    this.logger.debug('Disposing ExtensionManager');

    // Dispose status bar manager
    this.statusBarManager.dispose();

    // Dispose all registered disposables
    this.disposables.forEach((disposable) => {
      try {
        disposable.dispose();
      } catch (error) {
        this.logger.warn('Error disposing resource', error);
      }
    });

    this.disposables = [];

    // Dispose logger last
    this.logger.dispose();
  }

  // Public API for testing or external access
  public getStatusBarManager(): StatusBarManager {
    return this.statusBarManager;
  }

  public getConfigurationService(): ConfigurationService {
    return this.configService;
  }

  public isActive(): boolean {
    return this.configService.isEnabled();
  }
}

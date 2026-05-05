import * as vscode from 'vscode';

import type { IAccessibilityService } from '../di/interfaces/IAccessibilityService';
import type { ICommandRegistry } from '../di/interfaces/ICommandRegistry';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { IContextMenuManager } from '../di/interfaces/IContextMenuManager';
import type { IExtensionManager } from '../di/interfaces/IExtensionManager';
import type { IFileStatsCacheService } from '../di/interfaces/IFileStatsCacheService';
import type { IFileStatsService } from '../di/interfaces/IFileStatsService';
import type { ILogger } from '../di/interfaces/ILogger';
import type { INotificationService } from '../di/interfaces/INotificationService';
import type { DIContainer } from '../di/container';

import { TYPES } from '../di/types';
import { DisableCommand } from '../commands/DisableCommand';
import { EnableCommand } from '../commands/EnableCommand';
import { ExportSettingsCommand } from '../commands/ExportSettingsCommand';
import { ImportSettingsCommand } from '../commands/ImportSettingsCommand';

import { StatusBarManager } from './statusBarManager';

export class ExtensionManager implements IExtensionManager {
  private logger: ILogger;
  private configService: IConfigurationService;
  private statusBarManager: StatusBarManager;
  private contextMenuManager: IContextMenuManager;
  private commandRegistry: ICommandRegistry;
  private cache: IFileStatsCacheService;
  private disposables: vscode.Disposable[] = [];
  private currentContext?: vscode.ExtensionContext;

  constructor(private container: DIContainer) {
    // Resolve services from DI container
    this.logger = this.container.get<ILogger>(TYPES.Logger);
    this.configService = this.container.get<IConfigurationService>(
      TYPES.ConfigurationService,
    );
    this.cache = this.container.get<IFileStatsCacheService>(
      TYPES.FileStatsCacheService,
    );

    // Resolve and inject dependencies into StatusBarManager
    const fileStatsService = this.container.get<IFileStatsService>(
      TYPES.FileStatsService,
    );
    const notificationService = this.container.get<INotificationService>(
      TYPES.NotificationService,
    );

    this.statusBarManager = new StatusBarManager(
      this.configService,
      fileStatsService,
      this.cache,
      notificationService,
      this.logger,
    );

    // Resolve ContextMenuManager
    this.contextMenuManager = this.container.get<IContextMenuManager>(
      TYPES.ContextMenuManager,
    );

    // Resolve CommandRegistry
    this.commandRegistry = this.container.get<ICommandRegistry>(TYPES.CommandRegistry);
  }

  /**
   * Factory method to create ExtensionManager instance
   * Used for DI container registration
   */
  public static create(container: DIContainer): ExtensionManager {
    return new ExtensionManager(container);
  }

  public async activate(context: vscode.ExtensionContext): Promise<void> {
    this.logger.info('Activating File Insights extension');

    try {
      // Store context for command registration
      this.currentContext = context;

      // Initialize components
      await this.initializeComponents();

      // Register commands
      this.registerCommands();

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

      // Initialize context menu manager
      await this.contextMenuManager.initialize();

      this.logger.debug('All components initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing components', error);
      throw error;
    }
  }

  public registerCommands(): void {
    // Resolve services for command handlers
    const accessibilityService = this.container.get<IAccessibilityService>(
      TYPES.AccessibilityService,
    );

    // Create command handlers
    const enableCmd = new EnableCommand(
      this.configService,
      this.logger,
      accessibilityService,
    );

    const disableCmd = new DisableCommand(
      this.configService,
      this.logger,
      accessibilityService,
    );

    const exportCmd = new ExportSettingsCommand(
      this.configService,
      this.logger,
      accessibilityService,
    );

    const importCmd = new ImportSettingsCommand(
      this.configService,
      this.logger,
      accessibilityService,
    );

    // Register commands using CommandRegistry
    this.commandRegistry.registerCommand(
      'fileInsights.enable',
      () => enableCmd.execute(),
    );
    this.commandRegistry.registerCommand(
      'fileInsights.disable',
      () => disableCmd.execute(),
    );
    this.commandRegistry.registerCommand(
      'fileInsights.exportSettings',
      () => exportCmd.execute(),
    );
    this.commandRegistry.registerCommand(
      'fileInsights.importSettings',
      () => importCmd.execute(),
    );

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

    // Dispose context menu manager
    this.contextMenuManager.dispose();

    // Dispose command registry
    this.commandRegistry.dispose();

    // Dispose cache service
    this.cache.dispose();

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

import * as vscode from 'vscode';

import type { IFileStatsCacheService } from '../di/interfaces/IFileStatsCacheService';
import type { IFileStatsService } from '../di/interfaces/IFileStatsService';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { INotificationService } from '../di/interfaces/INotificationService';
import type { ILogger } from '../di/interfaces/ILogger';
import type { IStatusBarManager } from '../di/interfaces/IStatusBarManager';

import { FileStats } from '../types/extension';
import { SizeDeltaFormatter } from '../utils/sizeDeltaFormatter';
import { SizeFormatter } from '../utils/formatter';

export class StatusBarManager implements IStatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private configService: IConfigurationService;
  private fileStatsService: IFileStatsService;
  private cache: IFileStatsCacheService;
  private notificationService: INotificationService;
  private logger: ILogger;
  private disposables: vscode.Disposable[] = [];
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    configService: IConfigurationService,
    fileStatsService: IFileStatsService,
    cache: IFileStatsCacheService,
    notificationService: INotificationService,
    logger: ILogger,
  ) {
    this.configService = configService;
    this.fileStatsService = fileStatsService;
    this.cache = cache;
    this.notificationService = notificationService;
    this.logger = logger;

    const config = this.configService.getConfiguration();
    const alignment =
      config.statusBar.alignment === 'left'
        ? vscode.StatusBarAlignment.Left
        : vscode.StatusBarAlignment.Right;

    this.statusBarItem = vscode.window.createStatusBarItem(
      alignment,
      config.statusBar.priority,
    );
    this.disposables.push(this.statusBarItem);

    this.logger.info('StatusBarManager initialized');
  }

  /**
   * Factory method to create StatusBarManager instance
   * Used for DI container registration
   */
  public static create(
    configService: IConfigurationService,
    fileStatsService: IFileStatsService,
    cache: IFileStatsCacheService,
    notificationService: INotificationService,
    logger: ILogger,
  ): StatusBarManager {
    return new StatusBarManager(
      configService,
      fileStatsService,
      cache,
      notificationService,
      logger,
    );
  }

  public initialize(): void {
    this.registerEventListeners();
    this.registerConfigurationListener();

    this.scheduleUpdate(0);

    this.logger.debug('StatusBarManager event listeners registered');
  }

  private registerEventListeners(): void {
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
      this.logger.debug('Active text editor changed');
      this.scheduleUpdate();
    });

    const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument((document) => {
      this.cache.invalidate(document.uri);
      this.logger.debug(`Cache invalidated for saved document: ${document.uri.toString()}`);

      if (vscode.window.activeTextEditor?.document === document) {
        this.logger.debug('Active document saved');
        this.scheduleUpdate();
      }
    });

    this.disposables.push(onDidChangeActiveTextEditor, onDidSaveTextDocument);
  }

  private registerConfigurationListener(): void {
    const configListener = this.configService.onConfigurationChanged(() => {
      this.logger.debug('Configuration changed, updating status bar');
      this.scheduleUpdate();
    });

    this.disposables.push(configListener);
  }

  private scheduleUpdate(delay = 150): void {
    clearTimeout(this.updateTimeout ?? undefined);
    this.updateTimeout = setTimeout(() => {
      this.updateTimeout = null;
      void this.updateFileStatsInternal();
    }, delay);
  }

  /**
   * Update file stats for a specific document
   * Implements IStatusBarManager interface
   */
  public updateFileStats(_document: vscode.TextDocument): void {
    // Schedule an update with minimal delay
    this.scheduleUpdate(0);
  }

  private async updateFileStatsInternal(): Promise<void> {
    try {
      if (!this.configService.isEnabled()) {
        this.logger.debug('Extension disabled, hiding status bar');
        this.statusBarItem.hide();
        return;
      }

      const fileStats = await this.fileStatsService.getCurrentFileStats();

      if (fileStats) {
        const config = this.configService.getConfiguration();

        if (config.statusBar.hideIfExceeds) {
          const hideThreshold = this.parseSizeString(config.statusBar.hideThreshold);
          if (fileStats.size > hideThreshold) {
            this.logger.debug(`File exceeds hide threshold (${fileStats.size} > ${hideThreshold})`);
            this.logger.debug('hiding status bar');
            this.statusBarItem.hide();
            return;
          }
        }

        await this.notificationService.checkSizeLimit(fileStats);

        this.displayFileStats(fileStats);
      } else {
        this.logger.debug('No valid file stats available, hiding status bar');
        this.statusBarItem.hide();
      }
    } catch (error: unknown) {
      this.logger.error('Error updating file stats', error);
      this.statusBarItem.hide();
    }
  }

  private displayFileStats(fileStats: FileStats): void {
    const config = this.configService.getConfiguration();
    const formattedSize = SizeFormatter.formatSize(fileStats.size, config);

    this.statusBarItem.text = `$(file) ${formattedSize.formatted}`;

    const color = SizeFormatter.getColorForSize(fileStats.size, config);
    if (color) {
      this.statusBarItem.color = new vscode.ThemeColor(color);
    } else {
      this.statusBarItem.color = undefined;
    }

    // Get previous size from cache for delta display
    const fileUri = vscode.Uri.file(fileStats.path);
    const previousSize = this.cache.getPreviousSize(fileUri);
    const deltaDisplay = SizeDeltaFormatter.formatDelta(fileStats.size, previousSize);

    this.statusBarItem.tooltip = SizeFormatter.createTooltip(
      formattedSize,
      fileStats.path,
      fileStats.lastModified,
      fileStats.metadata,
      config,
      deltaDisplay ?? undefined,
    );

    this.statusBarItem.show();

    this.logger.debug(`Status bar updated: ${formattedSize.formatted} for ${fileStats.path}`);
  }

  private parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(
      // eslint-disable-next-line security/detect-unsafe-regex
      /^(\d+(?:\.\d+)?)(KB|MB|GB|TB)?$/i,
    );
    if (!match?.[1]) {
      return 0;
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] ?? 'B').toUpperCase() as
      | 'B'
      | 'KB'
      | 'MB'
      | 'GB'
      | 'TB';

    const validMultipliers: Record<
      'B' | 'KB' | 'MB' | 'GB' | 'TB',
      number
    > = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };

    return value * validMultipliers[unit];
  }

  public show(): void {
    this.statusBarItem.show();
  }

  public hide(): void {
    this.statusBarItem.hide();
  }

  public dispose(): void {
    this.logger.debug('Disposing StatusBarManager');

    clearTimeout(this.updateTimeout ?? undefined);
    this.updateTimeout = null;

    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
  }
}

import * as vscode from 'vscode';
import type { INotificationService } from '../di/interfaces/INotificationService';
import type { ILogger } from '../di/interfaces/ILogger';
import { FileInsightsConfig, SizeWarningsConfig } from '../types/extension';
import { Logger } from '../utils/logger';

interface WarningNotification {
  filePath: string;
  level: string;
  timestamp: number;
}

export class NotificationService implements INotificationService {
  private static instance: NotificationService;
  private logger: ILogger;
  private warnedFiles = new Map<string, WarningNotification>();

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Create a new NotificationService instance (DI pattern)
   */
  public static create(logger: ILogger): NotificationService {
    return new NotificationService(logger);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): NotificationService {
    NotificationService.instance ??= new NotificationService(Logger.getInstance());
    return NotificationService.instance;
  }

  public async checkSizeLimit(fileStats: { size: number; path: string }): Promise<void> {
    const config = this.getConfig();
    if (!config.enabled || !config.sizeWarnings.enabled) {
      return;
    }

    const level = this.getWarningLevel(fileStats.size, config.sizeWarnings);
    if (!level) {
      return;
    }

    const shouldWarn = await this.shouldShowWarning(
      fileStats.path,
      level,
      config.sizeWarnings.notificationFrequency,
    );

    if (shouldWarn && config.sizeWarnings.showNotification) {
      await this.showWarningNotification(fileStats, level);
    }
  }

  private getWarningLevel(
    size: number,
    config: SizeWarningsConfig,
  ): { level: string; threshold: number } | null {
    const thresholds = config.thresholds;

    const yellowThreshold = this.parseSizeString(thresholds.yellow);
    const orangeThreshold = this.parseSizeString(thresholds.orange);
    const redThreshold = this.parseSizeString(thresholds.red);

    if (size < yellowThreshold) {
      return null;
    }

    if (size >= redThreshold) {
      return {
        level: 'red',
        threshold: redThreshold,
      };
    }

    if (size >= orangeThreshold) {
      return {
        level: 'orange',
        threshold: orangeThreshold,
      };
    }

    return {
      level: 'yellow',
      threshold: yellowThreshold,
    };
  }

  private async shouldShowWarning(
    filePath: string,
    _level: { level: string; threshold: number },
    frequency: 'once' | 'always' | 'daily',
  ): Promise<boolean> {
    if (frequency === 'always') {
      return true;
    }

    const lastWarning = this.warnedFiles.get(filePath);
    if (!lastWarning) {
      return true;
    }

    if (frequency === 'once') {
      return false;
    }

    if (frequency === 'daily') {
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      return now - lastWarning.timestamp > oneDayInMs;
    }

    return false;
  }

  private async showWarningNotification(
    fileStats: { size: number; path: string },
    level: { level: string; threshold: number },
  ): Promise<void> {
    const formattedSize = this.formatSize(fileStats.size);
    const messages: Record<string, string> = {
      yellow: `Medium file: ${formattedSize}`,
      orange: `Large file: ${formattedSize}`,
      red: `Very large file: ${formattedSize}`,
    };

    const message = messages[level.level] ?? 'File size warning';
    const notification = await vscode.window.showWarningMessage(message, 'View File', 'Dismiss');

    if (notification === 'View File') {
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(fileStats.path));
    }

    this.warnedFiles.set(fileStats.path, {
      filePath: fileStats.path,
      level: level.level,
      timestamp: Date.now(),
    });

    this.logger.info(`Size warning shown for ${fileStats.path}`, {
      level: level.level,
      size: fileStats.size,
    });
  }

  public clearWarnings(filePath?: string): void {
    if (filePath) {
      this.warnedFiles.delete(filePath);
    } else {
      this.warnedFiles.clear();
    }
    this.logger.debug('Warnings cleared', { filePath });
  }

  private parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB|TB)?$/i);
    if (!match?.[1]) {
      return 0;
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] ?? 'B').toUpperCase() as 'B' | 'KB' | 'MB' | 'GB' | 'TB';

    const validMultipliers: Record<'B' | 'KB' | 'MB' | 'GB' | 'TB', number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };

    return value * validMultipliers[unit];
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const threshold = 1024;

    const unitIndex = Math.floor(Math.log(bytes) / Math.log(threshold));
    const clampedIndex = Math.max(0, Math.min(unitIndex, units.length - 1));

    const value = bytes / Math.pow(threshold, clampedIndex);
    const formattedValue = clampedIndex === 0 ? value.toString() : value.toFixed(2);
    const unit = units[clampedIndex];

    return `${formattedValue} ${unit}`;
  }

  private getConfig(): Pick<FileInsightsConfig, 'sizeWarnings' | 'enabled'> {
    const config = vscode.workspace.getConfiguration('fileInsights');
    return {
      enabled: config.get<boolean>('enabled', true),
      sizeWarnings: {
        enabled: config.get<boolean>('sizeWarnings.enabled', true),
        thresholds: {
          yellow: config.get<string>('sizeWarnings.thresholds.yellow', '100KB'),
          orange: config.get<string>('sizeWarnings.thresholds.orange', '1MB'),
          red: config.get<string>('sizeWarnings.thresholds.red', '10MB'),
        },
        notificationFrequency: config.get<'once' | 'always' | 'daily'>(
          'sizeWarnings.notificationFrequency',
          'always',
        ),
        showNotification: config.get<boolean>('sizeWarnings.showNotification', true),
      },
    };
  }

  public getWarningHistory(): Map<string, WarningNotification> {
    return new Map(this.warnedFiles);
  }
}

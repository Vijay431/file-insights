import * as vscode from 'vscode';
import type { IConfigurationService } from '../di/interfaces/IConfigurationService';
import type { ILogger } from '../di/interfaces/ILogger';
import { FileInsightsConfig } from '../types/extension';
import { Logger } from '../utils/logger';

export class ConfigurationService implements IConfigurationService {
  private static instance: ConfigurationService | undefined;
  private logger: ILogger;
  private readonly configSection = 'fileInsights';

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Create a new ConfigurationService instance (DI pattern)
   */
  public static create(logger: ILogger): ConfigurationService {
    return new ConfigurationService(logger);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): ConfigurationService {
    ConfigurationService.instance ??= new ConfigurationService(Logger.getInstance());
    return ConfigurationService.instance;
  }

  public getConfiguration(): FileInsightsConfig {
    const config = vscode.workspace.getConfiguration(this.configSection);

    return {
      enabled: config.get<boolean>('enabled', true),
      displayFormat: config.get<'auto' | 'bytes' | 'kb' | 'mb' | 'gb'>('displayFormat', 'auto'),
      colorCoding: {
        enabled: config.get<boolean>('colorCoding.enabled', true),
        thresholds: {
          yellow: config.get<string>('colorCoding.thresholds.yellow', '100KB'),
          orange: config.get<string>('colorCoding.thresholds.orange', '1MB'),
          red: config.get<string>('colorCoding.thresholds.red', '10MB'),
        },
        colors: {
          green: config.get<string>('colorCoding.colors.green', 'terminal.ansiGreen'),
          yellow: config.get<string>('colorCoding.colors.yellow', 'terminal.ansiYellow'),
          orange: config.get<string>(
            'colorCoding.colors.orange',
            'statusBarItem.warningForeground'
          ),
          red: config.get<string>('colorCoding.colors.red', 'errorForeground'),
        },
      },
      statusBar: {
        alignment: config.get<'left' | 'right'>('statusBar.alignment', 'right'),
        priority: config.get<number>('statusBar.priority', 0),
        hideIfExceeds: config.get<boolean>('statusBar.hideIfExceeds', false),
        hideThreshold: config.get<string>('statusBar.hideThreshold', '100MB'),
      },
      metadataDisplay: {
        showLineCount: config.get<boolean>('metadataDisplay.showLineCount', true),
        showCharacterCount: config.get<boolean>('metadataDisplay.showCharacterCount', true),
        showEncoding: config.get<boolean>('metadataDisplay.showEncoding', true),
        showFileType: config.get<boolean>('metadataDisplay.showFileType', true),
        showRelativePath: config.get<boolean>('metadataDisplay.showRelativePath', true),
      },
      sizeWarnings: {
        enabled: config.get<boolean>('sizeWarnings.enabled', true),
        thresholds: {
          yellow: config.get<string>('sizeWarnings.thresholds.yellow', '100KB'),
          orange: config.get<string>('sizeWarnings.thresholds.orange', '1MB'),
          red: config.get<string>('sizeWarnings.thresholds.red', '10MB'),
        },
        notificationFrequency: config.get<'once' | 'always' | 'daily'>(
          'sizeWarnings.notificationFrequency',
          'always'
        ),
        showNotification: config.get<boolean>('sizeWarnings.showNotification', true),
      },
      deltaDisplay: {
        showDeltaIndicator: config.get<boolean>('deltaDisplay.showDeltaIndicator', true),
        showDeltaInTooltip: config.get<boolean>('deltaDisplay.showDeltaInTooltip', true),
      },
    };
  }

  public isEnabled(): boolean {
    return this.getConfiguration().enabled;
  }

  public getDisplayFormat(): 'auto' | 'bytes' | 'kb' | 'mb' | 'gb' {
    return this.getConfiguration().displayFormat;
  }

  public onConfigurationChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.configSection)) {
        this.logger.info('Configuration changed');
        callback();
      }
    });
  }

  public async updateConfiguration<T>(
    key: string,
    value: T,
    target?: vscode.ConfigurationTarget,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configSection);
    const effectiveTarget = target ?? this.resolveConfigurationTarget();

    try {
      await config.update(key, value, effectiveTarget);
      this.logger.info(`Configuration updated: ${key} = ${JSON.stringify(value)}`);
    } catch (error) {
      this.logger.error(`Failed to update configuration for ${key}`, error);
      throw error;
    }
  }

  public async enableExtension(): Promise<void> {
    try {
      await this.updateConfiguration('enabled', true);
      vscode.window.showInformationMessage('File Insights enabled');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to enable File Insights: ${message}`);
    }
  }

  public async disableExtension(): Promise<void> {
    try {
      await this.updateConfiguration('enabled', false);
      vscode.window.showInformationMessage('File Insights disabled');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to disable File Insights: ${message}`);
    }
  }

  private resolveConfigurationTarget(): vscode.ConfigurationTarget {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      return vscode.ConfigurationTarget.Workspace;
    }

    return vscode.ConfigurationTarget.Global;
  }

  public async exportSettings(): Promise<void> {
    try {
      const config = this.getConfiguration();

      const settings = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        settings: config,
      };

      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file('file-insights-settings.json'),
        filters: {
          'JSON Files': ['json'],
          'All Files': ['*'],
        },
        title: 'Export File Insights Settings',
      });

      if (!uri) {
        this.logger.info('Export cancelled by user');
        return;
      }

      const content = JSON.stringify(settings, null, 2);
      const encoder = new TextEncoder();
      await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

      this.logger.info(`Settings exported to ${uri.fsPath}`);
      vscode.window.showInformationMessage(`File Insights settings exported to ${uri.fsPath}`);
    } catch (error) {
      this.logger.error('Failed to export settings', error);
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to export settings: ${message}`);
    }
  }

  public async importSettings(): Promise<void> {
    try {
      const uri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        filters: {
          'JSON Files': ['json'],
          'All Files': ['*'],
        },
        title: 'Import File Insights Settings',
      });

      if (!uri || uri.length === 0) {
        this.logger.info('Import cancelled by user');
        return;
      }

      const fileUri = uri[0]!;
      const content = await vscode.workspace.fs.readFile(fileUri);
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(content);
      const imported = JSON.parse(text);

      if (!imported.settings || typeof imported.settings !== 'object') {
        throw new Error('Invalid settings file format');
      }

      const settings = imported.settings as Partial<FileInsightsConfig>;

      if (settings.enabled !== undefined) {
        await this.updateConfiguration('enabled', settings.enabled);
      }

      if (settings.displayFormat !== undefined) {
        await this.updateConfiguration('displayFormat', settings.displayFormat);
      }

      if (settings.colorCoding !== undefined) {
        if (settings.colorCoding.enabled !== undefined) {
          await this.updateConfiguration(
            'colorCoding.enabled',
            settings.colorCoding.enabled,
          );
        }
        if (settings.colorCoding.thresholds?.yellow !== undefined) {
          await this.updateConfiguration(
            'colorCoding.thresholds.yellow',
            settings.colorCoding.thresholds.yellow,
          );
        }
        if (settings.colorCoding.thresholds?.orange !== undefined) {
          await this.updateConfiguration(
            'colorCoding.thresholds.orange',
            settings.colorCoding.thresholds.orange,
          );
        }
        if (settings.colorCoding.thresholds?.red !== undefined) {
          await this.updateConfiguration(
            'colorCoding.thresholds.red',
            settings.colorCoding.thresholds.red,
          );
        }
      }

      if (settings.statusBar !== undefined) {
        if (settings.statusBar.alignment !== undefined) {
          await this.updateConfiguration(
            'statusBar.alignment',
            settings.statusBar.alignment,
          );
        }
        if (settings.statusBar.priority !== undefined) {
          await this.updateConfiguration(
            'statusBar.priority',
            settings.statusBar.priority,
          );
        }
        if (settings.statusBar.hideIfExceeds !== undefined) {
          await this.updateConfiguration(
            'statusBar.hideIfExceeds',
            settings.statusBar.hideIfExceeds,
          );
        }
        if (settings.statusBar.hideThreshold !== undefined) {
          await this.updateConfiguration(
            'statusBar.hideThreshold',
            settings.statusBar.hideThreshold
          );
        }
      }

      if (settings.metadataDisplay !== undefined) {
        if (settings.metadataDisplay.showLineCount !== undefined) {
          await this.updateConfiguration(
            'metadataDisplay.showLineCount',
            settings.metadataDisplay.showLineCount
          );
        }
        if (settings.metadataDisplay.showCharacterCount !== undefined) {
          await this.updateConfiguration(
            'metadataDisplay.showCharacterCount',
            settings.metadataDisplay.showCharacterCount
          );
        }
        if (settings.metadataDisplay.showEncoding !== undefined) {
          await this.updateConfiguration(
            'metadataDisplay.showEncoding',
            settings.metadataDisplay.showEncoding
          );
        }
        if (settings.metadataDisplay.showFileType !== undefined) {
          await this.updateConfiguration(
            'metadataDisplay.showFileType',
            settings.metadataDisplay.showFileType
          );
        }
        if (settings.metadataDisplay.showRelativePath !== undefined) {
          await this.updateConfiguration(
            'metadataDisplay.showRelativePath',
            settings.metadataDisplay.showRelativePath
          );
        }
      }

      if (settings.sizeWarnings !== undefined) {
        if (settings.sizeWarnings.enabled !== undefined) {
          await this.updateConfiguration('sizeWarnings.enabled', settings.sizeWarnings.enabled);
        }
        if (settings.sizeWarnings.thresholds?.yellow !== undefined) {
          await this.updateConfiguration(
            'sizeWarnings.thresholds.yellow',
            settings.sizeWarnings.thresholds.yellow
          );
        }
        if (settings.sizeWarnings.thresholds?.orange !== undefined) {
          await this.updateConfiguration(
            'sizeWarnings.thresholds.orange',
            settings.sizeWarnings.thresholds.orange
          );
        }
        if (settings.sizeWarnings.thresholds?.red !== undefined) {
          await this.updateConfiguration(
            'sizeWarnings.thresholds.red',
            settings.sizeWarnings.thresholds.red
          );
        }
        if (settings.sizeWarnings.notificationFrequency !== undefined) {
          await this.updateConfiguration(
            'sizeWarnings.notificationFrequency',
            settings.sizeWarnings.notificationFrequency
          );
        }
        if (settings.sizeWarnings.showNotification !== undefined) {
          await this.updateConfiguration(
            'sizeWarnings.showNotification',
            settings.sizeWarnings.showNotification
          );
        }
      }

      this.logger.info(`Settings imported from ${fileUri.fsPath}`);
      vscode.window.showInformationMessage('File Insights settings imported successfully');
    } catch (error) {
      this.logger.error('Failed to import settings', error);
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to import settings ${message}`);
    }
  }
}

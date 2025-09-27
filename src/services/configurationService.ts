import * as vscode from 'vscode';

import { FileInsightsConfig } from '../types/extension';
import { Logger } from '../utils/logger';

export class ConfigurationService {
  private static instance: ConfigurationService;
  private logger: Logger;
  private readonly configSection = 'fileInsights';

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): ConfigurationService {
    ConfigurationService.instance ??= new ConfigurationService();
    return ConfigurationService.instance;
  }

  public getConfiguration(): FileInsightsConfig {
    const config = vscode.workspace.getConfiguration(this.configSection);

    return {
      enabled: config.get<boolean>('enabled', true),
      displayFormat: config.get<'auto' | 'bytes' | 'kb' | 'mb' | 'gb'>('displayFormat', 'auto'),
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
    await config.update(key, value, target);
    this.logger.info(`Configuration updated: ${key} = ${JSON.stringify(value)}`);
  }

  public async enableExtension(): Promise<void> {
    await this.updateConfiguration('enabled', true, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('File Insights enabled');
  }

  public async disableExtension(): Promise<void> {
    await this.updateConfiguration('enabled', false, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('File Insights disabled');
  }
}
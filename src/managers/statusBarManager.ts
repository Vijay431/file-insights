import * as vscode from 'vscode';

import { ConfigurationService } from '../services/configurationService';
import { FileStatsService } from '../services/fileStatsService';
import { FileStats } from '../types/extension';
import { SizeFormatter } from '../utils/formatter';
import { Logger } from '../utils/logger';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private configService: ConfigurationService;
  private fileStatsService: FileStatsService;
  private logger: Logger;
  private disposables: vscode.Disposable[] = [];
  private updateTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.configService = ConfigurationService.getInstance();
    this.fileStatsService = FileStatsService.getInstance();
    this.logger = Logger.getInstance();
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);

    this.logger.info('StatusBarManager initialized');
  }

  public initialize(): void {
    this.registerEventListeners();
    this.registerConfigurationListener();

    // Initial update
    void this.updateFileStats();

    this.logger.debug('StatusBarManager event listeners registered');
  }

  private registerEventListeners(): void {
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
      this.logger.debug('Active text editor changed');
      void this.updateFileStats();
    });

    const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument((document) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && document === activeEditor.document) {
        this.logger.debug('Active document saved');
        void this.updateFileStats();
      }
    });

    this.disposables.push(onDidChangeActiveTextEditor, onDidSaveTextDocument);
  }

  private registerConfigurationListener(): void {
    const configListener = this.configService.onConfigurationChanged(() => {
      this.logger.debug('Configuration changed, updating status bar');
      void this.updateFileStats();
    });

    this.disposables.push(configListener);
  }

  private async updateFileStats(): Promise<void> {
    try {
      if (!this.configService.isEnabled()) {
        this.logger.debug('Extension disabled, hiding status bar');
        this.statusBarItem.hide();
        return;
      }

      const fileStats = await this.fileStatsService.getCurrentFileStats();

      if (fileStats) {
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
    this.statusBarItem.tooltip = SizeFormatter.createTooltip(
      formattedSize,
      fileStats.path,
      fileStats.lastModified,
    );

    this.statusBarItem.show();

    this.logger.debug(`Status bar updated: ${formattedSize.formatted} for ${fileStats.path}`);
  }

  public show(): void {
    this.statusBarItem.show();
  }

  public hide(): void {
    this.statusBarItem.hide();
  }

  public dispose(): void {
    this.logger.debug('Disposing StatusBarManager');

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.statusBarItem.dispose();
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
  }
}
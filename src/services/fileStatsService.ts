import { statSync } from 'fs';

import * as vscode from 'vscode';

import { FileStats } from '../types/extension';
import { Logger } from '../utils/logger';

export class FileStatsService {
  private static instance: FileStatsService;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): FileStatsService {
    FileStatsService.instance ??= new FileStatsService();
    return FileStatsService.instance;
  }

  public isValidFile(document: vscode.TextDocument): boolean {
    const isValid = !document.isUntitled && document.uri.scheme === 'file';
    this.logger.debug(`File validation: ${document.uri.toString()} - Valid: ${isValid}`);
    return isValid;
  }

  public async getFileStats(uri: vscode.Uri): Promise<FileStats | null> {
    try {
      this.logger.debug(`Getting file stats for: ${uri.fsPath}`);
      const stats = statSync(uri.fsPath);

      const fileStats: FileStats = {
        size: stats.size,
        path: uri.fsPath,
        lastModified: stats.mtime,
      };

      this.logger.debug(`File stats retrieved: ${stats.size} bytes, modified: ${stats.mtime}`);
      return fileStats;
    } catch (error) {
      this.logger.warn(`Failed to get file stats for ${uri.fsPath}`, error);
      return null;
    }
  }

  public getCurrentActiveFile(): vscode.TextDocument | null {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      this.logger.debug('No active editor found');
      return null;
    }

    if (!this.isValidFile(activeEditor.document)) {
      this.logger.debug(`Active file is not valid: ${activeEditor.document.uri.toString()}`);
      return null;
    }

    return activeEditor.document;
  }

  public async getCurrentFileStats(): Promise<FileStats | null> {
    const activeFile = this.getCurrentActiveFile();
    if (!activeFile) {
      return null;
    }

    return await this.getFileStats(activeFile.uri);
  }
}
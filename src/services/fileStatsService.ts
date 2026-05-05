import { promises as fsPromises } from 'fs';

import * as vscode from 'vscode';
import type { IFileStatsService } from '../di/interfaces/IFileStatsService';
import type { IFileStatsCacheService } from '../di/interfaces/IFileStatsCacheService';
import type { IFileMetadataService } from '../di/interfaces/IFileMetadataService';
import type { ILogger } from '../di/interfaces/ILogger';
import { FileStats } from '../types/extension';
import { Logger } from '../utils/logger';

import { FileMetadataService } from './fileMetadataService';
import { FileStatsCacheService } from './fileStatsCacheService';

export class FileStatsService implements IFileStatsService {
  private static instance: FileStatsService | undefined;
  private logger: ILogger;
  private cache: IFileStatsCacheService;
  private metadataService: IFileMetadataService;

  private constructor(logger: ILogger, cache: IFileStatsCacheService, metadataService: IFileMetadataService) {
    this.logger = logger;
    this.cache = cache;
    this.metadataService = metadataService;
  }

  /**
   * Create a new FileStatsService instance (DI pattern)
   */
  public static create(logger: ILogger, cache: IFileStatsCacheService, metadataService: IFileMetadataService): FileStatsService {
    return new FileStatsService(logger, cache, metadataService);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): FileStatsService {
    FileStatsService.instance ??= new FileStatsService(
      Logger.getInstance(),
      FileStatsCacheService.getInstance(),
      FileMetadataService.getInstance()
    );
    return FileStatsService.instance;
  }

  public isValidFile(document: vscode.TextDocument): boolean {
    const scheme = document.uri.scheme;
    const isSupportedScheme = scheme === 'file' || scheme.startsWith('vscode-');
    const isValid = !document.isUntitled && isSupportedScheme;
    this.logger.debug(`File validation: ${document.uri.toString()} - Valid: ${isValid}`);
    return isValid;
  }

  public async getFileStats(uri: vscode.Uri): Promise<FileStats | null> {
    this.logger.debug(`Getting file stats for: ${uri.toString()}`);

    // Check cache first
    const cachedStats = await this.cache.get(uri);
    if (cachedStats) {
      return cachedStats;
    }

    // Cache miss - fetch from file system
    try {
      const stats = await vscode.workspace.fs.stat(uri);
      const fileStats = await this.createFileStats(uri, stats.size, stats.mtime);
      this.cache.set(uri, fileStats);
      return fileStats;
    } catch (workspaceError) {
      if (uri.scheme === 'file') {
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const fallbackStats = await fsPromises.stat(uri.fsPath);
          const fileStats = await this.createFileStats(
            uri,
            fallbackStats.size,
            fallbackStats.mtimeMs,
          );
          this.cache.set(uri, fileStats);
          return fileStats;
        } catch (fallbackError) {
          this.logger.warn(`Fallback stat failed for ${uri.fsPath}`, fallbackError);
        }
      }

      this.logger.warn(`Failed to get file stats for ${uri.toString()}`, workspaceError);
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

  private async createFileStats(
    uri: vscode.Uri,
    size: number,
    modifiedTime: number,
  ): Promise<FileStats> {
    const path = uri.scheme === 'file' ? uri.fsPath : uri.toString();

    const metadata = await this.metadataService.getMetadata(uri);

    const stats: FileStats = {
      size,
      path,
      lastModified: new Date(modifiedTime),
      metadata,
    };
    this.logger.debug(
      `File stats retrieved: ${size} bytes, modified: ${stats.lastModified.toISOString()}`,
    );
    return stats;
  }
}

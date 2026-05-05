import * as path from 'path';

import * as vscode from 'vscode';
import type { IFileMetadataService } from '../di/interfaces/IFileMetadataService';
import type { ILogger } from '../di/interfaces/ILogger';
import { FileMetadata } from '../types/metrics';
import { EncodingDetector } from '../utils/encodingDetector';
import { Logger } from '../utils/logger';

export class FileMetadataService implements IFileMetadataService {
  private static instance: FileMetadataService;
  private logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Create a new FileMetadataService instance (DI pattern)
   */
  public static create(logger: ILogger): FileMetadataService {
    return new FileMetadataService(logger);
  }

  /**
   * @deprecated Use create() for DI pattern instead
   */
  public static getInstance(): FileMetadataService {
    FileMetadataService.instance ??= new FileMetadataService(Logger.getInstance());
    return FileMetadataService.instance;
  }

  public async getMetadata(uri: vscode.Uri): Promise<FileMetadata> {
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      const buffer = Buffer.from(content);

      const encoding = EncodingDetector.detect(buffer);
      const textContent = EncodingDetector.decode(buffer, encoding);

      const lineCount = this.countLines(textContent);
      const characterCount = textContent.length;
      const fileType = this.getFileType(uri);
      const relativePath = this.getRelativePath(uri);

      const metadata: FileMetadata = {
        lineCount,
        characterCount,
        encoding,
        fileType,
        relativePath,
        isBinary: await this.isBinaryFile(uri, buffer),
        byteOrderMark: EncodingDetector.hasBOM(buffer),
      };

      this.logger.debug(`Metadata retrieved for ${uri.toString()}:`, {
        lineCount,
        characterCount,
        encoding,
        fileType,
      });

      return metadata;
    } catch (error) {
      this.logger.warn(`Failed to get metadata for ${uri.toString()}`, error);
      return this.getFallbackMetadata(uri);
    }
  }

  private getFallbackMetadata(uri: vscode.Uri): FileMetadata {
    const fileType = this.getFileType(uri);
    const relativePath = this.getRelativePath(uri);

    return {
      lineCount: 0,
      characterCount: 0,
      encoding: 'utf-8',
      fileType,
      relativePath,
      isBinary: false,
      byteOrderMark: false,
    };
  }

  private countLines(content: string): number {
    const lines = content.split(/\r\n|\r|\n/);
    return lines.length > 0 && content.trim() === '' ? 0 : lines.length;
  }

  private getFileType(uri: vscode.Uri): string {
    return path.extname(uri.fsPath).toLowerCase() || '(none)';
  }

  private getRelativePath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
      return uri.fsPath;
    }

    const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
    return relativePath || uri.fsPath;
  }

  private async isBinaryFile(uri: vscode.Uri, buffer: Buffer): Promise<boolean> {
    const ext = path.extname(uri.fsPath).toLowerCase();

    const binaryExtensions = new Set([
      '.exe',
      '.dll',
      '.so',
      '.dylib',
      '.bin',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.bmp',
      '.ico',
      '.zip',
      '.tar',
      '.gz',
      '.bz2',
      '.7z',
      '.rar',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.mp3',
      '.mp4',
      '.avi',
      '.mov',
      '.flac',
      '.wav',
      '.class',
      '.pyc',
      '.pyo',
      '.jar',
      '.war',
      '.ear',
    ]);

    if (binaryExtensions.has(ext)) {
      return true;
    }

    const nullByteRatio = this.countNullBytes(buffer) / buffer.length;
    if (nullByteRatio > 0.03) {
      return true;
    }

    return false;
  }

  private countNullBytes(buffer: Buffer): number {
    let count = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === 0) {
        count++;
      }
    }
    return count;
  }
}

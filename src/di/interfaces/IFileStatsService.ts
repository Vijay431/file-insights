import * as vscode from 'vscode';
import { FileStats } from '../../types/extension';

/**
 * File stats service interface for dependency injection
 */
export interface IFileStatsService {
  /**
   * Validate if a document is a supported file type
   */
  isValidFile(document: vscode.TextDocument): boolean;

  /**
   * Get file stats for a given URI
   */
  getFileStats(uri: vscode.Uri): Promise<FileStats | null>;

  /**
   * Get the currently active file document
   */
  getCurrentActiveFile(): vscode.TextDocument | null;

  /**
   * Get file stats for the currently active file
   */
  getCurrentFileStats(): Promise<FileStats | null>;
}

import * as vscode from 'vscode';
import { FileMetadata } from '../../types/metrics';

/**
 * File metadata service interface for dependency injection
 */
export interface IFileMetadataService {
  /**
   * Get metadata for a file URI
   */
  getMetadata(uri: vscode.Uri): Promise<FileMetadata>;
}

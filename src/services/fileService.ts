import * as vscode from 'vscode';
import { statSync } from 'fs-extra';
import { FileStats } from '../types/extension';
import { Result } from '../types/common';
import { Logger } from '../utils/logger';

export class FileService {
	private static readonly logger = new Logger('FileService');

	static async getFileStats(uri?: vscode.Uri): Promise<Result<FileStats, string>> {
		try {
			const activeEditor = vscode.window.activeTextEditor;
			const fileUri = uri || activeEditor?.document.uri;

			if (!fileUri || fileUri.scheme !== 'file') {
				return { success: false, error: 'No valid file URI provided' };
			}

			const stats = statSync(fileUri.fsPath);
			
			const fileStats: FileStats = {
				size: stats.size,
				path: fileUri.fsPath,
				lastModified: stats.mtime
			};

			return { success: true, data: fileStats };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			this.logger.error('Failed to get file stats', error);
			return { success: false, error: errorMessage };
		}
	}

	static isValidFile(document?: vscode.TextDocument): boolean {
		if (!document) {
			return false;
		}

		// Skip untitled documents and non-file schemes
		if (document.isUntitled || document.uri.scheme !== 'file') {
			return false;
		}

		return true;
	}
}
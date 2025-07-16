import * as vscode from 'vscode';
import { FileInsightsConfig, FileStats, FormattedSize } from '../types/extension';
import { SizeFormatter } from '../utils/formatter';
import { Logger } from '../utils/logger';

export class StatusBarManager {
	private statusBarItem: vscode.StatusBarItem | null = null;
	private config: FileInsightsConfig;
	private readonly logger = new Logger('StatusBarManager');

	constructor(config: FileInsightsConfig) {
		this.config = config;
		this.createStatusBarItem();
	}

	updateConfig(config: FileInsightsConfig): void {
		this.config = config;
		this.updateStatusBarPosition();
		
		if (!config.enabled) {
			this.hide();
		}
	}

	updateFileStats(stats: FileStats | null): void {
		if (!this.config.enabled || !stats) {
			this.hide();
			return;
		}

		try {
			if (stats.size > this.config.maxFileSize) {
				this.showMessage('File too large to analyze');
				return;
			}

			const formattedSize = SizeFormatter.formatSize(stats.size, this.config);
			this.showFileSize(formattedSize, stats);
		} catch (error: unknown) {
			this.logger.error('Failed to update file stats display', error);
			this.hide();
		}
	}

	private createStatusBarItem(): void {
		const alignment = this.config.statusBarPosition === 'left' 
			? vscode.StatusBarAlignment.Left 
			: vscode.StatusBarAlignment.Right;
		
		this.statusBarItem = vscode.window.createStatusBarItem(alignment, 100);
		this.statusBarItem.command = 'fileInsights.showDetails';
	}

	private updateStatusBarPosition(): void {
		if (this.statusBarItem) {
			this.statusBarItem.dispose();
			this.createStatusBarItem();
		}
	}

	private showFileSize(size: FormattedSize, stats: FileStats): void {
		if (!this.statusBarItem) {
			return;
		}

		this.statusBarItem.text = `$(file) ${size.formatted}`;
		
		if (this.config.showTooltip) {
			this.statusBarItem.tooltip = SizeFormatter.createTooltip(
				size, 
				stats.path, 
				stats.lastModified
			);
		}
		
		this.statusBarItem.show();
		this.logger.debug(`Updated status bar: ${size.formatted}`);
	}

	private showMessage(message: string): void {
		if (!this.statusBarItem) {
			return;
		}

		this.statusBarItem.text = `$(warning) ${message}`;
		this.statusBarItem.tooltip = message;
		this.statusBarItem.show();
	}

	hide(): void {
		if (this.statusBarItem) {
			this.statusBarItem.hide();
		}
	}

	show(): void {
		if (this.statusBarItem && this.config.enabled) {
			this.statusBarItem.show();
		}
	}

	dispose(): void {
		if (this.statusBarItem) {
			this.statusBarItem.dispose();
			this.statusBarItem = null;
		}
	}
}
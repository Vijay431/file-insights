import * as vscode from 'vscode';
import { StatusBarManager } from './statusBarManager';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { Logger } from '../utils/logger';
import { FileInsightsConfig } from '../types/extension';

export class ExtensionManager {
	private statusBarManager: StatusBarManager;
	private config: FileInsightsConfig;
	private disposables: vscode.Disposable[] = [];
	private updateTimeout: NodeJS.Timeout | null = null;
	private readonly logger = new Logger('ExtensionManager');

	constructor(context: vscode.ExtensionContext) {
		this.config = ConfigurationService.getConfiguration();
		this.statusBarManager = new StatusBarManager(this.config);
		
		this.registerCommands(context);
		this.registerEventListeners();
		this.registerConfigurationListener();
		
		// Initial update
		this.updateFileStats();
		
		this.logger.info('File Insights extension initialized');
	}

	private registerCommands(context: vscode.ExtensionContext): void {
		const commands = [
			vscode.commands.registerCommand('fileInsights.enable', () => this.enableExtension()),
			vscode.commands.registerCommand('fileInsights.disable', () => this.disableExtension()),
			vscode.commands.registerCommand('fileInsights.refresh', () => this.refreshFileStats()),
			vscode.commands.registerCommand('fileInsights.showDetails', () => this.showFileDetails()),
			vscode.commands.registerCommand('fileInsights.showOutputChannel', () => this.showOutputChannel())
		];

		commands.forEach(command => {
			context.subscriptions.push(command);
			this.disposables.push(command);
		});
	}

	private registerEventListeners(): void {
		// Listen for active editor changes
		const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
			this.scheduleUpdate();
		});

		// Listen for document changes
		const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(event => {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && event.document === activeEditor.document) {
				this.scheduleUpdate();
			}
		});

		// Listen for document saves
		const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument(document => {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && document === activeEditor.document) {
				this.scheduleUpdate();
			}
		});

		this.disposables.push(
			onDidChangeActiveTextEditor,
			onDidChangeTextDocument,
			onDidSaveTextDocument
		);
	}

	private registerConfigurationListener(): void {
		const configListener = ConfigurationService.onDidChangeConfiguration(newConfig => {
			this.config = newConfig;
			this.statusBarManager.updateConfig(newConfig);
			this.updateFileStats();
			this.logger.info('Configuration updated');
		});

		this.disposables.push(configListener);
	}

	private scheduleUpdate(): void {
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}

		this.updateTimeout = setTimeout(() => {
			this.updateFileStats();
		}, this.config.refreshInterval);
	}

	private async updateFileStats(): Promise<void> {
		try {
			const activeEditor = vscode.window.activeTextEditor;
			
			if (!activeEditor || !FileService.isValidFile(activeEditor.document)) {
				this.statusBarManager.updateFileStats(null);
				return;
			}

			const result = await FileService.getFileStats(activeEditor.document.uri);
			if (result.success) {
				this.statusBarManager.updateFileStats(result.data);
			} else {
				this.logger.warn('Failed to get file stats', result.error);
				this.statusBarManager.updateFileStats(null);
			}
		} catch (error: unknown) {
			this.logger.error('Failed to update file stats', error);
			this.statusBarManager.updateFileStats(null);
		}
	}

	private async enableExtension(): Promise<void> {
		await vscode.workspace.getConfiguration('fileInsights').update('enabled', true, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage('File Insights enabled');
	}

	private async disableExtension(): Promise<void> {
		await vscode.workspace.getConfiguration('fileInsights').update('enabled', false, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage('File Insights disabled');
	}

	private refreshFileStats(): void {
		this.updateFileStats();
		vscode.window.showInformationMessage('File statistics refreshed');
	}

	private showOutputChannel(): void {
		Logger.showOutputChannel();
	}

	private async showFileDetails(): Promise<void> {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor || !FileService.isValidFile(activeEditor.document)) {
			vscode.window.showWarningMessage('No valid file is currently open');
			return;
		}

		const result = await FileService.getFileStats(activeEditor.document.uri);
		if (!result.success) {
			vscode.window.showErrorMessage(`Unable to retrieve file statistics: ${result.error}`);
			return;
		}

		const stats = result.data;
		const items = [
			`File Path: ${stats.path}`,
			`File Size: ${stats.size} bytes`,
			`Last Modified: ${stats.lastModified.toLocaleString()}`
		];

		vscode.window.showQuickPick(items, {
			placeHolder: 'File Details',
			canPickMany: false
		});
	}

	dispose(): void {
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}

		this.statusBarManager.dispose();
		this.disposables.forEach(disposable => disposable.dispose());
		this.logger.dispose();
		
		this.logger.info('File Insights extension disposed');
	}
}
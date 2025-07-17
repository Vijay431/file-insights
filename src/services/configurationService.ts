import * as vscode from 'vscode';
import { FileInsightsConfig } from '../types/extension';

export class ConfigurationService {
	private static readonly SECTION = 'fileInsights';

	static getConfiguration(): FileInsightsConfig {
		const config = vscode.workspace.getConfiguration(this.SECTION);
		
		return {
			enabled: config.get('enabled', true),
			displayFormat: config.get('displayFormat', 'auto'),
			statusBarPosition: config.get('statusBarPosition', 'right'),
			showTooltip: config.get('showTooltip', true),
			refreshInterval: config.get('refreshInterval', 500),
			maxFileSize: config.get('maxFileSize', 1073741824) // 1GB in bytes
		};
	}

	static onDidChangeConfiguration(callback: (config: FileInsightsConfig) => void): vscode.Disposable {
		return vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration(this.SECTION)) {
				callback(this.getConfiguration());
			}
		});
	}
}
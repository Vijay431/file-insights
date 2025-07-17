import * as vscode from 'vscode';
import { ExtensionManager } from './managers/extensionManager';

let extensionManager: ExtensionManager | null = null;

export function activate(context: vscode.ExtensionContext): void {
	try {
		extensionManager = new ExtensionManager(context);
		context.subscriptions.push(extensionManager);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		vscode.window.showErrorMessage(`Failed to activate File Insights: ${errorMessage}`);
		throw error;
	}
}

export function deactivate(): void {
	if (extensionManager) {
		extensionManager.dispose();
		extensionManager = null;
	}
}

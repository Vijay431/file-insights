import * as vscode from 'vscode';
import { statSync } from 'fs-extra';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	// Register commands
	const activateCommand = vscode.commands.registerCommand('file-insights.activate', () => {
		vscode.window.showInformationMessage('File insights extension has been activated successfully');
		initializeStatusBar();
	});

	const deactivateCommand = vscode.commands.registerCommand('file-insights.deactivate', () => {
		cleanupAndDeactivate();
	});

	// Add commands to subscriptions
	context.subscriptions.push(activateCommand, deactivateCommand);

	// Initialize status bar
	initializeStatusBar();

	// Add status bar to subscriptions
	context.subscriptions.push(statusBarItem);
}

export function deactivate() {
	cleanupAndDeactivate();
}

function initializeStatusBar() {
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

	// Register event listeners
	vscode.window.onDidChangeActiveTextEditor(() => {
		const isAnyFileOpen = vscode.window.activeTextEditor !== undefined;

		if (isAnyFileOpen) {
			statusBarItem.text = `File size: ${getFileSize()}`;
			statusBarItem.show();
		} else {
			statusBarItem.hide();
		}
	});

	vscode.workspace.onDidChangeTextDocument(() => {
		statusBarItem.text = `File size: ${getFileSize()}`;
		statusBarItem.show();
	});

	// Initial update
	if (vscode.window.activeTextEditor) {
		statusBarItem.text = `File size: ${getFileSize()}`;
		statusBarItem.show();
	}
}

function cleanupAndDeactivate() {
	statusBarItem.hide();
	statusBarItem.dispose();

	vscode.window
		.showInformationMessage(
			'Thank you for using File Insights! We appreciate your feedback. Would you like to rate the extension?',
			'Rate Extension',
		)
		.then((selection) => {
			if (selection === 'Rate Extension') {
				vscode.env.openExternal(
					vscode.Uri.parse(
						'https://marketplace.visualstudio.com/items?itemName=vscode-samples.status-ts&ssr=false#review-details',
					),
				);
			}
		});
}

function getFileSize(): string {
	const fileSize = statSync(vscode.window.activeTextEditor?.document.uri.fsPath || '').size.toString();

	const fileSizeBytes = parseInt(fileSize);
	if (fileSizeBytes < 1024) {
		return `${fileSizeBytes} B`;
	} else if (fileSizeBytes < 1024 * 1024) {
		return `${(fileSizeBytes / 1024).toFixed(2)} KB`;
	} else {
		return `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
	}
}

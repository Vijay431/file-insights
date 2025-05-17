import * as vscode from 'vscode';
import { statSync } from 'fs-extra';

// Declare a global StatusBarItem that will display file size
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	// Register two commands that can be called from the command palette
	const [activateCommand, deactivateCommand] = [
		vscode.commands.registerCommand('file-insights.activate', () => {
			vscode.window.showInformationMessage('File Insights extension has been activated successfully');
			initializeStatusBar();
		}),
		vscode.commands.registerCommand('file-insights.deactivate', () => {
			vscode.window.showInformationMessage('File Insights extension has been deactivated successfully');
			cleanupAndDeactivate();
		}),
	];

	// Add the commands to the extension's subscriptions so they get disposed automatically
	context.subscriptions.push(activateCommand, deactivateCommand);

	// Set up the status bar when the extension activates
	initializeStatusBar();

	// Add the status bar item to subscriptions for proper cleanup
	context.subscriptions.push(statusBarItem);
}

// Called when the extension is deactivated
export function deactivate() {
	cleanupAndDeactivate();
}

// Initialize the status bar item and set up event listeners
function initializeStatusBar() {
	// Create a status bar item on the right side with priority 100
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

	// Update file size when user switches between editor tabs
	vscode.window.onDidChangeActiveTextEditor(() => {
		const isAnyFileOpen = vscode.window.activeTextEditor !== undefined;

		if (isAnyFileOpen) {
			statusBarItem.text = `File size: ${getFileSize()}`;
			statusBarItem.show();
		} else {
			statusBarItem.hide();
		}
	});

	// Update file size when the content of the file changes
	vscode.workspace.onDidChangeTextDocument(() => {
		statusBarItem.text = `File size: ${getFileSize()}`;
		statusBarItem.show();
	});

	// Show initial file size if a file is already open
	if (vscode.window.activeTextEditor) {
		statusBarItem.text = `File size: ${getFileSize()}`;
		statusBarItem.show();
	}
}

// Clean up resources and show rating prompt
function cleanupAndDeactivate() {
	// Remove the status bar item
	statusBarItem.hide();
	statusBarItem.dispose();

	// Show a message asking user to rate the extension
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

// Calculate and format the file size in B, KB, or MB
function getFileSize(): string {
	// Get the size of the current file in bytes
	const fileSize = statSync(vscode.window.activeTextEditor?.document.uri.fsPath || '').size.toString();

	const fileSizeBytes = parseInt(fileSize);
	// Format the size based on its magnitude
	if (fileSizeBytes < 1024) {
		return `${fileSizeBytes} B`;
	} else if (fileSizeBytes < 1024 * 1024) {
		return `${(fileSizeBytes / 1024).toFixed(2)} KB`;
	} else {
		return `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
	}
}

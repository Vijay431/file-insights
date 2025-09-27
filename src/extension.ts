import * as vscode from 'vscode';

import { ExtensionManager } from './managers/extensionManager';

let extensionManager: ExtensionManager | null = null;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    extensionManager = new ExtensionManager();
    await extensionManager.activate(context);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to activate File Insights v2.0.0: ${errorMessage}`);
    throw error;
  }
}

export function deactivate(): void {
  if (extensionManager) {
    extensionManager.deactivate();
    extensionManager = null;
  }
}

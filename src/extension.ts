import * as vscode from 'vscode';

import { initializeContainer, container } from './di';
import { TYPES } from './di/types';
import type { IExtensionManager } from './di/interfaces/IExtensionManager';

let extensionManager: IExtensionManager | null = null;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    // Initialize DI container with all services and managers
    await initializeContainer(context);

    // Resolve and activate extension manager from DI container
    extensionManager = container.get<IExtensionManager>(TYPES.ExtensionManager);
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

  // Clear DI container
  container.clear();
}

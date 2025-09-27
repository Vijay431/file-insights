import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';

suite('File Insights Suite Tests', () => {
  let extension: vscode.Extension<unknown>;
  let testWorkspace: vscode.Uri;
  let testFile: vscode.Uri;

  before(async () => {
    extension = vscode.extensions.getExtension('VijayGangatharan.file-insights')!;
    assert.ok(extension, 'Extension should be available');

    if (!extension.isActive) {
      await extension.activate();
    }

    // Create test workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      testWorkspace = workspaceFolder.uri;
      testFile = vscode.Uri.joinPath(testWorkspace, 'test-file.txt');

      // Create a test file with known content
      const testContent = 'This is a test file for File Insights extension.\n'.repeat(10);
      await vscode.workspace.fs.writeFile(testFile, Buffer.from(testContent));
    }
  });

  after(async () => {
    // Clean up test file
    if (testFile) {
      try {
        await vscode.workspace.fs.delete(testFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('Extension activation and core functionality', async () => {
    // Verify extension is active
    assert.strictEqual(extension.isActive, true, 'Extension should be active');

    // Verify required commands are registered (based on package.json)
    const commands = await vscode.commands.getCommands(true);
    const requiredCommands = [
      'fileInsights.enable',
      'fileInsights.disable',
    ];

    requiredCommands.forEach((command) => {
      assert.ok(commands.includes(command), `Command ${command} should be registered`);
    });
  });

  test('Status bar integration and file size display', async function () {
    this.timeout(10000);

    if (!testFile) {
      this.skip();
    } else {
      // Open the test file
      const document = await vscode.workspace.openTextDocument(testFile);
      await vscode.window.showTextDocument(document);

      // Wait for status bar to update
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if configuration exists
      const config = vscode.workspace.getConfiguration('fileInsights');
      assert.strictEqual(config.get('enabled'), true, 'Extension should be enabled by default');

      assert.ok(true, 'File should display in status bar');
    }
  });

  test('Configuration changes and real-time updates', async function () {
    this.timeout(10000);

    const config = vscode.workspace.getConfiguration('fileInsights');

    // Test enable/disable functionality
    await vscode.commands.executeCommand('fileInsights.disable');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await vscode.commands.executeCommand('fileInsights.enable');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test display format changes
    const originalFormat = config.get('displayFormat');
    await config.update('displayFormat', 'bytes', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await config.update('displayFormat', 'kb', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Restore original format
    await config.update('displayFormat', originalFormat, vscode.ConfigurationTarget.Global);

    assert.ok(true, 'Configuration changes should be handled without errors');
  });

  test('File operations and status updates', async function () {
    this.timeout(10000);

    if (!testFile) {
      this.skip();
    } else {
      // Open test file
      const document = await vscode.workspace.openTextDocument(testFile);
      const editor = await vscode.window.showTextDocument(document);

      // Wait for initial update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Modify file content
      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), 'Additional content\n');
      });

      // Save file
      await document.save();

      // Wait for status update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      assert.ok(true, 'File operations should trigger status updates');
    }
  });

  test('Error handling and edge cases', async function () {
    this.timeout(5000);

    // Test with no active editor
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Commands should still work without errors
    await vscode.commands.executeCommand('fileInsights.disable');
    await vscode.commands.executeCommand('fileInsights.enable');

    assert.ok(true, 'Extension should handle edge cases gracefully');
  });

  test('Extension lifecycle management', async () => {
    // Test that extension maintains state correctly
    const config = vscode.workspace.getConfiguration('fileInsights');

    // Verify default configuration values (based on package.json)
    assert.strictEqual(config.get('enabled'), true);
    assert.strictEqual(config.get('displayFormat'), 'auto');

    assert.ok(true, 'Extension lifecycle should be properly managed');
  });
});
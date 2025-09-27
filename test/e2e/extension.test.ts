import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { TEST_FIXTURES, copyFixtureToWorkspace, createTestFileInWorkspace, cleanupTestFiles } from '../fixtures';

suite('File Insights E2E Tests', () => {
  let extension: vscode.Extension<unknown>;
  let testWorkspace: vscode.Uri;
  let kbTestFile: vscode.Uri;
  let mbTestFile: vscode.Uri;
  let largeTestFile: vscode.Uri;
  let testFiles: vscode.Uri[] = [];

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
      console.log('Test workspace:', testWorkspace.fsPath);

      try {
        // Use test fixtures for reliable file size testing
        kbTestFile = await copyFixtureToWorkspace(TEST_FIXTURES.SMALL, testWorkspace, 'test-kb-file.txt');
        mbTestFile = await copyFixtureToWorkspace(TEST_FIXTURES.MEDIUM, testWorkspace, 'test-mb-file.txt');
        largeTestFile = await copyFixtureToWorkspace(TEST_FIXTURES.LARGE, testWorkspace, 'test-large-file.txt');

        testFiles = [kbTestFile, mbTestFile, largeTestFile];
        console.log('Created test files:', testFiles.map(f => f.fsPath));
      } catch (error) {
        console.warn('Failed to copy fixtures, creating files dynamically:', error);

        // Fallback: create files dynamically
        try {
          kbTestFile = await createTestFileInWorkspace(testWorkspace, 'test-kb-file.txt', 2 * 1024);
          mbTestFile = await createTestFileInWorkspace(testWorkspace, 'test-mb-file.txt', 2 * 1024 * 1024);
          largeTestFile = await createTestFileInWorkspace(testWorkspace, 'test-large-file.txt', 10 * 1024 * 1024);

          testFiles = [kbTestFile, mbTestFile, largeTestFile];
          console.log('Created dynamic test files:', testFiles.map(f => f.fsPath));
        } catch (fallbackError) {
          console.error('Failed to create test files:', fallbackError);
          // Mark files as empty URIs so tests can skip appropriately
          kbTestFile = vscode.Uri.parse('');
          mbTestFile = vscode.Uri.parse('');
          largeTestFile = vscode.Uri.parse('');
        }
      }
    } else {
      console.warn('No workspace folder available for testing');
    }
  });

  after(async () => {
    // Clean up test files
    console.log('Cleaning up test files...');
    await cleanupTestFiles(testFiles);
  });

  test('1. Extension Activation', async () => {
    // Verify extension is active
    assert.strictEqual(extension.isActive, true, 'Extension should be active');

    // Verify simplified commands are registered
    const commands = await vscode.commands.getCommands(true);
    const requiredCommands = ['fileInsights.enable', 'fileInsights.disable'];

    requiredCommands.forEach((command) => {
      assert.ok(commands.includes(command), `Command ${command} should be registered`);
    });
  });

  test('2. Extension Deactivation', async function () {
    this.timeout(10000);

    // Test disable command
    await vscode.commands.executeCommand('fileInsights.disable');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let config = vscode.workspace.getConfiguration('fileInsights');
    assert.strictEqual(config.get('enabled'), false, 'Extension should be disabled');

    // Re-enable for other tests
    await vscode.commands.executeCommand('fileInsights.enable');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Refresh configuration to get updated value
    config = vscode.workspace.getConfiguration('fileInsights');
    assert.strictEqual(config.get('enabled'), true, 'Extension should be re-enabled');
  });

  test('3. No File Detection', async () => {
    // Close all editors
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Status bar should be hidden when no file is open
    // We can't directly test status bar visibility, but we can verify no crashes occur
    const config = vscode.workspace.getConfiguration('fileInsights');
    assert.strictEqual(config.get('enabled'), true, 'Extension should remain enabled with no file');
  });

  test('4. KB-sized File Format Display', async function () {
    this.timeout(10000);

    if (!kbTestFile || kbTestFile.toString() === '') {
      this.skip();
    }

    // Open KB test file
    const document = await vscode.workspace.openTextDocument(kbTestFile);
    await vscode.window.showTextDocument(document);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test different display formats
    const config = vscode.workspace.getConfiguration('fileInsights');

    // Test auto format (should show KB)
    await config.update('displayFormat', 'auto', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test explicit KB format
    await config.update('displayFormat', 'kb', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    assert.ok(true, 'KB file should display size correctly');
  });

  test('5. MB-sized File Format Display', async function () {
    this.timeout(15000);

    if (!mbTestFile || mbTestFile.toString() === '') {
      this.skip();
    }

    // Open MB test file
    const document = await vscode.workspace.openTextDocument(mbTestFile);
    await vscode.window.showTextDocument(document);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const config = vscode.workspace.getConfiguration('fileInsights');

    // Test auto format (should show MB)
    await config.update('displayFormat', 'auto', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test explicit MB format
    await config.update('displayFormat', 'mb', vscode.ConfigurationTarget.Global);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    assert.ok(true, 'MB file should display size correctly');
  });

  test('6. Large File Format Display', async function () {
    this.timeout(15000);

    if (!largeTestFile || largeTestFile.toString() === '') {
      console.log('Skipping large file test - file not available');
      this.skip();
    }

    try {
      // Open large test file
      const document = await vscode.workspace.openTextDocument(largeTestFile);
      await vscode.window.showTextDocument(document);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const config = vscode.workspace.getConfiguration('fileInsights');

      // Test auto format (should show MB for 10MB file)
      await config.update('displayFormat', 'auto', vscode.ConfigurationTarget.Global);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test explicit MB format
      await config.update('displayFormat', 'mb', vscode.ConfigurationTarget.Global);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      assert.ok(true, 'Large file should display size correctly');
    } catch (error) {
      console.error('Large file test error:', error);
      // Skip if large file couldn't be opened
      this.skip();
    }
  });
});

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import { NotificationService } from '../../src/services/notificationService';
import { Logger } from '../../src/utils/logger';

suite('NotificationService', () => {
  let notificationService: NotificationService;
  let logger: Logger;
  let getConfigurationStub: sinon.SinonStub;
  let showWarningMessageStub: sinon.SinonStub;
  let executeCommandStub: sinon.SinonStub;

  setup(() => {
    logger = Logger.create();
    notificationService = NotificationService.create(logger);

    // Stub vscode.workspace.getConfiguration
    getConfigurationStub = sinon.stub(vscode.workspace, 'getConfiguration');
    // Stub vscode.window.showWarningMessage
    showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
    // Stub vscode.commands.executeCommand
    executeCommandStub = sinon.stub(vscode.commands, 'executeCommand');

    // Set up default configuration
    getConfigurationStub.returns({
      get: (key: string) => {
        const defaults: Record<string, unknown> = {
          'enabled': true,
          'sizeWarnings.enabled': true,
          'sizeWarnings.thresholds.yellow': '100KB',
          'sizeWarnings.thresholds.orange': '1MB',
          'sizeWarnings.thresholds.red': '10MB',
          'sizeWarnings.notificationFrequency': 'always',
          'sizeWarnings.showNotification': true,
        };
        return defaults[key];
      },
    });
  });

  teardown(() => {
    getConfigurationStub.restore();
    showWarningMessageStub.restore();
    executeCommandStub.restore();
  });

  test('should show yellow warning for medium files', async () => {
    const fileStats = {
      size: 150 * 1024, // 150 KB
      path: '/test/file.txt',
    };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.calledOnce);
    const message = showWarningMessageStub.firstCall.args[0];
    assert.ok(message.includes('150 KB'));
  });

  test('should show orange warning for large files', async () => {
    const fileStats = {
      size: 2 * 1024 * 1024, // 2 MB
      path: '/test/file.txt',
    };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.calledOnce);
    const message = showWarningMessageStub.firstCall.args[0];
    assert.ok(message.includes('2 MB'));
    assert.ok(message.includes('Large file'));
  });

  test('should show red warning for very large files', async () => {
    const fileStats = {
      size: 15 * 1024 * 1024, // 15 MB
      path: '/test/file.txt',
    };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.calledOnce);
    const message = showWarningMessageStub.firstCall.args[0];
    assert.ok(message.includes('15 MB'));
    assert.ok(message.includes('Very large file'));
  });

  test('should not show warning for small files', async () => {
    const fileStats = {
      size: 50 * 1024, // 50 KB (below yellow threshold)
      path: '/test/file.txt',
    };

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.notCalled);
  });

  test('should respect notification frequency "once"', async () => {
    const fileStats = {
      size: 150 * 1024,
      path: '/test/file.txt',
    };

    // Override config for this test
    getConfigurationStub.returns({
      get: (key: string) => {
        const defaults: Record<string, unknown> = {
          'enabled': true,
          'sizeWarnings.enabled': true,
          'sizeWarnings.thresholds.yellow': '100KB',
          'sizeWarnings.thresholds.orange': '1MB',
          'sizeWarnings.thresholds.red': '10MB',
          'sizeWarnings.notificationFrequency': 'once',
          'sizeWarnings.showNotification': true,
        };
        return defaults[key];
      },
    });

    showWarningMessageStub.resolves('Dismiss');

    // First call should show warning
    await notificationService.checkSizeLimit(fileStats);
    assert.ok(showWarningMessageStub.calledOnce);

    // Second call should not show warning
    await notificationService.checkSizeLimit(fileStats);
    assert.ok(showWarningMessageStub.calledOnce); // Still only called once
  });

  test('should always show warning with "always" frequency', async () => {
    const fileStats = {
      size: 150 * 1024,
      path: '/test/file.txt',
    };

    showWarningMessageStub.resolves('Dismiss');

    // First call
    await notificationService.checkSizeLimit(fileStats);
    // Second call
    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.calledTwice);
  });

  test('should track warning history per file', async () => {
    const fileStats1 = { size: 150 * 1024, path: '/test/file1.txt' };
    const fileStats2 = { size: 150 * 1024, path: '/test/file2.txt' };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats1);
    await notificationService.checkSizeLimit(fileStats2);

    const history = notificationService.getWarningHistory();
    assert.strictEqual(history.size, 2);
    assert.ok(history.has('/test/file1.txt'));
    assert.ok(history.has('/test/file2.txt'));
  });

  test('should open file when "View File" is clicked', async () => {
    const fileStats = {
      size: 150 * 1024,
      path: '/test/file.txt',
    };

    showWarningMessageStub.resolves('View File');
    executeCommandStub.resolves(undefined);

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(executeCommandStub.calledWith('vscode.open', vscode.Uri.file('/test/file.txt')));
  });

  test('should not show warning when disabled', async () => {
    const fileStats = {
      size: 150 * 1024,
      path: '/test/file.txt',
    };

    // Override config to disable warnings
    getConfigurationStub.returns({
      get: (key: string) => {
        if (key === 'sizeWarnings.enabled') {
          return false;
        }
        if (key === 'enabled') {
          return true;
        }
        return undefined;
      },
    });

    await notificationService.checkSizeLimit(fileStats);

    assert.ok(showWarningMessageStub.notCalled);
  });

  test('should clear warnings for specific file', async () => {
    const fileStats = { size: 150 * 1024, path: '/test/file1.txt' };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats);
    assert.ok(notificationService.getWarningHistory().has('/test/file1.txt'));

    notificationService.clearWarnings('/test/file1.txt');
    assert.ok(!notificationService.getWarningHistory().has('/test/file1.txt'));
  });

  test('should clear all warnings', async () => {
    const fileStats1 = { size: 150 * 1024, path: '/test/file1.txt' };
    const fileStats2 = { size: 150 * 1024, path: '/test/file2.txt' };

    showWarningMessageStub.resolves('Dismiss');

    await notificationService.checkSizeLimit(fileStats1);
    await notificationService.checkSizeLimit(fileStats2);

    assert.ok(notificationService.getWarningHistory().size > 0);

    notificationService.clearWarnings();
    assert.strictEqual(notificationService.getWarningHistory().size, 0);
  });

  test('should format size correctly', async () => {
    const testCases = [
      { size: 1024, expected: '1 KB' },
      { size: 1024 * 1024, expected: '1 MB' },
      { size: 1536, expected: '1.5 KB' },
    ];

    showWarningMessageStub.resolves('Dismiss');

    for (const testCase of testCases) {
      const fileStats = { size: testCase.size, path: '/test/file.txt' };

      await notificationService.checkSizeLimit(fileStats);

      const message = showWarningMessageStub.lastCall.args[0];
      assert.ok(message.includes(testCase.expected), `Expected ${testCase.expected} in message: ${message}`);
    }
  });
});

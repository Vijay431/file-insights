import * as assert from 'assert';
import * as vscode from 'vscode';

import { FileStatsService } from '../../src/services/fileStatsService';

suite('FileStatsService', () => {
  const service = FileStatsService.getInstance();

  test('validates supported file schemes', async function () {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.skip();
    }

    const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, 'file-stats-service.txt');
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from('insights'));

    const document = await vscode.workspace.openTextDocument(fileUri);
    assert.ok(service.isValidFile(document));

    await vscode.workspace.fs.delete(fileUri);
  });

  test('returns file stats using workspace APIs', async function () {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.skip();
    }

    const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, 'file-stats-service-size.txt');
    const content = 'File Insights rocks!';
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content));

    const stats = await service.getFileStats(fileUri);
    assert.ok(stats);
    assert.strictEqual(stats?.size, Buffer.byteLength(content));
    assert.ok(stats?.lastModified instanceof Date);

    await vscode.workspace.fs.delete(fileUri);
  });

  test('handles invalid resources gracefully', async () => {
    const untitled = await vscode.workspace.openTextDocument({ content: 'draft content' });
    assert.strictEqual(service.isValidFile(untitled), false);
  });
});

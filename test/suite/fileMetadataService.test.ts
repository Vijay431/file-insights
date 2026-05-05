import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import { FileMetadataService } from '../../src/services/fileMetadataService';
import { Logger } from '../../src/utils/logger';

suite('FileMetadataService', () => {
  let metadataService: FileMetadataService;
  let logger: Logger;
  let readFileStub: sinon.SinonStub;
  let getWorkspaceFolderStub: sinon.SinonStub;

  setup(() => {
    logger = Logger.create();
    metadataService = FileMetadataService.create(logger);

    // Stub vscode.workspace.fs.readFile
    readFileStub = sinon.stub(vscode.workspace.fs, 'readFile');
    // Stub vscode.workspace.getWorkspaceFolder
    getWorkspaceFolderStub = sinon.stub(vscode.workspace, 'getWorkspaceFolder');
  });

  teardown(() => {
    readFileStub.restore();
    getWorkspaceFolderStub.restore();
  });

  test('should detect UTF-8 encoding', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const content = Buffer.from('Hello World', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.encoding, 'utf-8');
    assert.strictEqual(metadata.characterCount, 11);
    assert.strictEqual(metadata.lineCount, 1);
  });

  test('should detect UTF-16 LE encoding with BOM', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const buffer = Buffer.from([0xff, 0xfe, 0x48, 0x00, 0x65, 0x00]); // "He" in UTF-16 LE

    readFileStub.resolves(buffer);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.encoding, 'utf-16le');
    assert.ok(metadata.byteOrderMark);
  });

  test('should count lines correctly for Unix line endings', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const content = Buffer.from('line1\nline2\nline3', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.lineCount, 3);
  });

  test('should count lines correctly for Windows line endings', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const content = Buffer.from('line1\r\nline2\r\nline3', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.lineCount, 3);
  });

  test('should count characters correctly', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const content = Buffer.from('Hello 世界!', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    // Characters: H-e-l-l-o- -世-界-! = 9 characters
    assert.strictEqual(metadata.characterCount, 9);
  });

  test('should identify file type from extension', async () => {
    const uri = vscode.Uri.file('/test/file.ts');
    const content = Buffer.from('export {}', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.fileType, '.ts');
  });

  test('should return (none) for files without extension', async () => {
    const uri = vscode.Uri.file('/test/Makefile');
    const content = Buffer.from('all:', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.fileType, '(none)');
  });

  test('should detect binary files by extension', async () => {
    const uri = vscode.Uri.file('/test/image.png');
    const content = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG signature

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.isBinary, true);
  });

  test('should detect binary files by null byte ratio', async () => {
    const uri = vscode.Uri.file('/test/file.dat');
    // Create buffer with >3% null bytes
    const content = Buffer.alloc(100);
    for (let i = 0; i < 4; i++) {
      content[i] = 0; // 4% null bytes
    }

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.isBinary, true);
  });

  test('should return relative path when in workspace', async () => {
    const uri = vscode.Uri.file('/workspace/src/file.ts');
    const workspaceFolder = {
      uri: vscode.Uri.file('/workspace'),
      name: 'workspace',
      index: 0,
    };

    readFileStub.resolves(Buffer.from('export {}', 'utf-8'));
    getWorkspaceFolderStub.returns(workspaceFolder);

    const metadata = await metadataService.getMetadata(uri);

    assert.ok(metadata.relativePath.includes('src/file.ts'));
  });

  test('should handle read errors gracefully', async () => {
    const uri = vscode.Uri.file('/test/file.txt');

    readFileStub.rejects(new Error('Permission denied'));
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    // Should return fallback metadata
    assert.strictEqual(metadata.lineCount, 0);
    assert.strictEqual(metadata.characterCount, 0);
    assert.strictEqual(metadata.encoding, 'utf-8');
  });

  test('should return 0 lines for empty file', async () => {
    const uri = vscode.Uri.file('/test/empty.txt');
    const content = Buffer.from('', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.lineCount, 0);
  });

  test('should handle file with only whitespace', async () => {
    const uri = vscode.Uri.file('/test/whitespace.txt');
    const content = Buffer.from('   \n   \n   ', 'utf-8');

    readFileStub.resolves(content);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    // Lines with whitespace should still be counted
    assert.ok(metadata.lineCount > 0);
  });

  test('should detect UTF-16 BE encoding with BOM', async () => {
    const uri = vscode.Uri.file('/test/file.txt');
    const buffer = Buffer.from([0xfe, 0xff, 0x00, 0x48]); // BOM + "H" in UTF-16 BE

    readFileStub.resolves(buffer);
    getWorkspaceFolderStub.returns(null);

    const metadata = await metadataService.getMetadata(uri);

    assert.strictEqual(metadata.encoding, 'utf-16be');
    assert.ok(metadata.byteOrderMark);
  });
});

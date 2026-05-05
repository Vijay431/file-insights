import * as path from 'path';
import * as vscode from 'vscode';
import { FileInsightsConfig } from '../../src/types/extension';

/**
 * Test fixture configuration for File Insights extension testing
 */

export interface TestFixture {
  name: string;
  fileName: string;
  filePath: string;
  expectedSize: number;
  expectedFormat: string;
  description: string;
}

/**
 * Pre-created test fixture files with known sizes
 */
export const TEST_FIXTURES = {
  SMALL: {
    name: 'SMALL',
    fileName: 'small-file.txt',
    filePath: path.join(__dirname, 'small-file.txt'),
    expectedSize: 2048, // 2KB
    expectedFormat: 'KB',
    description: '2KB test file for KB format testing'
  },
  MEDIUM: {
    name: 'MEDIUM',
    fileName: 'medium-file.txt',
    filePath: path.join(__dirname, 'medium-file.txt'),
    expectedSize: 2097152, // 2MB
    expectedFormat: 'MB',
    description: '2MB test file for MB format testing'
  },
  LARGE: {
    name: 'LARGE',
    fileName: 'large-file.txt',
    filePath: path.join(__dirname, 'large-file.txt'),
    expectedSize: 10485760, // 10MB
    expectedFormat: 'MB', // Since it's 10MB, it should display as MB
    description: '10MB test file for large file testing'
  }
} as const;

/**
 * Get a VS Code Uri for a test fixture
 */
export function getFixtureUri(fixture: TestFixture): vscode.Uri {
  return vscode.Uri.file(fixture.filePath);
}

/**
 * Get all test fixtures as an array
 */
export function getAllFixtures(): TestFixture[] {
  return Object.values(TEST_FIXTURES);
}

/**
 * Copy a fixture to a workspace location for testing
 */
export async function copyFixtureToWorkspace(
  fixture: TestFixture,
  workspaceUri: vscode.Uri,
  newFileName?: string
): Promise<vscode.Uri> {
  const fileName = newFileName || fixture.fileName;
  const targetUri = vscode.Uri.joinPath(workspaceUri, fileName);
  const sourceUri = getFixtureUri(fixture);

  const sourceData = await vscode.workspace.fs.readFile(sourceUri);
  await vscode.workspace.fs.writeFile(targetUri, sourceData);

  return targetUri;
}

/**
 * Create test files dynamically in workspace (fallback method)
 */
export async function createTestFileInWorkspace(
  workspaceUri: vscode.Uri,
  fileName: string,
  sizeInBytes: number
): Promise<vscode.Uri> {
  const fileUri = vscode.Uri.joinPath(workspaceUri, fileName);

  // Create content of specified size
  const content = 'A'.repeat(sizeInBytes);
  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content));

  return fileUri;
}

/**
 * Clean up test files from workspace
 */
export async function cleanupTestFiles(fileUris: vscode.Uri[]): Promise<void> {
  const cleanupPromises = fileUris.map(async (uri) => {
    try {
      await vscode.workspace.fs.delete(uri);
    } catch (error) {
      // Ignore cleanup errors
      console.warn(`Failed to cleanup test file: ${uri.fsPath}`, error);
    }
  });

  await Promise.all(cleanupPromises);
}

/**
 * Interface for exported settings structure
 */
export interface ExportedSettings {
  version: string;
  exportedAt: string;
  settings: Partial<FileInsightsConfig>;
}

/**
 * Create a mock settings JSON file in the workspace for testing import
 */
export async function createSettingsFile(
  workspaceUri: vscode.Uri,
  fileName: string,
  settings: Partial<FileInsightsConfig>
): Promise<vscode.Uri> {
  const fileUri = vscode.Uri.joinPath(workspaceUri, fileName);

  const exportedSettings: ExportedSettings = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    settings,
  };

  const content = JSON.stringify(exportedSettings, null, 2);
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));

  return fileUri;
}

/**
 * Create a file with invalid JSON for testing error handling
 */
export async function createInvalidJsonFile(
  workspaceUri: vscode.Uri,
  fileName: string,
  content: string
): Promise<vscode.Uri> {
  const fileUri = vscode.Uri.joinPath(workspaceUri, fileName);
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
  return fileUri;
}

/**
 * Read and parse an exported settings file
 */
export async function readExportedSettings(uri: vscode.Uri): Promise<ExportedSettings> {
  const content = await vscode.workspace.fs.readFile(uri);
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(content);
  return JSON.parse(text) as ExportedSettings;
}

/**
 * Verify a file exists and is readable
 */
export async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
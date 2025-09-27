import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../..');
		const extensionTestsPath = path.resolve(__dirname, './index.js');

		// Create a temporary workspace for testing
		const tempWorkspace = path.join(os.tmpdir(), 'file-insights-test-workspace');

		// Ensure workspace directory exists
		if (!fs.existsSync(tempWorkspace)) {
			fs.mkdirSync(tempWorkspace, { recursive: true });
		}

		console.log('Running E2E tests for File Insights v2.0.0');
		console.log('Extension development path:', extensionDevelopmentPath);
		console.log('Extension tests path:', extensionTestsPath);
		console.log('Test workspace:', tempWorkspace);

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				tempWorkspace, // Open the temp workspace
				'--disable-extensions',
				'--no-sandbox',
				'--disable-dev-shm-usage'
			]
		});

		// Clean up temp workspace after tests
		try {
			fs.rmSync(tempWorkspace, { recursive: true, force: true });
			console.log('Cleaned up test workspace');
		} catch (cleanupError) {
			console.warn('Failed to cleanup test workspace:', cleanupError);
		}
	} catch (err) {
		console.error('Failed to run tests:', err);
		process.exit(1);
	}
}

main();
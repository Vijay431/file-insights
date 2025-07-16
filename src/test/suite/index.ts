import * as path from 'path';
import fg from 'fast-glob';
import Mocha from 'mocha';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		(async () => {
			try {
				// Find all test files
				const testFiles = await fg('**/**.test.js', { 
					cwd: testsRoot,
					absolute: true
				});

				// Add each test file to mocha
				testFiles.forEach((file: string) => {
					mocha.addFile(file);
				});

				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		})();
	});
}
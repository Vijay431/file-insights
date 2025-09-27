# VS Code Extension Tests

This directory contains the test suite for the File Insights VS Code extension, written using `@vscode/test-cli` and `@vscode/test-electron`.

## Test Structure

```
test/
├── runTest.ts          # Test runner entry point
├── e2e/                # End-to-end tests
│   ├── runE2ETest.ts   # E2E test runner entry point
│   ├── index.ts        # E2E test suite index (Mocha configuration)
│   └── extension.test.ts         # Extension activation/deactivation tests
├── suite/              # Unit test suite
│   ├── index.ts        # Test suite index (Mocha configuration)
│   ├── extension.test.ts         # Extension activation/deactivation tests
│   ├── managers/
│   │   └── extensionManager.test.ts    # ExtensionManager tests
│   ├── services/
│   │   └── fileService.test.ts         # FileService tests
│   └── utils/
│       └── formatter.test.ts           # SizeFormatter tests
├── fixtures/           # Test fixture files
│   ├── small-file.txt  # KB-sized test file
│   ├── medium-file.txt # MB-sized test file
│   └── large-file.txt  # GB-sized test file (sparse)
└── README.md           # This file
```

## Test Framework

- **Test Framework**: Mocha with TDD interface
- **Test Runner**: @vscode/test-electron
- **File Discovery**: fast-glob
- **VS Code API**: Full VS Code extension testing environment

## Running Tests

### Prerequisites
```bash
npm install
```

### Run E2E Tests (Optimized)
```bash
npm test
```

### Run Full Tests
```bash
npm run test:full
```

### Clean Test Environment
```bash
npm run test:clean
```

## Test Categories

### 1. E2E Tests (`e2e/extension.test.ts`)
- Extension presence verification
- Extension activation testing
- Command registration verification
- Extension deactivation testing
- File size format display testing (KB, MB, GB)

### 2. Extension Tests (`suite/extension.test.ts`)
- Extension presence verification
- Extension activation testing
- Command registration verification
- Extension deactivation testing

### 3. ExtensionManager Tests (`managers/extensionManager.test.ts`)
- ExtensionManager initialization
- Command registration and execution
- Proper disposal and cleanup
- Event handling

### 4. FileService Tests (`services/fileService.test.ts`)
- File stats retrieval for valid files
- Error handling for non-existent files
- Unsupported URI scheme handling
- Document validation
- Directory path handling

### 5. SizeFormatter Tests (`utils/formatter.test.ts`)
- Byte formatting across different units
- Auto-format logic testing
- Zero size handling
- Tooltip generation
- Large file size handling

## Test Configuration

### VS Code Test Configuration (`.vscode-test.mjs`)
```javascript
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'dist/test/suite/*.test.js',
	mochaOptions: {
		ui: 'tdd',
		timeout: 20000
	}
});
```

### TypeScript Configuration
Tests are compiled using the test-specific TypeScript configuration (`tsconfig.test.json`), with output directed to the `dist/` directory.

## Key Features

### 1. Full VS Code Integration
- Tests run in a real VS Code environment
- Access to VS Code APIs and extension host
- Proper extension lifecycle testing

### 2. Comprehensive Coverage
- Extension activation/deactivation
- Core functionality testing
- Service layer testing
- Utility function testing
- File size display testing

### 3. Optimized Testing Strategy
- Minimal extension package for faster testing (85.5% size reduction)
- Isolated user data to prevent developer settings pollution
- Automatic cleanup to save disk space

### 4. Test Fixtures
- Pre-created test files with known sizes
- Cross-platform compatibility
- Reliable file size testing

### 5. Error Handling
- Graceful handling of test failures
- Proper cleanup after test runs
- Comprehensive error reporting

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Temporary files and resources are properly cleaned up
3. **Realistic Testing**: Tests use real VS Code APIs and file system operations
4. **Error Coverage**: Both success and error paths are tested
5. **Type Safety**: Full TypeScript support with proper typing
6. **Performance**: Optimized testing environment for faster execution

## Troubleshooting

### Common Issues

1. **Compilation Errors**: Ensure all dependencies are installed and TypeScript configuration is correct
2. **Path Issues**: VS Code test runner requires proper path resolution
3. **VS Code Version**: Ensure VS Code test version matches extension requirements
4. **File Creation Issues**: Check workspace permissions and disk space

### Debug Tips

1. Use `console.log` in tests for debugging
2. Check VS Code Developer Tools during test runs
3. Verify file paths and permissions for file system tests
4. Ensure proper VS Code extension manifest configuration
5. Use `npm run test:full` for complete environment testing

## Future Improvements

1. Add performance testing for large files
2. Implement visual regression testing for status bar
3. Add integration tests with real workspace scenarios
4. Implement test coverage reporting
5. Add automated testing in CI/CD pipeline
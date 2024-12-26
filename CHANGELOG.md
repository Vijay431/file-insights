# Change Log

All notable changes to the "File Insights" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2024-12-26

### Added

- Support for larger file sizes up to 1GB
- New status bar tooltip with detailed file information
- Configuration option to customize size display format

### Changed

- Improved performance for frequent file updates
- Enhanced status bar UI for better visibility
- Optimized extension activation time

### Fixed

- Issue with status bar not updating after file rename
- Memory leak in file watcher implementation
- Incorrect size calculation for certain file types

## [0.0.2] - 2024-12-26

### Changed

- Enhanced stability for real-time file size updates
- Improved error handling and exception management
- Performance optimizations for file monitoring

### Fixed

- Bug fixes related to status bar updates
- Memory usage optimizations
- Edge case handling for large files

## [0.0.1] - 2024-12-23

### Added

- Initial release of File Insights extension
- Real-time file size monitoring in the status bar
- Automatic size updates when file content changes
- Smart file size formatting (B, KB, MB)
- Command palette integration with activate/deactivate commands
- Status bar integration with right-aligned display
- Event listeners for file changes and editor switches
- Feedback prompt with marketplace rating option

### Technical

- TypeScript implementation with strict type checking
- ESLint configuration for code quality
- VS Code extension scaffolding
- Proper extension activation events
- Source maps for debugging support
- Webpack bundling configuration

### Documentation

- Comprehensive README with features, installation, and usage instructions
- Detailed extension marketplace description
- GitHub repository setup with issue templates
- MIT License documentation

### Development Setup

- VS Code launch configurations
- NPM scripts for building and packaging
- Development environment configurations
- Source control ignore patterns

[0.0.3]: https://github.com/Vijay431/vscode-browser-extension/releases/tag/v0.0.3
[0.0.2]: https://github.com/Vijay431/vscode-browser-extension/releases/tag/v0.0.2
[0.0.1]: https://github.com/Vijay431/vscode-browser-extension/releases/tag/v0.0.1

# Change Log

All notable changes to the "File Insights" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-17

### Added

- **GitHub Pages Documentation Website** - Professional documentation site with Jekyll
- **Comprehensive Documentation** - Multiple documentation pages including features, installation, and download guides
- **Professional Website Design** - Modern, responsive documentation with hero sections and feature highlights

### Changed

- Updated repository name from `vscode_file-insights_extension` to `file-insights`
- Updated all repository links and references
- Improved GitHub Actions CI/CD workflow with deployment integration
- Enhanced documentation for better clarity

### Technical

- **GitHub Pages Deployment Workflow** - Automated Jekyll site deployment on pushes to master
- **Jekyll Documentation Site** - Professional documentation website with custom styling
- **Ruby/Jekyll Integration** - Complete Jekyll setup with Gemfile and configuration
- Consolidated CI/CD workflows into a single pipeline
- Added automated VS Code Marketplace deployment
- Updated project metadata and configurations

### Documentation

- **Professional Landing Page** - Hero section with extension features and quick start guide
- **Feature Documentation** - Detailed feature pages with professional presentation
- **Installation Guides** - Comprehensive installation and setup documentation
- **Download Center** - Centralized download and installation resources

## [1.0.0] - 2025-07-16

### Added

- Modern enterprise-grade architecture with separation of concerns
- Comprehensive configuration system with real-time updates
- Advanced status bar management with positioning options
- Structured logging system with output channel integration
- Professional test suite with @vscode/test-electron
- Webpack bundling for optimized production builds
- Prettier code formatting integration
- Enhanced command system with detailed categorization

### Changed

- Complete architectural refactor with manager/service pattern
- Improved error handling and graceful degradation
- Enhanced performance with debounced updates
- Professional TypeScript implementation with strict typing
- Modernized build system with webpack configuration
- Updated VS Code API integration for better compatibility

### Technical

- ExtensionManager for centralized lifecycle management
- StatusBarManager for dedicated UI control
- ConfigurationService for settings integration
- FileService for file system operations
- Comprehensive utility modules (formatter, logger)
- Type definitions for better development experience
- ESLint configuration with TypeScript support
- Source maps for debugging support

### Documentation

- Comprehensive CLAUDE.md with development guidelines
- Updated README with modern feature descriptions
- Professional changelog format following Keep a Changelog
- Detailed architecture documentation
- Development command reference

## [0.1.0] - 2024-12-28

### Changed

- Updated icon and branding assets in cloud rather than local

## [0.0.4] - 2024-12-27

### Changed

- Updated documentation structure
- Updated README with clearer instructions
- Updated `assets` directory for better organization of images and icons
- Updated extension icon and branding assets for consistency and clarity

### Documentation

- Added detailed deployment checklist
- Enhanced README with clearer instructions
- Updated marketplace presentation
- Improved changelog format and structure

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

[1.1.0]: https://github.com/Vijay431/file-insights/releases/tag/v1.1.0
[1.0.0]: https://github.com/Vijay431/file-insights/releases/tag/v1.0.0
[0.1.0]: https://github.com/Vijay431/file-insights/releases/tag/v0.1.0
[0.0.4]: https://github.com/Vijay431/file-insights/releases/tag/v0.0.4
[0.0.3]: https://github.com/Vijay431/file-insights/releases/tag/v0.0.3
[0.0.2]: https://github.com/Vijay431/file-insights/releases/tag/v0.0.2
[0.0.1]: https://github.com/Vijay431/file-insights/releases/tag/v0.0.1

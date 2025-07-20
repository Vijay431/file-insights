# File Insights - VS Code Extension

A professional Visual Studio Code extension that provides real-time file size information and insights directly in your status bar with enterprise-grade architecture and advanced customization options.

📖 **[View Full Documentation](https://vijay431.github.io/file-insights/)** | 🚀 **[Quick Start Guide](https://vijay431.github.io/file-insights/installation)** | ✨ **[Feature Overview](https://vijay431.github.io/file-insights/features)**

## Features

### Core Functionality

- 📊 **Real-time file size monitoring** with intelligent updates
- 🔄 **Automatic updates** when file content changes or files are switched
- 📏 **Smart size formatting** (auto, bytes, KB, MB) with customizable display
- 🎯 **Advanced status bar integration** with configurable positioning
- ⚡ **Performance optimized** with debounced updates and minimal resource usage
- 📁 **Large file support** up to configurable size limits (default 1GB)

### Professional Features

- 🎛️ **Comprehensive configuration system** with real-time updates
- 📝 **Detailed tooltips** with file information on hover
- 🔧 **Extensive command palette integration** with categorized commands
- 📊 **Structured logging** with dedicated output channel for debugging
- 🏗️ **Enterprise-grade architecture** with separation of concerns
- 🧪 **Professional test suite** ensuring reliability and quality

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
3. Type `ext install VijayGangatharan.file-insights`
4. Press Enter

## Usage

The extension automatically displays the current file size in the status bar when:

- Opening a file
- Switching between files
- Modifying file content

### Status Bar Display

The file size is shown in the status bar with a smart format (B, KB, MB) based on the file size. The status bar display is right-aligned for better visibility.

#### How it looks?

![Status Bar](https://88tynjcpeunoim0x.public.blob.vercel-storage.com/image/vscode-file_insights-extension/status-bar.png)

#### How to activate/deactivate?

![VSCode Command search](https://88tynjcpeunoim0x.public.blob.vercel-storage.com/image/vscode-file_insights-extension/vscode-command.png)

### Commands

File Insights provides comprehensive command palette integration (accessible via `Ctrl+Shift+P` or `Cmd+Shift+P`):

- `File Insights: Enable` - Enable the extension
- `File Insights: Disable` - Disable the extension  
- `File Insights: Refresh` - Manually refresh file size information
- `File Insights: Show Details` - Display detailed file information
- `File Insights: Show Output Channel` - Open debug logs for troubleshooting

## Requirements

- Visual Studio Code version 1.90.0 or higher

## Extension Settings

File Insights provides extensive configuration options for customization:

### Core Settings

- `fileInsights.enabled` (boolean, default: `true`) - Enable or disable the extension
- `fileInsights.displayFormat` (string, default: `"auto"`) - Size display format
  - `"auto"` - Automatically choose the best format
  - `"bytes"` - Always show in bytes
  - `"kb"` - Always show in kilobytes  
  - `"mb"` - Always show in megabytes

### Display Settings

- `fileInsights.statusBarPosition` (string, default: `"right"`) - Status bar position
  - `"left"` - Left side of status bar
  - `"right"` - Right side of status bar
- `fileInsights.showTooltip` (boolean, default: `true`) - Show detailed tooltip on hover

### Performance Settings

- `fileInsights.refreshInterval` (number, default: `500`) - Refresh interval in milliseconds (100-5000ms)
- `fileInsights.maxFileSize` (number, default: `1073741824`) - Maximum file size to analyze in bytes (1GB default)

## Documentation

📖 **[Complete Documentation Website](https://vijay431.github.io/file-insights/)** - Professional documentation with comprehensive guides

### Quick Links

- 🚀 **[Installation Guide](https://vijay431.github.io/file-insights/installation)** - Step-by-step installation instructions
- ✨ **[Feature Overview](https://vijay431.github.io/file-insights/features)** - Detailed feature descriptions and screenshots
- 📥 **[Download Center](https://vijay431.github.io/file-insights/download)** - All download options and resources

## Known Issues

Please report any issues on our [GitHub repository](https://github.com/Vijay431/file-insights/issues).

## Release Notes

### 1.2.1 (Latest)

**Enhanced Community Features & Improved CI/CD**

- **Real-time GitHub Repository Statistics** - Dynamic display of stars and forks count on homepage
- **Community Gratitude Section** - Heartfelt appreciation message for users and contributors
- **Enhanced GitHub API Integration** - Live repository stats with intelligent caching
- **Improved CI/CD Coverage** - GitHub Actions now run on all branches for comprehensive testing
- **Enhanced Workflow Security** - Maintained deployment restrictions to master branch only
- **Better Pull Request Validation** - All PRs tested before merge regardless of target branch
- **Enhanced User Experience** - Loading states, animations, and mobile-optimized design

🌐 **[Visit Enhanced Documentation Website](https://vijay431.github.io/file-insights/)**

### 1.1.0

**GitHub Pages Documentation & Repository Improvements**

- **New Professional Documentation Website** - Complete Jekyll-powered documentation site
- **GitHub Pages Integration** - Automated deployment with comprehensive guides
- **Enhanced Documentation** - Feature pages, installation guides, and download center
- Updated repository structure and naming
- Enhanced CI/CD workflow with automated deployment
- Improved documentation and configuration
- Consolidated development workflows
- Added automated VS Code Marketplace deployment

### 1.0.0

**Major Release - Complete Architectural Overhaul**

#### New Features

- Modern enterprise-grade architecture with separation of concerns
- Comprehensive configuration system with real-time updates
- Advanced status bar management with positioning options
- Structured logging system with output channel integration
- Professional test suite with @vscode/test-electron
- Webpack bundling for optimized production builds
- Prettier code formatting integration
- Enhanced command system with detailed categorization

#### Technical Improvements

- ExtensionManager for centralized lifecycle management
- StatusBarManager for dedicated UI control
- ConfigurationService for settings integration
- FileService for file system operations
- Comprehensive utility modules (formatter, logger)
- Type definitions for better development experience
- ESLint configuration with TypeScript support
- Source maps for debugging support

#### Performance & Reliability

- Complete architectural refactor with manager/service pattern
- Improved error handling and graceful degradation
- Enhanced performance with debounced updates
- Professional TypeScript implementation with strict typing
- Modernized build system with webpack configuration
- Updated VS Code API integration for better compatibility

### 0.1.0

- Updated icon and branding assets in cloud rather than local

### 0.0.4

- Updated documentation structure
- Enhanced documentation and user guides
- Updated `assets` directory for better organization
- Updated extension icon and branding assets

### 0.0.3

- Added support for files up to 1GB
- New status bar tooltip with detailed file information
- Added configuration option to customize size display format
- Improved performance for frequent file updates
- Enhanced status bar UI for better visibility
- Optimized extension activation time
- Fixed issue with status bar not updating after file rename
- Fixed memory leak in file watcher implementation
- Fixed incorrect size calculation for certain file types

### 0.0.2

- Bug fixes and performance improvements
- Enhanced stability for real-time updates
- Improved error handling

### 0.0.1

Initial release of File Insights:

- Basic file size monitoring
- Status bar integration
- Real-time updates

## Architecture

File Insights follows a modern, enterprise-grade architecture with clear separation of concerns:

### Core Components

- **ExtensionManager** - Central coordinator for lifecycle management
- **StatusBarManager** - Dedicated UI control for status bar interactions
- **ConfigurationService** - VS Code settings integration with real-time updates
- **FileService** - File system operations with comprehensive error handling

### Utilities

- **Formatter** - Smart file size formatting with configurable options
- **Logger** - Structured logging with output channel integration
- **Type Definitions** - Comprehensive TypeScript interfaces for type safety

### Development

- **Professional Test Suite** - Comprehensive testing with @vscode/test-electron
- **Webpack Build System** - Optimized production builds with source maps
- **ESLint + Prettier** - Code quality and formatting standards
- **TypeScript** - Strict typing for enhanced development experience

## Contributing

We welcome contributions! Please feel free to submit a Pull Request on our [GitHub repository](https://github.com/Vijay431/file-insights).

### Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to launch extension development host
5. Run `npm test` to execute the test suite

### Available Commands

- `npm run compile` - Compile TypeScript files
- `npm run watch` - Watch mode for development
- `npm run package` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run test suite

## License

This extension is licensed under the [MIT License](LICENSE).

## Developer

- **Vijay Gangatharan**
- Email: <vijayanand431@gmail.com>
- [GitHub Repository](https://github.com/Vijay431/file-insights)

---

**Enjoy!** 🚀

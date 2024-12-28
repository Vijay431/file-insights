# File Insights - VS Code Extension

A Visual Studio Code extension that provides real-time file size information directly in your status bar.

## Features

- 📊 Real-time file size monitoring
- 🔄 Automatic updates when file content changes
- 📏 Smart size formatting (B, KB, MB)
- 🎯 Status bar integration with enhanced visibility
- ⚡ Lightweight and efficient
- 📁 Support for files up to 1GB

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

File Insights provides the following commands (accessible via Command Palette `Ctrl+Shift+P` or `Cmd+Shift+P`):

- `File insights: Activate` - Manually activate the extension
- `File insights: Deactivate` - Manually deactivate the extension

## Requirements

- Visual Studio Code version 1.90.0 or higher

## Extension Settings

This extension includes the following settings:

- `fileInsights.sizeFormat`: Customize how file sizes are displayed

## Known Issues

Please report any issues on our [GitHub repository](https://github.com/Vijay431/vscode_file-insights_extension/issues).

## Release Notes

### 0.0.4 (Latest)

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

## Contributing

We welcome contributions! Please feel free to submit a Pull Request on our [GitHub repository](https://github.com/Vijay431/vscode_file-insights_extension).

## License

This extension is licensed under the [MIT License](LICENSE).

## Developer

- **Vijay Gangatharan**
- [GitHub Repository](https://github.com/Vijay431/vscode_file-insights_extension)

---

**Enjoy!** 🚀

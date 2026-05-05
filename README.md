# File Insights v2.0.0

A lightweight Visual Studio Code extension that displays file size in the status bar with automatic formatting for bytes, KB, MB, and GB. Focused on simplicity and performance with minimal dependencies.

📖 **[View Documentation](https://vijay431.github.io/file-insights/)** | 🚀 **[Installation Guide](https://vijay431.github.io/file-insights/installation)** | ✨ **[Features](https://vijay431.github.io/file-insights/features)**

## Features

### Core Functionality

- 📊 **File size display** in status bar with low priority positioning
- 🔄 **Real-time updates** when switching files or saving changes
- 📏 **Automatic formatting** displays appropriate units (B, KB, MB, GB)
- ⚡ **Lightweight architecture** using internal Node.js modules only
- 🎯 **Minimal configuration** with essential settings only

### Simplified Design

- **Streamlined Architecture** - Focused managers for specific responsibilities
- **No External Dependencies** - Uses only VS Code APIs and Node.js built-ins
- **Low Resource Usage** - Optimized for performance and memory efficiency
- **Clean Separation** - Clear separation between UI, configuration, and file operations

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "File Insights"
4. Click Install

### From VSIX Package

1. Download the latest `.vsix` file from [Releases](https://github.com/Vijay431/file-insights/releases)
2. Open VS Code
3. Run `Extensions: Install from VSIX...` command
4. Select the downloaded file

## Configuration

Simple configuration options available in VS Code settings:

```json
{
  "fileInsights.enabled": true,
  "fileInsights.displayFormat": "auto"
}
```

### Settings

- `fileInsights.enabled` - Enable/disable the extension (default: `true`)
- `fileInsights.displayFormat` - Size format: `auto`, `bytes`, `kb`, `mb`, `gb` (default: `auto`)

## Commands

Access via Command Palette (Ctrl+Shift+P):

- `File Insights: Enable` - Enable the extension
- `File Insights: Disable` - Disable the extension

## How It Works

1. **Activation** - Extension starts when VS Code loads
2. **File Detection** - Monitors active editor changes
3. **Size Calculation** - Uses Node.js `fs.statSync()` for file statistics
4. **Status Bar Display** - Shows formatted size with file icon
5. **Format Selection** - Auto-selects appropriate unit or uses configured format

## Status Bar Display

The file size appears in the status bar (right side, low priority) with format:

- `📄 1.2 KB` - Kilobyte files
- `📄 2.5 MB` - Megabyte files
- `📄 1.1 GB` - Gigabyte files
- `📄 450 B` - Small files in bytes

## Development

### Building

```bash
pnpm run build        # Build extension
pnpm run watch        # Development mode
pnpm test            # Run E2E tests
pnpm run package     # Create VSIX package
```

### Testing

The extension includes 6 focused E2E tests:

1. Extension activation
2. Extension deactivation
3. No file detection (status bar hidden)
4. KB-sized file format display
5. MB-sized file format display
6. GB-sized file format display

```bash
pnpm test            # Run all tests
```

## Architecture

### Simplified Design (v2.0.0)

```
src/
├── extension.ts              # Main activation/deactivation
├── managers/
│   ├── extensionManager.ts   # Core extension lifecycle management
│   └── statusBarManager.ts   # Status bar UI handling
├── services/
│   ├── configurationService.ts  # Settings management
│   └── fileStatsService.ts     # File operations
├── utils/
│   ├── formatter.ts          # Size formatting utilities
│   └── logger.ts            # Logging functionality
└── types/
    ├── extension.ts          # TypeScript interfaces
    └── common.ts            # Common type definitions
```

### Key Principles

- **Focused Responsibilities** - Each component has a specific, well-defined role
- **Internal Dependencies** - Uses only Node.js built-ins and VS Code APIs
- **Performance First** - Minimal overhead and resource usage
- **Clean Architecture** - Readable, maintainable, and testable

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Changelog

### v2.0.0 (Latest)
- **BREAKING**: Simplified architecture with focused managers and services
- **BREAKING**: Removed external dependencies (fs-extra)
- **NEW**: GB file size format support
- **NEW**: Focused E2E test suite with 6 specific tests
- **IMPROVED**: Performance with minimal resource usage and streamlined services
- **REMOVED**: Complex configuration options and telemetry

### v1.x.x
- See [CHANGELOG.md](CHANGELOG.md) for previous versions

## License

[MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/Vijay431/file-insights/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Vijay431/file-insights/discussions)
- 📖 **Documentation**: [Project Website](https://vijay431.github.io/file-insights/)

## Author

**Vijay Gangatharan**
- GitHub: [@Vijay431](https://github.com/Vijay431)
- Email: vijayanand431@gmail.com

---

⭐ If you find this extension useful, please consider giving it a star on GitHub!
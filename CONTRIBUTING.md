# Contributing to File Insights

Thank you for your interest in contributing to File Insights! We welcome contributions from the community and appreciate your help in making this VS Code extension better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Visual Studio Code](https://code.visualstudio.com/) (for development and testing)
- [Git](https://git-scm.com/)

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Reports** - Help us identify and fix issues
- 🚀 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve or add documentation
- 🔧 **Code Contributions** - Fix bugs or implement features
- 🧪 **Testing** - Add or improve tests
- 🎨 **Design** - Improve UI/UX or visual assets

## Development Setup

### 1. Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/file-insights.git
   cd file-insights
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Commands

```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Build production bundle
npm run package

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Launch Development Environment

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Test your changes in the new VS Code window

## Making Changes

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Testing improvements

Examples:

- `feature/add-file-type-icons`
- `fix/status-bar-positioning`
- `docs/improve-setup-guide`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing changes
- `chore`: Maintenance tasks

Examples:

- `feat(statusbar): add file type icons to status bar`
- `fix(formatter): handle edge case for empty files`
- `docs(readme): update installation instructions`

### Code Architecture

File Insights follows a layered architecture:

```
src/
├── extension.ts              # Entry point
├── managers/
│   ├── extensionManager.ts   # Lifecycle management
│   └── statusBarManager.ts   # Status bar control
├── services/
│   ├── configurationService.ts # Settings integration
│   └── fileService.ts        # File operations
├── utils/
│   ├── formatter.ts          # Size formatting
│   └── logger.ts             # Logging utilities
└── types/
    └── extension.ts          # Type definitions
```

When making changes:

1. **Follow the existing architecture**
2. **Add new functionality to appropriate layers**
3. **Maintain separation of concerns**
4. **Use proper TypeScript typing**

## Submitting Changes

### Pull Request Process

1. **Update Documentation** - Update README.md, CHANGELOG.md, and code comments
2. **Add Tests** - Include tests for new functionality
3. **Run Quality Checks**:

   ```bash
   npm run lint
   npm run format
   npm test
   npm run compile
   ```

4. **Create Pull Request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots (if UI changes)
   - Testing instructions

### Pull Request Template

When creating a PR, please fill out the template with:

- **Description** - What changes were made and why
- **Type of Change** - Feature, bug fix, documentation, etc.
- **Testing** - How was this tested
- **Checklist** - Ensure all requirements are met

### Review Process

1. **Automated Checks** - CI/CD pipeline must pass
2. **Code Review** - At least one maintainer review
3. **Testing** - Functional testing on multiple platforms
4. **Documentation** - Ensure docs are updated
5. **Merge** - Squash and merge after approval

## Style Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Enable **strict mode** compliance
- Use **meaningful variable names**
- Add **JSDoc comments** for public functions
- Follow **ESLint rules** configured in the project

### Code Formatting

- Use **Prettier** for consistent formatting
- Run `npm run format` before committing
- Use **2 spaces** for indentation
- Use **semicolons** at line endings
- Use **single quotes** for strings

### File Organization

- Keep files **focused and small**
- Use **descriptive file names**
- Group related functionality
- Follow the existing **directory structure**

## Testing

### Test Types

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Compile test files
npm run compile-tests
```

### Writing Tests

- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)
- Test **both success and error cases**
- Mock external dependencies
- Update tests when changing functionality

### Test Structure

```typescript
suite('Component Name', () => {
  test('should do something when condition is met', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    assert.strictEqual(result, expectedOutput);
  });
});
```

## Documentation

### README Updates

When making changes that affect users:

- Update feature descriptions
- Add new configuration options
- Update screenshots if UI changes
- Modify installation or usage instructions

### Code Documentation

- Add **JSDoc comments** for public APIs
- Include **parameter descriptions**
- Document **return types**
- Add **usage examples** for complex functions

### CHANGELOG

Update `CHANGELOG.md` for:

- **New features** - Added functionality
- **Bug fixes** - Resolved issues
- **Breaking changes** - Incompatible changes
- **Deprecated features** - Features being removed

## Community

### Getting Help

- **GitHub Issues** - Report bugs or request features
- **GitHub Discussions** - Ask questions and share ideas
- **Email** - Contact maintainer at <vijayanand431@gmail.com>

### Recognition

Contributors are recognized in:

- **README.md** - Contributors section
- **Release Notes** - Major contribution acknowledgments
- **GitHub** - Contributor graphs and statistics

## Development Tips

### VS Code Extensions

Helpful extensions for development:

- **TypeScript Importer** - Auto-import management
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitLens** - Git integration

### Debugging

1. **Use VS Code debugger** - Set breakpoints in source code
2. **Console logging** - Use the logger utility for debugging
3. **Extension Host** - Check Developer Tools in Extension Development Host
4. **Output Channel** - Monitor "File Insights" output channel

### Performance Considerations

- **Minimize file system operations**
- **Use debouncing** for frequent updates
- **Implement proper disposal** of resources
- **Test with large files** to ensure performance

## Questions?

If you have questions about contributing:

1. Check existing [issues](https://github.com/Vijay431/file-insights/issues)
2. Search [discussions](https://github.com/Vijay431/file-insights/discussions)
3. Create a new issue with the "question" label
4. Email the maintainer: <vijayanand431@gmail.com>

Thank you for contributing to File Insights! 🚀

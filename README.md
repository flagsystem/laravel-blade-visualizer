# Laravel Blade Visualizer

A Cursor extension that visualizes parent-child relationships in Laravel Blade template files.

## Features

- Visualize Blade template inheritance tree
- Navigate between parent and child templates
- Real-time parsing of `@extends`, `@include`, and `@component` directives
- Sidebar tree view for template relationships

## Development Environment Setup

### Prerequisites

- Docker and Docker Compose
- Cursor IDE

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/laravel-blade-visualizer.git
cd laravel-blade-visualizer
```

2. Open the project in Cursor and use the devcontainer:
   - Cursor will automatically detect the `.devcontainer` configuration
   - Click "Reopen in Container" when prompted
   - The development environment will be set up automatically
   - The extension debug port is available at `localhost:3001`

3. Install dependencies (if not done automatically):
```bash
npm install
```

4. Compile the extension:
```bash
npm run compile
```

5. Press F5 to start debugging the extension

## Development

### Project Structure

```
laravel-blade-visualizer/
├── .devcontainer/          # Devcontainer configuration
├── src/                    # TypeScript source files
├── out/                    # Compiled JavaScript files
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

### Available Scripts

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Building and Publishing

1. Package the extension:
```bash
npm run compile
vsce package
```

2. Install the extension locally:
```bash
code --install-extension laravel-blade-visualizer-0.0.1.vsix
```

## License

MIT
laravelのbladeファイルの親子関係を可視化する

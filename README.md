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

### Cursor IDE Rules

このプロジェクトには `.cursorrules` ファイルが含まれており、以下のルールが設定されています：

- **日本語コメントの充実化**: すべての関数、クラス、メソッドに日本語での詳細なコメントを記述
- **テストの自動作成**: 新しいコード作成時に自動でテストファイルを生成
- **テストの自動実行**: ファイル変更時に自動でテストを実行し、失敗時は即座に修正
- **テストケース命名**: `test` で始まる完結でわかりやすいテストケース名

### Project Structure

```
laravel-blade-visualizer/
├── .devcontainer/          # Devcontainer configuration
├── src/                    # TypeScript source files
├── out/                    # Compiled JavaScript files
├── scripts/                # Development scripts
├── templates/              # Code templates
├── .cursorrules           # Cursor IDE rules
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
- `npm run test:watch` - Watch for file changes and run tests automatically
- `npm run test:create` - Create test files for missing tests
- `npm run package` - Package extension with automatic yes flag
- `npm run package:version` - Package extension and update version

## Building and Publishing

### 自動パッケージ化

1. 基本的なパッケージ化（自動yesフラグ付き）:
```bash
npm run package
```

2. パッケージ化とバージョン更新:
```bash
npm run package:version
```

### 手動パッケージ化

1. 従来の方法:
```bash
npm run compile
npx vsce package
```

2. ローカルインストール:
```bash
code --install-extension laravel-blade-visualizer-0.1.0.vsix
```

### パッケージ化の自動処理

パッケージ化スクリプトは以下の処理を自動実行します：
- TypeScriptコンパイル
- コード品質チェック（ESLint）
- テスト実行
- 古いパッケージファイルの削除
- VSCEパッケージ化（--yesフラグ付き）
- バージョン更新（オプション）

## License

MIT
laravelのbladeファイルの親子関係を可視化する

## テスト開発

### テストの実行

```bash
# 通常のテスト実行
npm test

# ファイル変更を監視してテストを自動実行
npm run test:watch

# 不足しているテストファイルを自動作成
npm run test:create
```

### テストテンプレート

`templates/test-template.ts` にテストファイルのテンプレートが用意されています。
新しいテストファイルを作成する際は、このテンプレートを参考にしてください。

### テストケースの命名規則

- テストケース名は `test` で始まる
- 日本語または英語で分かりやすく記述
- 例: `test正常な入力で期待される結果が返される`

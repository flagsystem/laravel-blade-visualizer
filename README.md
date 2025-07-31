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
├── __test__/              # Test files
├── out/                    # Compiled JavaScript files
├── scripts/                # Development scripts
├── .github/workflows/      # CI/CD workflows
├── .husky/                 # Git hooks
├── templates/              # Code templates
├── .cursorrules           # Cursor IDE rules
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

### Available Scripts

#### 開発スクリプト
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run test` - Run VSCode extension tests
- `npm run test:simple` - Run simple unit tests
- `npm run test:watch` - Watch for file changes and run tests automatically
- `npm run test:create` - Create test files for missing tests

#### 品質チェックスクリプト
- `npm run quality` - Run full quality check (compile + lint + test)
- `npm run precommit` - Run pre-commit quality check
- `npm run ci` - Run CI/CD pipeline (quality + package)

#### パッケージ化スクリプト
- `npm run package` - Package extension with automatic yes flag
- `npm run package:version` - Package extension and update version

#### ドキュメント自動生成スクリプト
- `npm run docs:generate` - 既存ライブラリを活用したドキュメント生成（推奨）
- `npm run docs:update` - ドキュメント生成と品質チェックを実行
- `npm run docs:generate:enhanced` - 拡張版ドキュメント生成（エイリアス）
- `npm run docs:typedoc` - TypeDocによるAPIドキュメント生成
- `npm run docs:jsdoc` - JSDocによるAPIドキュメント生成
- `npm run docs:structure` - プロジェクト構造ドキュメントのみ生成

#### 設定管理スクリプト
- `npm run config:init` - 設定ファイルの初期化
- `npm run config:validate` - 設定ファイルの検証
- `npm run config:backup` - 設定ファイルのバックアップ
- `npm run config:restore` - 設定ファイルの復元
- `npm run config:status` - 設定ファイルの状態表示

## Quality Assurance

### 自動品質チェック

### ドキュメント自動生成

このプロジェクトには、プロジェクト構造とソースコードの説明を自動生成する機能が組み込まれています：

#### 機能
- **プロジェクト構造の自動解析**: ディレクトリとファイルの階層構造を解析
- **ソースコードの説明抽出**: JSDocコメントと単行コメントから説明を抽出
- **Markdown形式でのドキュメント生成**: 読みやすい形式でドキュメントを生成
- **ファイル変更監視**: プロジェクトファイルの変更を監視して自動更新
- **Git hooks連携**: コミット時に自動でドキュメントを更新

#### 生成されるドキュメント
- `docs/STRUCTURE.md` - プロジェクト構造の詳細説明
- `docs/TECHNICAL.md` - 技術資料（自動更新）

#### 使用方法
```bash
# 一度だけドキュメントを生成
npm run docs:generate

# ドキュメント生成と品質チェックを実行
npm run docs:update

# 個別のドキュメント生成
npm run docs:typedoc    # TypeDocのみ
npm run docs:jsdoc      # JSDocのみ
```

#### 自動更新対象
- **コミット時**: 全ドキュメントの自動生成（設定ファイルから読み込み）
- **CI/CD時**: 品質チェックとドキュメント生成
- **手動時**: 個別ドキュメントの生成
- **設定変更時**: 設定ファイルの更新でドキュメント構造を変更

#### 自動更新の仕組み
- **Git hooks**: コミット前の自動ドキュメント更新
- **CI/CD連携**: 品質チェックパイプラインでの自動実行
- **手動実行**: 必要に応じて個別ドキュメント生成

#### 既存ライブラリの活用
- **TypeDoc**: TypeScript APIドキュメント生成
- **JSDoc**: JavaScript APIドキュメント生成
- **clean-jsdoc-theme**: 美しいJSDocテーマ
- **marked**: Markdown生成ライブラリ

コミット時に自動的に品質チェックが実行されます：

1. **TypeScriptコンパイル** - 型エラーのチェック
2. **ESLint静的解析** - コードスタイルと品質のチェック
3. **ユニットテスト** - 基本機能の動作確認

### 手動品質チェック

```bash
# 完全な品質チェック
npm run quality

# コミット前チェック
npm run precommit

# CI/CDパイプライン
npm run ci
```

### Git Hooks

- **pre-commit**: コミット前に品質チェックを実行
- **commit-msg**: コミットメッセージの形式をチェック

### コミットメッセージの形式

```
type: 説明

例:
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの更新
test: テストの追加
refactor: リファクタリング
style: コードスタイルの修正
chore: その他の変更
ci: CI/CDの設定変更
build: ビルド設定の変更
perf: パフォーマンスの改善
```

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

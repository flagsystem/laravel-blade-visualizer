# Laravel Blade Visualizer

A Cursor extension that visualizes parent-child relationships in Laravel Blade template files.

<!-- Last Updated: 2025/7/31 16:52:24 -->

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

#### キャッシュ管理スクリプト
- `npm run config:init` - キャッシュファイルの初期化
- `npm run config:validate` - キャッシュファイルの検証
- `npm run config:backup` - キャッシュファイルのバックアップ
- `npm run config:restore` - キャッシュファイルの復元
- `npm run config:status` - キャッシュファイルの状態表示

#### 自動解析スクリプト
- `npm run structure:analyze` - プロジェクト構造を自動解析してキャッシュファイルを更新

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
- **コミット時**: 全ドキュメントの自動生成（キャッシュファイルから読み込み）
- **CI/CD時**: 品質チェックとドキュメント生成
- **手動時**: 個別ドキュメントの生成
- **構造変更時**: プロジェクト構造の自動解析でキャッシュファイルを更新
- **キャッシュ変更時**: キャッシュファイルの更新でドキュメント構造を変更

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

### ダウンロード

最新のリリースは [GitHub Releases](https://github.com/flagsystem/laravel-blade-visualizer/releases) からダウンロードできます。

**最新版**: [v0.1.2](https://github.com/flagsystem/laravel-blade-visualizer/releases/latest)

### 📖 ドキュメント

#### **クイックスタートガイド**
5分で始めるための[クイックスタートガイド](docs/quick-start.md)をご覧ください。

#### **ユーザーマニュアル**
詳細な使用方法については、[ユーザーマニュアル](docs/user-manual.md)をご覧ください。

- **インストール方法**: 3つの異なるインストール方法を説明
- **基本的な使い方**: 拡張機能の有効化から実際の使用まで
- **機能詳細**: テンプレート解析、ナビゲーション、リアルタイム更新
- **トラブルシューティング**: よくある問題と解決方法
- **よくある質問**: FAQ形式での詳細な説明

### GitHub Actions権限設定

リリースの自動作成には、以下の権限が必要です：

1. **リポジトリ設定** → **Settings** → **Actions** → **General**
2. **Workflow permissions** で以下を設定：
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

これにより、GitHub Actionsがリリースを作成できるようになります。

### CI/CDパイプラインの詳細

#### **自動実行ワークフロー（ci.yml）**
- **品質チェック**: TypeScriptコンパイル、ESLint、ユニットテスト
- **パッケージ作成**: VSIXファイルの生成とアーティファクト保存
- **リリース作成**: GitHub Releasesへの自動アップロード

#### **手動実行ワークフロー（release.yml）**
- **手動リリース**: 任意のバージョンでリリースを作成
- **プレリリース対応**: プレリリースとして公開可能
- **エラーハンドリング**: 重複タグの検出と適切なエラー処理

#### **権限の詳細説明**
- **contents: write**: リリース、タグ、ブランチの作成・更新
- **packages: write**: VSIXファイルのアップロード
- **issues: write**: リリースノートの自動生成
- **pull-requests: write**: 自動化されたPR作成

### インストール方法

1. **VSIXファイルをダウンロード**
   - GitHub Releasesページから`.vsix`ファイルをダウンロード

2. **VSCodeにインストール**
   ```bash
   code --install-extension laravel-blade-visualizer-0.1.1.vsix
   ```

3. **手動インストール**
   - VSCodeで`Ctrl+Shift+P`（または`Cmd+Shift+P`）
   - "Extensions: Install from VSIX..."を選択
   - ダウンロードした`.vsix`ファイルを選択

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

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

- **英語版**: [LICENSE](LICENSE)
- **日本語版**: [LICENSE.ja.md](LICENSE.ja.md)

### ライセンスの概要

MITライセンスにより、以下のことが許可されています：
- ソフトウェアの自由な使用、複製、変更
- 商用利用
- 再配布
- 修正版の作成

詳細については、上記のライセンスファイルをご確認ください。

---

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

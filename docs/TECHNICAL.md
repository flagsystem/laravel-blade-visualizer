# Laravel Blade Visualizer - 技術資料

## 概要

このドキュメントは、Laravel Blade Visualizer拡張機能の内部技術仕様と開発環境について説明します。

## プロジェクト構造

詳細なプロジェクト構造については、[STRUCTURE.md](./STRUCTURE.md)を参照してください。

## 開発環境

### 必要なツール

- **Node.js**: 18.x以上
- **npm**: 9.x以上
- **TypeScript**: 4.8.4
- **VSCode**: 1.74.0以上（拡張機能開発用）

### 主要な依存関係

#### 開発依存関係

```json
{
  "@types/mocha": "^10.0.10",           // Mochaテストフレームワークの型定義
  "@types/node": "16.x",                 // Node.jsの型定義
  "@types/vscode": "^1.74.0",           // VSCode拡張機能APIの型定義
  "@typescript-eslint/eslint-plugin": "^5.42.0",  // TypeScript用ESLintプラグイン
  "@typescript-eslint/parser": "^5.42.0",         // TypeScript用ESLintパーサー
  "@vscode/test-electron": "^2.5.2",    // VSCode拡張機能テスト用
  "eslint": "^8.26.0",                   // コード品質チェック
  "glob": "^11.0.3",                     // ファイルパターンマッチング
  "husky": "^8.0.3",                     // Git hooks管理
  "lint-staged": "^15.2.0",              // ステージングされたファイルのリント
  "mocha": "^11.7.1",                    // テストフレームワーク
  "ts-node": "^10.9.2",                  // TypeScript実行環境
  "typescript": "^4.8.4",                // TypeScriptコンパイラ
  "vsce": "^2.15.0"                      // VSCode拡張機能パッケージ化
}
```

#### 本番依存関係

このプロジェクトはVSCode拡張機能のため、本番依存関係はありません。すべての依存関係は開発時のみ使用されます。

## npmスクリプト詳細

### 開発スクリプト

#### コンパイル関連
```bash
npm run compile     # TypeScriptをJavaScriptにコンパイル
npm run watch       # ファイル変更を監視して自動コンパイル
```

#### コード品質関連
```bash
npm run lint        # ESLintでコード品質チェック
npm run lint:fix    # ESLintでコード品質チェック（自動修正付き）
```

#### テスト関連
```bash
npm run test              # VSCode拡張機能テスト（VSCode環境が必要）
npm run test:simple       # 簡単なユニットテスト（Node.js環境で実行可能）
npm run test:watch        # ファイル変更を監視して自動テスト実行
npm run test:create       # 不足しているテストファイルを自動作成
npm run test:unit         # TypeScriptテスト（ts-node使用）
```

### 品質チェックスクリプト

#### 品質保証
```bash
npm run quality      # 完全な品質チェック（compile + lint + test:simple）
npm run precommit    # コミット前品質チェック（Git hooks用）
npm run ci          # CI/CDパイプライン（quality + package）
```

### パッケージ化スクリプト

#### ビルド・パッケージ化
```bash
npm run package         # 拡張機能をパッケージ化（dist/ディレクトリに出力）
npm run package:version # パッケージ化とバージョン更新
```

#### 自動実行されるスクリプト
```bash
npm run vscode:prepublish  # パッケージ化前の自動実行（compile）
npm run pretest           # テスト前の自動実行（compile + lint）
npm run prepackage        # パッケージ化前の自動実行（compile + lint + test）
```

## 品質保証システム

### Git Hooks

#### pre-commit
- **ファイル**: `.husky/pre-commit`
- **実行内容**: TypeScriptコンパイル + ESLint + ユニットテスト
- **目的**: コミット前に品質チェックを実行し、問題のあるコードのコミットを防止

#### commit-msg
- **ファイル**: `.husky/commit-msg`
- **実行内容**: コミットメッセージの形式チェック
- **目的**: セマンティックコミットメッセージの形式を強制

### CI/CD

#### GitHub Actions
- **ファイル**: `.github/workflows/ci.yml`
- **トリガー**: push（main/develop）、pull_request（main/develop）
- **実行内容**: 
  - 品質チェック（TypeScriptコンパイル + ESLint + テスト）
  - パッケージ化（mainブランチへのプッシュ時のみ）

## テスト戦略

### テストの種類

1. **ユニットテスト** (`npm run test:simple`)
   - 基本的な機能テスト
   - VSCodeモジュールに依存しない
   - Node.js環境で実行可能

2. **統合テスト** (`npm run test`)
   - VSCode拡張機能の完全なテスト
   - VSCode環境が必要
   - 実際の拡張機能の動作をテスト

3. **品質テスト** (`npm run quality`)
   - コンパイルエラーチェック
   - コードスタイルチェック
   - 基本的な機能テスト

### テストファイル構成

```
__test__/
├── extension.test.ts           # メイン拡張機能のテスト
├── parsers/
│   └── BladeParser.test.ts     # Bladeパーサーのテスト
├── providers/
│   └── BladeTemplateProvider.test.ts  # プロバイダーのテスト
└── mocks/
    └── vscode.js              # VSCodeモジュールのモック
```

## ビルドプロセス

### 開発時ビルド
```bash
npm run compile  # TypeScript → JavaScript
```

### 本番ビルド
```bash
npm run package  # 完全なビルド + パッケージ化
```

### ビルド成果物
- **出力先**: `dist/`ディレクトリ
- **ファイル形式**: `.vsix`（VSCode拡張機能パッケージ）
- **ファイル名**: `laravel-blade-visualizer-{version}.vsix`

## 設定ファイル

### TypeScript設定 (`tsconfig.json`)
- **ターゲット**: ES2020
- **モジュール**: CommonJS
- **出力先**: `out/`ディレクトリ
- **除外**: `__test__/`ディレクトリ

### ESLint設定 (`.eslintrc.json`)
- **パーサー**: TypeScript
- **対象**: `src/`と`__test__/`ディレクトリ
- **除外**: `out/`、`dist/`、`node_modules/`

### Husky設定 (`package.json`)
- **pre-commit**: 品質チェック実行
- **commit-msg**: コミットメッセージ形式チェック

## 開発ワークフロー

### 通常の開発フロー
1. コード作成・編集
2. `npm run quality` で品質チェック
3. 問題があれば修正
4. `git commit` でコミット（自動品質チェック実行）

### リリースフロー
1. 機能開発完了
2. `npm run package` でパッケージ化
3. `dist/`ディレクトリにVSIXファイルが生成
4. GitHub Actionsで自動テスト・パッケージ化

## トラブルシューティング

### よくある問題

#### コンパイルエラー
```bash
npm run compile  # エラーの詳細を確認
npm run lint     # コードスタイルの問題を確認
```

#### テストエラー
```bash
npm run test:simple  # 簡単なテストで問題を特定
```

#### パッケージ化エラー
```bash
npm run quality      # 品質チェックで問題を特定
npm run package      # パッケージ化を再実行
```

### デバッグ方法

1. **TypeScriptエラー**: `npm run compile`
2. **リントエラー**: `npm run lint`
3. **テストエラー**: `npm run test:simple`
4. **パッケージ化エラー**: `npm run package`

## パフォーマンス最適化

### ビルド時間の短縮
- TypeScriptの`skipLibCheck: true`設定
- ESLintの対象ファイル限定
- テストの並列実行

### メモリ使用量の最適化
- 不要な依存関係の削除
- テストファイルの適切な除外
- ビルド成果物のクリーンアップ

## セキュリティ

### 依存関係の管理
- 定期的な`npm audit`実行
- 脆弱性のある依存関係の更新
- 最小限の依存関係の使用

### コード品質
- ESLintによる静的解析
- TypeScriptによる型安全性
- テストによる動作保証

## 今後の改善点

### 技術的改善
- [ ] VSCode拡張機能テストの自動化
- [ ] カバレッジレポートの追加
- [ ] パフォーマンステストの追加
- [ ] セキュリティスキャンの自動化

### 開発効率の改善
- [ ] 開発環境のDocker化
- [ ] 自動デプロイメントの実装
- [ ] ドキュメント生成の自動化
- [ ] コードレビュープロセスの改善 

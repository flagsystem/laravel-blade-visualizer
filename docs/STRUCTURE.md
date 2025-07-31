# Laravel Blade Visualizer - プロジェクト構造

## 概要

このドキュメントは、Laravel Blade Visualizer拡張機能のプロジェクト構造と各ディレクトリ・ファイルの役割について説明します。

## プロジェクト構造

```
laravel-blade-visualizer/
```

- **./**
  - `.cursorrules` - Cursor IDE設定
  - `.eslintrc.json` - ESLint設定
  - `.gitignore` - Git除外設定
  - `Dockerfile` - Docker設定ファイル
  - `README.md` - Markdownドキュメント
  - `docker-compose.yml` - Docker Compose設定
  - `jsdoc.json` - 設定ファイル
  - `package-lock.json` - npm依存関係ロックファイル
  - `package.json` - npm設定ファイル
  - `tsconfig.json` - TypeScript設定
  - **.cache/** - キャッシュファイル
    - 目的: プロジェクト構造のキャッシュとドキュメント生成設定
    - `project-structure.json` - プロジェクト構造定義
  - **.devcontainer/** - 開発コンテナ設定
    - 目的: Docker環境での開発サポート
    - `devcontainer.json` - 設定ファイル
  - **.github/**
    - **workflows/**
      - `ci.yml` - YAML設定ファイル
  - **.husky/** - Git hooks
    - 目的: コミット前の品質チェック自動化
    - `commit-msg` - コミットメッセージ形式チェック
    - `pre-commit` - コミット前品質チェック
    - **_/**
      - `.gitignore` - Git除外設定
      - `applypatch-msg` - ファイル
      - `commit-msg` - ファイル
      - `h` - ファイル
      - `husky.sh` - ファイル
      - `post-applypatch` - ファイル
      - `post-checkout` - ファイル
      - `post-commit` - ファイル
      - `post-merge` - ファイル
      - `post-rewrite` - ファイル
      - `pre-applypatch` - ファイル
      - `pre-auto-gc` - ファイル
      - `pre-commit` - ファイル
      - `pre-merge-commit` - ファイル
      - `pre-push` - ファイル
      - `pre-rebase` - ファイル
      - `prepare-commit-msg` - ファイル
  - **__test__/** - テストファイル
    - 目的: ユニットテストと統合テスト
    - `extension.test.js` - JavaScriptファイル
    - `extension.test.js.map` - ファイル
    - `extension.test.ts` - メイン拡張機能のテスト
    - **mocks/**
      - `vscode.js` - JavaScriptファイル
    - **parsers/**
      - `BladeParser.test.js` - JavaScriptファイル
      - `BladeParser.test.js.map` - ファイル
      - `BladeParser.test.ts` - TypeScriptソースファイル
    - **providers/**
      - `BladeTemplateProvider.test.js` - JavaScriptファイル
      - `BladeTemplateProvider.test.js.map` - ファイル
      - `BladeTemplateProvider.test.ts` - TypeScriptソースファイル
  - **dist/** - ビルド成果物
    - 目的: VSCode拡張機能パッケージ（.vsix）
    - `laravel-blade-visualizer-0.1.1.vsix` - ファイル
  - **docs/** - 技術資料
    - 目的: プロジェクトの技術仕様と開発ガイド
    - `STRUCTURE.md` - プロジェクト構造説明（自動生成）
    - `TECHNICAL.md` - 技術仕様書
    - `index.md` - ドキュメントインデックス（自動生成）
    - **api/**
      - `.nojekyll` - ファイル
      - `index.html` - ファイル
      - **assets/**
        - `highlight.css` - ファイル
        - `main.js` - JavaScriptファイル
        - `search.js` - JavaScriptファイル
        - `style.css` - ファイル
      - **classes/**
        - `parsers_BladeParser.BladeParser.html` - ファイル
        - `providers_BladeTemplateProvider.BladeTemplateItem.html` - ファイル
        - `providers_BladeTemplateProvider.BladeTemplateProvider.html` - ファイル
      - **functions/**
        - `extension.activate.html` - ファイル
        - `extension.deactivate.html` - ファイル
      - **interfaces/**
        - `parsers_BladeParser.BladeTemplate.html` - ファイル
      - **modules/**
        - `extension.html` - ファイル
        - `parsers_BladeParser.html` - ファイル
        - `providers_BladeTemplateProvider.html` - ファイル
  - **scripts/** - 開発用スクリプト
    - 目的: ビルド、テスト、パッケージ化の自動化
    - `config-manager.js` - 設定管理スクリプト
    - `docs-generator.js` - ドキュメント自動生成スクリプト
    - `package.js` - パッケージ化スクリプト
    - `quality-check.js` - 品質チェックスクリプト
    - `simple-test.js` - 簡単なテストスクリプト
    - `test-watch.js` - テスト監視スクリプト
  - **src/** - TypeScriptソースコード
    - 目的: VSCode拡張機能のメインロジック
    - `extension.ts` - 拡張機能のエントリーポイント
    - **parsers/**
      - `BladeParser.ts` - TypeScriptソースファイル
    - **providers/**
      - `BladeTemplateProvider.ts` - TypeScriptソースファイル
  - **templates/** - テンプレートファイル
    - 目的: プロジェクト生成用テンプレート
    - `test-template.ts` - TypeScriptソースファイル


## ディレクトリ詳細

### `src/`

**説明:** TypeScriptソースコード

**目的:** VSCode拡張機能のメインロジック

**主要ファイル:**

- `extension.ts` - 拡張機能のエントリーポイント
- `parsers/` - Bladeテンプレート解析ロジック
- `providers/` - VSCodeツリービュープロバイダー

---

### `__test__/`

**説明:** テストファイル

**目的:** ユニットテストと統合テスト

**主要ファイル:**

- `extension.test.ts` - メイン拡張機能のテスト
- `parsers/` - パーサーのテスト
- `providers/` - プロバイダーのテスト
- `mocks/` - テスト用モックファイル

---

### `scripts/`

**説明:** 開発用スクリプト

**目的:** ビルド、テスト、パッケージ化の自動化

**主要ファイル:**

- `package.js` - パッケージ化スクリプト
- `quality-check.js` - 品質チェックスクリプト
- `simple-test.js` - 簡単なテストスクリプト
- `test-watch.js` - テスト監視スクリプト
- `docs-generator.js` - ドキュメント自動生成スクリプト
- `config-manager.js` - 設定管理スクリプト

---

### `docs/`

**説明:** 技術資料

**目的:** プロジェクトの技術仕様と開発ガイド

**主要ファイル:**

- `TECHNICAL.md` - 技術仕様書
- `STRUCTURE.md` - プロジェクト構造説明（自動生成）
- `index.md` - ドキュメントインデックス（自動生成）

---

### `dist/`

**説明:** ビルド成果物

**目的:** VSCode拡張機能パッケージ（.vsix）

---

### `.husky/`

**説明:** Git hooks

**目的:** コミット前の品質チェック自動化

**主要ファイル:**

- `pre-commit` - コミット前品質チェック
- `commit-msg` - コミットメッセージ形式チェック

---

### `.github/workflows/`

**説明:** CI/CD設定

**目的:** GitHub Actionsによる自動テスト・デプロイ

**主要ファイル:**

- `ci.yml` - CI/CDパイプライン設定

---

### `templates/`

**説明:** テンプレートファイル

**目的:** プロジェクト生成用テンプレート

---

### `.devcontainer/`

**説明:** 開発コンテナ設定

**目的:** Docker環境での開発サポート

---

### `.cache/`

**説明:** キャッシュファイル

**目的:** プロジェクト構造のキャッシュとドキュメント生成設定

**主要ファイル:**

- `project-structure.json` - プロジェクト構造定義

---

## ソースファイル詳細

### `src/extension.ts`

**説明:**
```
* Laravel Blade Visualizer拡張機能のアクティベーション関数
 * 拡張機能が有効になった時に実行され、Bladeテンプレートの解析とビジュアライゼーション機能を初期化する
 * 
 * @param {vscode.ExtensionContext} context - VSCode拡張機能のコンテキスト

* Laravel Blade Visualizer拡張機能の非アクティベーション関数
 * 拡張機能が無効になった時に実行される
```

**役割:** TypeScriptソースファイル

---

### `src/providers/BladeTemplateProvider.ts`

**説明:**
```
* VSCodeのツリービューにBladeテンプレートの親子関係を表示するプロバイダークラス
 * TreeDataProviderインターフェースを実装し、Bladeテンプレートの階層構造を視覚的に表現する

ツリーデータの変更を通知するイベントエミッター

ツリーデータの変更イベント

* BladeTemplateProviderのコンストラクタ
     * 
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス

* ツリーデータを更新し、UIに変更を通知する

* ツリーアイテムの表示設定を取得する
     * 
     * @param {BladeTemplateItem} element - 表示対象のツリーアイテム
     * @returns {vscode.TreeItem} 設定されたツリーアイテム

* 指定された要素の子要素を取得する
     * ルートレベルの場合はすべてのBladeファイルを表示し、
     * 子レベルの場合は親子関係（extends、include、component）を表示する
     * 
     * @param {BladeTemplateItem} element - 親要素（ルートレベルの場合はundefined）
     * @returns {Promise<BladeTemplateItem[]>} 子要素の配列

* VSCodeのツリービューに表示されるBladeテンプレートアイテムクラス
 * テンプレートファイルとその関係性を視覚的に表現する

* BladeTemplateItemのコンストラクタ
     * 
     * @param {BladeTemplate} template - 表示対象のBladeテンプレート
     * @param {vscode.TreeItemCollapsibleState} collapsibleState - ツリーアイテムの展開状態
     * @param {string} type - アイテムの種類（'template'、'extends'、'include'、'component'）
```

**役割:** TypeScriptソースファイル

---

### `src/parsers/BladeParser.ts`

**説明:**
```
* Bladeテンプレートの構造を表すインターフェース
 * テンプレートファイルの親子関係とコンポーネント情報を格納する

テンプレートファイルの絶対パス

テンプレートファイル名

継承元のテンプレート名（@extendsディレクティブ）

インクルードされるテンプレート名の配列（@includeディレクティブ）

使用されるコンポーネント名の配列（@componentディレクティブ）

定義されるセクション名の配列（@sectionディレクティブ）

* Laravel Bladeテンプレートファイルを解析するクラス
 * Bladeディレクティブ（@extends、@include、@component、@section）を解析し、
 * テンプレート間の親子関係を抽出する

@extendsディレクティブを検出する正規表現

@includeディレクティブを検出する正規表現

@componentディレクティブを検出する正規表現

@sectionディレクティブを検出する正規表現

* Bladeテンプレートファイルを解析し、テンプレート構造を抽出する
     * 
     * @param {string} filePath - 解析対象のBladeファイルのパス
     * @returns {Promise<BladeTemplate | null>} 解析結果のテンプレート構造、エラー時はnull
     * @throws {Error} ファイル読み込みエラー

* ワークスペース内のすべてのBladeファイル（.blade.php）を検索する
     * 
     * @returns {Promise<string[]>} 検索されたBladeファイルの絶対パスの配列

* テンプレート名から実際のファイルパスを解決する
     * Laravelのテンプレート命名規則に従って、相対パスや絶対パスを適切に解決する
     * 
     * @param {string} templateName - 解決対象のテンプレート名
     * @param {string} currentFilePath - 現在のファイルパス（基準となるパス）
     * @returns {string} 解決されたファイルパス、見つからない場合は空文字列
```

**役割:** TypeScriptソースファイル

---

## 自動生成情報

- **生成日時:** 2025/7/31 5:59:10
- **生成スクリプト:** `scripts/docs-generator.js`
- **更新方法:** `npm run docs:generate`

> ⚠️ このドキュメントは自動生成されています。手動で編集しないでください。

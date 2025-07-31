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
  - **.devcontainer/**
    - `devcontainer.json` - 設定ファイル
  - **.github/**
    - **workflows/**
      - `ci.yml` - YAML設定ファイル
  - **.husky/**
    - `commit-msg` - ファイル
    - `pre-commit` - ファイル
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
  - **__test__/**
    - `extension.test.js` - JavaScriptファイル
    - `extension.test.js.map` - ファイル
    - `extension.test.ts` - TypeScriptソースファイル
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
  - **config/**
    - `project-structure.json` - 設定ファイル
  - **dist/**
    - `laravel-blade-visualizer-0.1.1.vsix` - ファイル
  - **docs/**
    - `STRUCTURE.md` - Markdownドキュメント
    - `TECHNICAL.md` - Markdownドキュメント
    - `index.md` - Markdownドキュメント
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
  - **scripts/**
    - `config-manager.js` - JavaScriptファイル
    - `docs-generator.js` - JavaScriptファイル
    - `package.js` - JavaScriptファイル
    - `quality-check.js` - JavaScriptファイル
    - `simple-test.js` - JavaScriptファイル
    - `test-watch.js` - JavaScriptファイル
  - **src/** - TypeScriptソースコード
    - 目的: VSCode拡張機能のメインロジック
    - `extension.ts` - 拡張機能のエントリーポイント
    - **parsers/**
      - `BladeParser.ts` - TypeScriptソースファイル
    - **providers/**
      - `BladeTemplateProvider.ts` - TypeScriptソースファイル
  - **templates/**
    - `test-template.ts` - TypeScriptソースファイル


## ディレクトリ詳細

### `src/`

**説明:** TypeScriptソースコード

**目的:** VSCode拡張機能のメインロジック

**主要ファイル:**

- `extension.ts` - 拡張機能のエントリーポイント

---

### `invalid/`

**説明:** 不正な設定

**目的:** テスト用

**主要ファイル:**

- `test.js` - テストファイル

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

- **生成日時:** 2025/7/31 5:51:01
- **生成スクリプト:** `scripts/docs-generator.js`
- **更新方法:** `npm run docs:generate`

> ⚠️ このドキュメントは自動生成されています。手動で編集しないでください。

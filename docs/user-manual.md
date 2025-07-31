# Laravel Blade Visualizer ユーザーマニュアル

## 📋 目次

1. [概要](#概要)
2. [インストール方法](#インストール方法)
3. [基本的な使い方](#基本的な使い方)
4. [機能詳細](#機能詳細)
5. [トラブルシューティング](#トラブルシューティング)
6. [よくある質問](#よくある質問)

---

## 概要

Laravel Blade Visualizerは、Laravel Bladeテンプレートファイルの親子関係を可視化するVSCode拡張機能です。

### 🎯 主な機能

- **テンプレート階層の可視化**: `@extends`、`@include`、`@component`の関係を視覚的に表示
- **リアルタイム解析**: Bladeファイルの変更をリアルタイムで解析
- **サイドバー表示**: エクスプローラーにBlade Template Treeビューを追加
- **ナビゲーション支援**: 親子テンプレート間の移動を簡単に

### 🎨 対応ディレクティブ

- `@extends('layout.app')` - レイアウト継承
- `@include('partials.header')` - パーシャルインクルード
- `@component('components.alert')` - コンポーネント
- `@section('content')` - セクション定義

---

## インストール方法

### 方法1: VSCode Marketplaceからインストール（推奨）

1. VSCodeを開く
2. 拡張機能タブ（Ctrl+Shift+X）を開く
3. 検索ボックスに「Laravel Blade Visualizer」と入力
4. 拡張機能を見つけて「インストール」をクリック

### 方法2: VSIXファイルからインストール

1. [GitHub Releases](https://github.com/flagsystem/laravel-blade-visualizer/releases)から最新のVSIXファイルをダウンロード
2. VSCodeで`Ctrl+Shift+P`（または`Cmd+Shift+P`）を押す
3. 「Extensions: Install from VSIX...」を選択
4. ダウンロードしたVSIXファイルを選択

### 方法3: コマンドラインからインストール

```bash
# VSIXファイルをダウンロード後
code --install-extension laravel-blade-visualizer-0.1.2.vsix
```

---

## 基本的な使い方

### 1. 拡張機能の有効化

インストール後、VSCodeを再起動するか、以下の手順で有効化します：

1. `Ctrl+Shift+P`（または`Cmd+Shift+P`）を押す
2. 「Developer: Reload Window」を選択

### 2. Blade Template Treeの表示

#### サイドバーから表示
1. エクスプローラー（左サイドバー）を開く
2. 「Blade Template Tree」セクションを探す
3. プロジェクトのルートディレクトリを選択

#### コマンドパレットから表示
1. `Ctrl+Shift+P`（または`Cmd+Shift+P`）を押す
2. 「Show Blade Template Tree」と入力
3. コマンドを選択して実行

### 3. テンプレート関係の確認

Blade Template Treeでは以下の情報が表示されます：

- **継承関係**: `@extends`で指定された親テンプレート
- **インクルード**: `@include`で読み込まれるパーシャル
- **コンポーネント**: `@component`で使用されるコンポーネント
- **セクション**: `@section`で定義されたセクション

---

## 機能詳細

### 🔍 テンプレート解析機能

#### 自動解析
- Bladeファイル（`.blade.php`）を開くと自動的に解析開始
- ファイル保存時にリアルタイムで更新
- 構文エラーがある場合は警告を表示

#### 手動解析
- コマンドパレットから「Reload Blade Template Tree」を実行
- プロジェクト全体の再解析が可能

### 📁 ファイル構造の表示

```
📁 resources/views/
├── 📄 layout.blade.php (親テンプレート)
├── 📄 welcome.blade.php
│   ├── @extends('layout')
│   ├── @include('partials.header')
│   └── @component('components.alert')
└── 📁 partials/
    └── 📄 header.blade.php
```

### 🎯 ナビゲーション機能

#### 親テンプレートへの移動
1. Blade Template Treeで親テンプレートをクリック
2. 該当ファイルが自動的に開く

#### インクルードファイルへの移動
1. インクルードされたファイル名をクリック
2. パーシャルファイルが開く

#### コンポーネントファイルへの移動
1. コンポーネント名をクリック
2. コンポーネントファイルが開く

### 🔄 リアルタイム更新

- ファイルを保存すると自動的にツリーが更新
- 新しいBladeファイルを追加すると自動的に認識
- ファイルを削除すると自動的にツリーから除外

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. Blade Template Treeが表示されない

**原因**: 拡張機能が正しく有効化されていない

**解決方法**:
1. VSCodeを再起動
2. コマンドパレットで「Developer: Reload Window」を実行
3. 拡張機能が有効になっているか確認

#### 2. テンプレート関係が正しく解析されない

**原因**: Bladeファイルの構文エラー

**解決方法**:
1. Bladeファイルの構文を確認
2. `@extends`、`@include`、`@component`の記述を確認
3. ファイルパスが正しいか確認

#### 3. ファイルが見つからないエラー

**原因**: ファイルパスが間違っている

**解決方法**:
1. `resources/views/`ディレクトリ内にファイルがあるか確認
2. ファイル名の大文字小文字を確認
3. ファイル拡張子（`.blade.php`）を確認

#### 4. パフォーマンスの問題

**原因**: 大きなプロジェクトでの解析負荷

**解決方法**:
1. 不要なBladeファイルを削除
2. キャッシュをクリア（コマンドパレットで「Clear Blade Cache」）
3. プロジェクトを再読み込み

### 🔧 デバッグ情報の確認

#### ログの確認
1. VSCodeで「Help」→「Toggle Developer Tools」を開く
2. Consoleタブでエラーメッセージを確認

#### 拡張機能の状態確認
1. コマンドパレットで「Extensions: Show Running Extensions」を実行
2. Laravel Blade Visualizerの状態を確認

---

## よくある質問

### Q1: どのようなBladeディレクティブに対応していますか？

**A**: 以下のディレクティブに対応しています：
- `@extends('layout.app')` - レイアウト継承
- `@include('partials.header')` - パーシャルインクルード
- `@component('components.alert')` - コンポーネント
- `@section('content')` - セクション定義

### Q2: 大きなプロジェクトでも動作しますか？

**A**: はい、動作します。ただし、パフォーマンスを考慮して以下の対策を推奨します：
- 不要なBladeファイルの削除
- 定期的なキャッシュクリア
- プロジェクトの分割（可能な場合）

### Q3: 他のVSCode拡張機能との競合はありますか？

**A**: 一般的なLaravel/PHP拡張機能との競合はありません。ただし、同じBladeファイルを編集する他の拡張機能がある場合は、設定を確認してください。

### Q4: カスタムBladeディレクティブは対応していますか？

**A**: 現在は標準的なBladeディレクティブのみ対応しています。カスタムディレクティブの対応は今後のバージョンで検討予定です。

### Q5: エラーが発生した場合はどうすればよいですか？

**A**: 以下の手順で対処してください：
1. VSCodeを再起動
2. 拡張機能を無効化して再有効化
3. プロジェクトを再読み込み
4. GitHubのIssuesで問題を報告

---

## 📞 サポート

### 問題の報告

バグや機能要望がある場合は、以下の方法で報告してください：

1. **GitHub Issues**: [Issuesページ](https://github.com/flagsystem/laravel-blade-visualizer/issues)で報告
2. **機能要望**: 新しいIssueを作成して「Feature Request」ラベルを付ける
3. **バグ報告**: エラーメッセージと再現手順を添えて報告

### 貢献

プロジェクトへの貢献を歓迎します：

1. **コード貢献**: Pull Requestを作成
2. **ドキュメント改善**: マニュアルの改善提案
3. **テスト**: 新しい機能のテスト

### ライセンス

この拡張機能はMITライセンスの下で公開されています。

---

## 📝 更新履歴

### v0.1.2 (2025-07-31)
- GitHub Releasesの自動化
- 権限設定の改善
- エラーハンドリングの強化

### v0.1.1 (2025-07-31)
- 基本的なBladeテンプレート解析機能
- サイドバーでのツリー表示
- リアルタイム更新機能

---

**Laravel Blade Visualizer** - Laravel Bladeテンプレートの可視化を簡単に 

# Laravel Blade Visualizer クイックスタートガイド

## 🚀 5分で始めるLaravel Blade Visualizer

このガイドでは、Laravel Blade Visualizerを素早くセットアップして使用する方法を説明します。

---

## ステップ1: インストール

### VSCode Marketplaceからインストール（推奨）

1. VSCodeを開く
2. `Ctrl+Shift+X`（または`Cmd+Shift+X`）で拡張機能タブを開く
3. 検索ボックスに「Laravel Blade Visualizer」と入力
4. 「インストール」をクリック

### または、VSIXファイルからインストール

1. [GitHub Releases](https://github.com/flagsystem/laravel-blade-visualizer/releases)から最新のVSIXファイルをダウンロード
2. VSCodeで`Ctrl+Shift+P`を押す
3. 「Extensions: Install from VSIX...」を選択
4. ダウンロードしたファイルを選択

---

## ステップ2: Laravelプロジェクトを開く

1. VSCodeでLaravelプロジェクトのルートディレクトリを開く
2. `resources/views/`ディレクトリが存在することを確認

---

## ステップ3: Blade Template Treeを表示

### 方法1: サイドバーから

1. 左サイドバーのエクスプローラーを開く
2. 「Blade Template Tree」セクションを探す
3. プロジェクトのルートディレクトリを選択

### 方法2: コマンドパレットから

1. `Ctrl+Shift+P`（または`Cmd+Shift+P`）を押す
2. 「Show Blade Template Tree」と入力
3. コマンドを選択して実行

---

## ステップ4: 基本的な使用

### テンプレート関係の確認

Blade Template Treeでは以下の情報が表示されます：

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

### ファイル間の移動

- **親テンプレート**: 継承元のファイルをクリック
- **インクルード**: パーシャルファイルをクリック
- **コンポーネント**: コンポーネントファイルをクリック

---

## ステップ5: 実際の使用例

### 例1: レイアウト継承の確認

```blade
{{-- resources/views/welcome.blade.php --}}
@extends('layout.app')

@section('content')
    <h1>Welcome</h1>
@endsection
```

Blade Template Treeで`layout.app`をクリックすると、親テンプレートが開きます。

### 例2: パーシャルの確認

```blade
{{-- resources/views/welcome.blade.php --}}
@include('partials.header')
@include('partials.footer')
```

Blade Template Treeで`partials.header`や`partials.footer`をクリックすると、該当ファイルが開きます。

### 例3: コンポーネントの確認

```blade
{{-- resources/views/welcome.blade.php --}}
@component('components.alert')
    <p>Alert message</p>
@endcomponent
```

Blade Template Treeで`components.alert`をクリックすると、コンポーネントファイルが開きます。

---

## 🎯 よく使う機能

### リアルタイム更新

- ファイルを保存すると自動的にツリーが更新
- 新しいBladeファイルを追加すると自動的に認識

### 手動更新

- コマンドパレットで「Reload Blade Template Tree」を実行
- プロジェクト全体の再解析が可能

### エラー確認

- 構文エラーがある場合は警告が表示
- ファイルが見つからない場合はエラーが表示

---

## 🔧 トラブルシューティング

### Blade Template Treeが表示されない

1. VSCodeを再起動
2. コマンドパレットで「Developer: Reload Window」を実行
3. 拡張機能が有効になっているか確認

### テンプレート関係が正しく解析されない

1. Bladeファイルの構文を確認
2. `@extends`、`@include`、`@component`の記述を確認
3. ファイルパスが正しいか確認

### パフォーマンスの問題

1. 不要なBladeファイルを削除
2. キャッシュをクリア（コマンドパレットで「Clear Blade Cache」）
3. プロジェクトを再読み込み

---

## 📚 次のステップ

基本的な使い方をマスターしたら、以下の詳細なドキュメントを参照してください：

- **[ユーザーマニュアル](user-manual.md)**: 詳細な機能説明とトラブルシューティング
- **[GitHub Issues](https://github.com/flagsystem/laravel-blade-visualizer/issues)**: 問題の報告と機能要望
- **[GitHub Releases](https://github.com/flagsystem/laravel-blade-visualizer/releases)**: 最新バージョンのダウンロード

---

## 🎉 おめでとうございます！

これで、Laravel Blade Visualizerの基本的な使い方をマスターしました。

**Laravel Blade Visualizer**で、Bladeテンプレートの管理をより効率的に行いましょう！ 

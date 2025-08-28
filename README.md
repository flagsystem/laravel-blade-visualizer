# Laravel Blade Visualizer

Laravel Bladeテンプレートファイルの親子関係を視覚的に表示し、選択したファイルの完全なツリー構造を表示するVSCode拡張機能です。

## 🚀 新機能

### ✨ 選択中のファイルの完全なツリー表示
- 現在選択しているBladeファイルを起点とした祖先から末端までの完全なツリー構築
- `@extends`、`@include`、`@component`ディレクティブの関係を再帰的に解析
- 選択中のファイルを🎯アイコンでハイライト表示
- 選択したファイル以外は表示されず、関係のあるファイルのみをクリックで読み込み

### 🎨 サイドバーアイコン
- アクティビティバーに専用アイコン（📊）を表示
- 別窓でのビジュアル表示機能
- 右クリックメニューからのクイックアクセス

### 🔄 ワークフローチックな表示
- 親子関係を矢印や線で表現
- 階層レベルごとの視覚的な分離
- インタラクティブなノード操作（クリックでファイルを開く）
- カラーコーディングによる関係性の識別

## 📋 機能一覧

### 基本機能
- **選択ファイルのツリー**: 選択中のBladeファイルの関係のみを表示
- **選択ファイルの完全ツリー**: 選択中のファイルの祖先から末端までの完全なツリー構造を表示
- **関係性ビュー**: ワークフローチックな視覚的表示

### 解析機能
- `@extends` ディレクティブの継承関係解析
- `@include` ディレクティブのインクルード関係解析
- `@component` ディレクティブのコンポーネント関係解析
- `@section` ディレクティブのセクション定義解析

### 表示機能
- 階層レベルごとのグループ化表示
- ファイルパスの短縮表示
- ツールチップによる詳細情報表示
- ファイルをクリックして直接開く機能

## 🎯 使用方法

### 1. 基本的な使用方法
1. VSCodeでBladeファイル（`.blade.php`）を開く
2. サイドバーの「Laravel Blade Visualizer」アイコンをクリック
3. 「選択ファイルの完全ツリー」で選択中のファイルのツリーを確認
4. 「関係性ビュー」でワークフローチックな表示を確認

### 2. 右クリックメニューからの使用
1. Bladeファイルを右クリック
2. 「Show Selected File Tree」を選択
3. 選択中のファイルの完全なツリーを表示

### 3. コマンドパレットからの使用
1. `Ctrl+Shift+P`（または`Cmd+Shift+P`）でコマンドパレットを開く
2. 以下のコマンドを実行：
   - `選択ファイルのツリーを表示`: 選択中のファイルのツリー表示
   - `選択ファイルの完全ツリーを表示`: 選択中のファイルの完全ツリー表示
   - `Blade Visualizerを開く`: ビジュアライザーを開く
   - `ツリーを更新`: ツリーの表示を更新

## 🔧 インストール

### VSCode拡張機能マーケットプレイスから
1. VSCodeを開く
2. 拡張機能タブ（`Ctrl+Shift+X`）を開く
3. 「Laravel Blade Visualizer」を検索
4. インストールボタンをクリック

### 手動インストール
1. リポジトリをクローン
2. `npm install`で依存関係をインストール
3. `npm run compile`でTypeScriptをコンパイル
4. `npm run package`でVSIXファイルを生成
5. 生成されたVSIXファイルをVSCodeにインストール

## 🏗️ 開発環境のセットアップ

### 必要な環境
- Node.js 16.x以上
- npm 8.x以上
- VSCode 1.74.0以上

### セットアップ手順
```bash
# リポジトリをクローン
git clone https://github.com/flagsystem/laravel-blade-visualizer.git
cd laravel-blade-visualizer

# 依存関係をインストール
npm install

# TypeScriptをコンパイル
npm run compile

# 開発用のVSCodeインスタンスを起動
npm run watch
```

### テストの実行
```bash
# 単体テストを実行
npm run test:unit

# 統合テストを実行
npm run test:simple

# 全テストを実行
npm run test:full

# テストの監視モード
npm run test:watch
```

### コード品質チェック
```bash
# リンターを実行
npm run lint

# リンターの自動修正
npm run lint:fix

# 品質チェック（コンパイル + リンター + テスト）
npm run quality
```

## 📦 パッケージ化

### VSIXファイルの生成
```bash
# 基本的なパッケージ化
npm run package

# バージョン更新付きパッケージ化
npm run package:version
```

### パッケージ化前の自動処理
- TypeScriptのコンパイル
- コード品質チェック
- テストの実行

## 🎨 カスタマイズ

### テーマ対応
- VSCodeのテーマに合わせて自動的に色が調整される
- ダークテーマ・ライトテーマの両方に対応

### 設定オプション
現在のバージョンでは設定オプションは提供していませんが、今後のバージョンで以下の設定を追加予定：
- ツリーの展開状態の記憶
- 表示する関係性の種類の選択
- カスタムアイコンの設定

## 🔍 トラブルシューティング

### よくある問題

#### 1. ツリーが表示されない
- Bladeファイル（`.blade.php`）が正しく認識されているか確認
- ファイルの構文が正しいか確認
- VSCodeを再起動してみる

#### 2. 関係性が正しく解析されない
- Laravelの標準的なディレクトリ構造（`resources/views/`）を使用しているか確認
- テンプレート名の記述が正しいか確認
- ファイルパスが正しく解決されているか確認

#### 3. パフォーマンスが悪い
- 大きなファイルや複雑な関係性がある場合、解析に時間がかかる場合があります
- 必要に応じてファイルサイズを最適化

### ログの確認
- VSCodeの開発者ツール（`Help > Toggle Developer Tools`）でコンソールログを確認
- エラーメッセージや警告メッセージを確認

## 🤝 コントリビューション

### 開発への参加
1. このリポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

### 開発ガイドライン
- TypeScriptを使用
- 日本語コメントを充実させる
- テストを必ず作成する
- ESLintルールに従う
- コミットメッセージは日本語で記述

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- Laravelコミュニティ
- VSCode拡張機能開発者コミュニティ
- この拡張機能の開発に協力してくださったすべての方々

## 📞 サポート

### 問題の報告
- [GitHub Issues](https://github.com/flagsystem/laravel-blade-visualizer/issues)で問題を報告
- バグ報告時は再現手順と環境情報を含めてください

### 機能要望
- [GitHub Discussions](https://github.com/flagsystem/laravel-blade-visualizer/discussions)で機能要望を投稿
- 具体的なユースケースと期待する動作を説明してください

### 質問・相談
- [GitHub Discussions](https://github.com/flagsystem/laravel-blade-visualizer/discussions)で質問・相談を投稿
- コミュニティからの回答をお待ちください

---

**Laravel Blade Visualizer** - Laravel Bladeテンプレートの関係性を視覚的に理解しよう！

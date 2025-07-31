# Laravel Blade Visualizer - ドキュメント

## 📚 ドキュメント一覧

### 📖 プロジェクト構造
- [プロジェクト構造詳細](./STRUCTURE.md) - ディレクトリとファイルの説明
- [技術仕様書](./TECHNICAL.md) - 開発環境と技術仕様

### 🔧 APIドキュメント
- [TypeScript API](./api/) - TypeDocで生成されたAPIドキュメント
- [JavaScript API](./js-api/) - JSDocで生成されたAPIドキュメント（生成予定）

### 📋 開発ガイド
- [README](../README.md) - プロジェクト概要とセットアップ
- [開発ルール](../.cursorrules) - Cursor IDE設定

### 👥 ユーザー向けドキュメント
- [クイックスタートガイド](./quick-start.md) - 5分で始めるLaravel Blade Visualizer
- [ユーザーマニュアル](./user-manual.md) - 詳細な使用方法とトラブルシューティング

## 🔄 自動生成情報

- **生成日時:** 2025/7/31 6:07:28
- **生成スクリプト:** `scripts/docs-generator-enhanced.js`
- **使用ライブラリ:** TypeDoc, JSDoc, chokidar

## 📝 ドキュメント更新方法

```bash
# 全ドキュメントを生成
npm run docs:generate:enhanced

# 監視モードで自動更新
npm run docs:watch:enhanced

# 特定のドキュメントのみ生成
npm run docs:typedoc    # TypeDocのみ
npm run docs:jsdoc      # JSDocのみ
npm run docs:structure  # 構造ドキュメントのみ
```

> ⚠️ このドキュメントは自動生成されています。手動で編集しないでください。

#!/usr/bin/env node

/**
 * 既存ライブラリを活用した拡張版ドキュメント生成スクリプト
 * 
 * このスクリプトは以下の既存ライブラリを組み合わせて使用します：
 * - TypeDoc: TypeScript APIドキュメント生成
 * - JSDoc: JavaScript APIドキュメント生成
 * - chokidar: ファイル変更監視
 * - glob: ファイルパターンマッチング
 * - fs-extra: ファイルシステム操作
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

/**
 * 既存ライブラリの設定
 */
const LIBRARY_CONFIG = {
    // TypeDoc設定
    typedoc: {
        enabled: true,
        command: 'npx typedoc',
        options: [
            '--out docs/api',
            '--theme default',
            '--excludePrivate',
            '--excludeProtected',
            '--excludeExternals',
            '--includeVersion',
            '--readme README.md',
            '--entryPointStrategy expand'
        ],
        sourceDir: 'src/'
    },

    // JSDoc設定
    jsdoc: {
        enabled: true,
        command: 'npx jsdoc',
        options: [
            '--destination docs/js-api',
            '--template node_modules/clean-jsdoc-theme',
            '--configure jsdoc.json'
        ],
        sourceDir: 'src/'
    },

    // カスタムドキュメント設定
    custom: {
        enabled: true,
        outputDir: 'docs/structure',
        templateDir: 'templates/docs'
    }
};

/**
 * TypeDocを使用したAPIドキュメント生成
 */
async function generateTypeDocDocs() {
    if (!LIBRARY_CONFIG.typedoc.enabled) {
        console.log('⏭️  TypeDocは無効化されています');
        return;
    }

    try {
        console.log('📚 TypeDocでAPIドキュメントを生成中...');

        const command = `${LIBRARY_CONFIG.typedoc.command} ${LIBRARY_CONFIG.typedoc.options.join(' ')} ${LIBRARY_CONFIG.typedoc.sourceDir}`;

        execSync(command, { stdio: 'inherit' });
        console.log('✅ TypeDocドキュメントを生成しました: docs/api/');

    } catch (error) {
        console.error('❌ TypeDocドキュメント生成中にエラーが発生しました:', error.message);
    }
}

/**
 * JSDocを使用したJavaScript APIドキュメント生成
 */
async function generateJSDocDocs() {
    if (!LIBRARY_CONFIG.jsdoc.enabled) {
        console.log('⏭️  JSDocは無効化されています');
        return;
    }

    try {
        console.log('📚 JSDocでAPIドキュメントを生成中...');

        const command = `${LIBRARY_CONFIG.jsdoc.command} ${LIBRARY_CONFIG.jsdoc.options.join(' ')} ${LIBRARY_CONFIG.jsdoc.sourceDir}`;

        execSync(command, { stdio: 'inherit' });
        console.log('✅ JSDocドキュメントを生成しました: docs/js-api/');

    } catch (error) {
        console.error('❌ JSDocドキュメント生成中にエラーが発生しました:', error.message);
    }
}

/**
 * 既存ライブラリの設定ファイルを生成
 */
async function generateLibraryConfigs() {
    try {
        // JSDoc設定ファイル
        const jsdocConfig = {
            "tags": {
                "allowUnknownTags": true
            },
            "templates": {
                "cleverLinks": false,
                "monospaceLinks": false
            },
            "opts": {
                "destination": "./docs/js-api",
                "recurse": true,
                "template": "node_modules/clean-jsdoc-theme"
            },
            "plugins": [
                "plugins/markdown"
            ],
            "source": {
                "include": ["src"],
                "includePattern": "\\.js$",
                "excludePattern": "(node_modules/|docs)"
            }
        };

        await fs.writeJson('jsdoc.json', jsdocConfig, { spaces: 2 });
        console.log('✅ JSDoc設定ファイルを生成しました');

    } catch (error) {
        console.error('❌ 設定ファイル生成中にエラーが発生しました:', error.message);
    }
}

/**
 * ドキュメントインデックスページを生成
 */
async function generateIndexPage() {
    const indexContent = `# Laravel Blade Visualizer - ドキュメント

## 📚 ドキュメント一覧

### 📖 プロジェクト構造
- [プロジェクト構造詳細](./structure/STRUCTURE.md) - ディレクトリとファイルの説明
- [技術仕様書](./TECHNICAL.md) - 開発環境と技術仕様

### 🔧 APIドキュメント
- [TypeScript API](./api/) - TypeDocで生成されたAPIドキュメント
- [JavaScript API](./js-api/) - JSDocで生成されたAPIドキュメント

### 📋 開発ガイド
- [README](../README.md) - プロジェクト概要とセットアップ
- [開発ルール](../.cursorrules) - Cursor IDE設定

## 🔄 自動生成情報

- **生成日時:** ${new Date().toLocaleString('ja-JP')}
- **生成スクリプト:** \`scripts/docs-generator-enhanced.js\`
- **使用ライブラリ:** TypeDoc, JSDoc, chokidar

## 📝 ドキュメント更新方法

\`\`\`bash
# 全ドキュメントを生成
npm run docs:generate:enhanced

# 監視モードで自動更新
npm run docs:watch:enhanced

# 特定のドキュメントのみ生成
npm run docs:typedoc    # TypeDocのみ
npm run docs:jsdoc      # JSDocのみ
npm run docs:structure  # 構造ドキュメントのみ
\`\`\`

> ⚠️ このドキュメントは自動生成されています。手動で編集しないでください。
`;

    try {
        await fs.ensureDir('docs');
        await fs.writeFile('docs/index.md', indexContent, 'utf8');
        console.log('✅ ドキュメントインデックスページを生成しました');
    } catch (error) {
        console.error('❌ インデックスページ生成中にエラーが発生しました:', error.message);
    }
}

/**
 * 既存ライブラリの依存関係をチェック
 */
async function checkLibraryDependencies() {
    const dependencies = [
        { name: 'typedoc', package: 'typedoc' },
        { name: 'jsdoc', package: 'jsdoc' },
        { name: 'clean-jsdoc-theme', package: 'clean-jsdoc-theme' }
    ];

    const missing = [];

    for (const dep of dependencies) {
        try {
            require.resolve(dep.package);
        } catch (error) {
            missing.push(dep.package);
        }
    }

    if (missing.length > 0) {
        console.log('📦 不足している依存関係をインストール中...');
        console.log(`   ${missing.join(', ')}`);

        try {
            execSync(`npm install --save-dev ${missing.join(' ')}`, { stdio: 'inherit' });
            console.log('✅ 依存関係のインストールが完了しました');
        } catch (error) {
            console.error('❌ 依存関係のインストールに失敗しました:', error.message);
            return false;
        }
    }

    return true;
}

/**
 * メインの拡張ドキュメント生成処理
 */
async function generateEnhancedDocumentation() {
    console.log('🚀 拡張版ドキュメント生成を開始します...');

    try {
        // 依存関係チェック
        const depsOk = await checkLibraryDependencies();
        if (!depsOk) {
            console.error('❌ 依存関係の準備ができませんでした');
            process.exit(1);
        }

        // 設定ファイル生成
        await generateLibraryConfigs();

        // 既存ライブラリでドキュメント生成
        await generateTypeDocDocs();
        await generateJSDocDocs();

        // カスタムドキュメント生成（既存スクリプトを使用）
        const { generateDocumentation } = require('./docs-generator');
        await generateDocumentation();

        // インデックスページ生成
        await generateIndexPage();

        console.log('🎉 拡張版ドキュメント生成が完了しました！');
        console.log('📁 生成されたドキュメント:');
        console.log('   - docs/api/ (TypeDoc)');
        console.log('   - docs/js-api/ (JSDoc)');
        console.log('   - docs/structure/ (カスタム)');
        console.log('   - docs/index.md (インデックス)');

    } catch (error) {
        console.error('❌ 拡張版ドキュメント生成中にエラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    generateEnhancedDocumentation();
}

module.exports = {
    generateEnhancedDocumentation,
    generateTypeDocDocs,
    generateJSDocDocs,
    generateIndexPage,
    checkLibraryDependencies
}; 

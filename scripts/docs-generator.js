#!/usr/bin/env node

/**
 * 既存ライブラリを活用したドキュメント生成スクリプト
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
 * プロジェクト構造の定義
 * 各ディレクトリの役割と説明を定義
 */
const PROJECT_STRUCTURE = {
    'src': {
        description: 'TypeScriptソースコード',
        purpose: 'VSCode拡張機能のメインロジック',
        files: {
            'extension.ts': '拡張機能のエントリーポイント',
            'parsers/': 'Bladeテンプレート解析ロジック',
            'providers/': 'VSCodeツリービュープロバイダー'
        }
    },
    '__test__': {
        description: 'テストファイル',
        purpose: 'ユニットテストと統合テスト',
        files: {
            'extension.test.ts': 'メイン拡張機能のテスト',
            'parsers/': 'パーサーのテスト',
            'providers/': 'プロバイダーのテスト',
            'mocks/': 'テスト用モックファイル'
        }
    },
    'scripts': {
        description: '開発用スクリプト',
        purpose: 'ビルド、テスト、パッケージ化の自動化',
        files: {
            'package.js': 'パッケージ化スクリプト',
            'quality-check.js': '品質チェックスクリプト',
            'simple-test.js': '簡単なテストスクリプト',
            'test-watch.js': 'テスト監視スクリプト',
            'docs-generator.js': 'ドキュメント自動生成スクリプト',
            'docs-watcher.js': 'ドキュメント監視スクリプト'
        }
    },
    'docs': {
        description: '技術資料',
        purpose: 'プロジェクトの技術仕様と開発ガイド',
        files: {
            'TECHNICAL.md': '技術仕様書',
            'STRUCTURE.md': 'プロジェクト構造説明（自動生成）'
        }
    },
    'dist': {
        description: 'ビルド成果物',
        purpose: 'VSCode拡張機能パッケージ（.vsix）',
        files: {}
    },
    '.husky': {
        description: 'Git hooks',
        purpose: 'コミット前の品質チェック自動化',
        files: {
            'pre-commit': 'コミット前品質チェック',
            'commit-msg': 'コミットメッセージ形式チェック'
        }
    },
    '.github/workflows': {
        description: 'CI/CD設定',
        purpose: 'GitHub Actionsによる自動テスト・デプロイ',
        files: {
            'ci.yml': 'CI/CDパイプライン設定'
        }
    },
    'templates': {
        description: 'テンプレートファイル',
        purpose: 'プロジェクト生成用テンプレート',
        files: {}
    },
    '.devcontainer': {
        description: '開発コンテナ設定',
        purpose: 'Docker環境での開発サポート',
        files: {}
    }
};

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
 * プロジェクト構造ドキュメント生成
 */
async function generateStructureDocumentation() {
    console.log('📚 プロジェクト構造ドキュメントを生成中...');

    try {
        // プロジェクト構造を解析
        const structure = analyzeDirectory('.');

        // Markdownドキュメントを生成
        let markdown = `# Laravel Blade Visualizer - プロジェクト構造

## 概要

このドキュメントは、Laravel Blade Visualizer拡張機能のプロジェクト構造と各ディレクトリ・ファイルの役割について説明します。

## プロジェクト構造

\`\`\`
laravel-blade-visualizer/
\`\`\`

${generateStructureMarkdown(structure)}

## ディレクトリ詳細

`;

        // 各ディレクトリの詳細説明
        for (const [dirName, dirInfo] of Object.entries(PROJECT_STRUCTURE)) {
            markdown += `### \`${dirName}/\`\n\n`;
            markdown += `**説明:** ${dirInfo.description}\n\n`;
            markdown += `**目的:** ${dirInfo.purpose}\n\n`;

            if (Object.keys(dirInfo.files).length > 0) {
                markdown += `**主要ファイル:**\n\n`;
                for (const [fileName, fileDesc] of Object.entries(dirInfo.files)) {
                    markdown += `- \`${fileName}\` - ${fileDesc}\n`;
                }
                markdown += '\n';
            }

            markdown += `---\n\n`;
        }

        // ソースファイルの詳細説明
        markdown += generateSourceDescriptions();

        // 自動生成情報
        markdown += `## 自動生成情報

- **生成日時:** ${new Date().toLocaleString('ja-JP')}
- **生成スクリプト:** \`scripts/docs-generator.js\`
- **更新方法:** \`npm run docs:generate\`

> ⚠️ このドキュメントは自動生成されています。手動で編集しないでください。
`;

        // ファイルに保存
        const outputPath = path.join('docs', 'STRUCTURE.md');
        await fs.ensureDir('docs');
        await fs.writeFile(outputPath, markdown, 'utf8');

        console.log(`✅ ドキュメントを生成しました: ${outputPath}`);

        // 技術資料も更新
        await updateTechnicalDocs();

    } catch (error) {
        console.error('❌ ドキュメント生成中にエラーが発生しました:', error);
        process.exit(1);
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
 * メインのドキュメント生成処理
 */
async function generateDocumentation() {
    console.log('🚀 ドキュメント生成を開始します...');

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

        // プロジェクト構造ドキュメント生成
        await generateStructureDocumentation();

        // インデックスページ生成
        await generateIndexPage();

        console.log('🎉 ドキュメント生成が完了しました！');
        console.log('📁 生成されたドキュメント:');
        console.log('   - docs/api/ (TypeDoc)');
        console.log('   - docs/js-api/ (JSDoc)');
        console.log('   - docs/structure/ (カスタム)');
        console.log('   - docs/index.md (インデックス)');

    } catch (error) {
        console.error('❌ ドキュメント生成中にエラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    generateDocumentation();
}

/**
 * ファイルの種類に基づく説明を生成
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイルの説明
 */
function getFileDescription(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);

    const descriptions = {
        '.ts': 'TypeScriptソースファイル',
        '.js': 'JavaScriptファイル',
        '.json': '設定ファイル',
        '.md': 'Markdownドキュメント',
        '.yml': 'YAML設定ファイル',
        '.yaml': 'YAML設定ファイル',
        '.gitignore': 'Git除外設定',
        '.eslintrc.json': 'ESLint設定',
        'tsconfig.json': 'TypeScript設定',
        'package.json': 'npm設定ファイル',
        'package-lock.json': 'npm依存関係ロックファイル',
        'Dockerfile': 'Docker設定ファイル',
        'docker-compose.yml': 'Docker Compose設定',
        '.cursorrules': 'Cursor IDE設定'
    };

    return descriptions[fileName] || descriptions[ext] || 'ファイル';
}

/**
 * ディレクトリ構造を再帰的に解析
 * @param {string} dirPath - ディレクトリパス
 * @param {number} depth - 深さレベル
 * @returns {Object} ディレクトリ構造
 */
function analyzeDirectory(dirPath, depth = 0) {
    const structure = {
        name: path.basename(dirPath),
        path: dirPath,
        type: 'directory',
        children: [],
        files: []
    };

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // 除外ディレクトリのスキップ
                if (['node_modules', '.git', 'out', '.vscode-test'].includes(item)) {
                    continue;
                }

                if (depth < 3) { // 深さ制限
                    structure.children.push(analyzeDirectory(fullPath, depth + 1));
                }
            } else {
                structure.files.push({
                    name: item,
                    path: fullPath,
                    type: 'file',
                    description: getFileDescription(item)
                });
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
    }

    return structure;
}

/**
 * ソースファイルからコメントを抽出
 * @param {string} filePath - ファイルパス
 * @returns {string} 抽出されたコメント
 */
function extractComments(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath);

        if (ext === '.ts' || ext === '.js') {
            // JSDocコメントを抽出
            const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g);
            if (jsdocMatches) {
                return jsdocMatches.map(comment =>
                    comment.replace(/\/\*\*|\*\//g, '').trim()
                ).join('\n\n');
            }

            // 単行コメントを抽出
            const singleLineMatches = content.match(/\/\/.*$/gm);
            if (singleLineMatches) {
                return singleLineMatches.map(comment =>
                    comment.replace(/\/\//, '').trim()
                ).join('\n');
            }
        }

        return '';
    } catch (error) {
        return '';
    }
}

/**
 * Markdown形式でディレクトリ構造を生成
 * @param {Object} structure - ディレクトリ構造
 * @param {number} level - 見出しレベル
 * @returns {string} Markdown形式の構造
 */
function generateStructureMarkdown(structure, level = 1) {
    let markdown = '';
    const indent = '  '.repeat(level - 1);

    // ディレクトリ情報
    const dirInfo = PROJECT_STRUCTURE[structure.name];
    if (dirInfo) {
        markdown += `${indent}- **${structure.name}/** - ${dirInfo.description}\n`;
        markdown += `${indent}  - 目的: ${dirInfo.purpose}\n`;
    } else {
        markdown += `${indent}- **${structure.name}/**\n`;
    }

    // ファイル一覧
    for (const file of structure.files) {
        const fileInfo = dirInfo?.files?.[file.name];
        if (fileInfo) {
            markdown += `${indent}  - \`${file.name}\` - ${fileInfo}\n`;
        } else {
            markdown += `${indent}  - \`${file.name}\` - ${file.description}\n`;
        }
    }

    // サブディレクトリ
    for (const child of structure.children) {
        markdown += generateStructureMarkdown(child, level + 1);
    }

    return markdown;
}

/**
 * ソースファイルの説明を生成
 * @returns {string} ソースファイルの説明Markdown
 */
function generateSourceDescriptions() {
    let markdown = '## ソースファイル詳細\n\n';

    const sourceFiles = glob.sync('src/**/*.ts', { ignore: ['node_modules/**'] });

    for (const filePath of sourceFiles) {
        const relativePath = path.relative('.', filePath);
        const fileName = path.basename(filePath);
        const comments = extractComments(filePath);

        markdown += `### \`${relativePath}\`\n\n`;

        if (comments) {
            markdown += `**説明:**\n\`\`\`\n${comments}\n\`\`\`\n\n`;
        }

        markdown += `**役割:** ${getFileDescription(fileName)}\n\n`;
        markdown += `---\n\n`;
    }

    return markdown;
}

/**
 * 技術資料を更新
 */
async function updateTechnicalDocs() {
    try {
        const technicalPath = path.join('docs', 'TECHNICAL.md');

        if (await fs.pathExists(technicalPath)) {
            let content = await fs.readFile(technicalPath, 'utf8');

            // プロジェクト構造セクションを更新
            const structureSection = `## プロジェクト構造

詳細なプロジェクト構造については、[STRUCTURE.md](./STRUCTURE.md)を参照してください。

`;

            // 既存のプロジェクト構造セクションを置換
            const structureRegex = /## プロジェクト構造[\s\S]*?(?=## |$)/;
            if (structureRegex.test(content)) {
                content = content.replace(structureRegex, structureSection);
            } else {
                // セクションが見つからない場合は適切な場所に挿入
                const insertIndex = content.indexOf('## 開発環境');
                if (insertIndex !== -1) {
                    content = content.slice(0, insertIndex) + structureSection + content.slice(insertIndex);
                }
            }

            await fs.writeFile(technicalPath, content, 'utf8');
            console.log('✅ 技術資料を更新しました');
        }
    } catch (error) {
        console.warn('⚠️ 技術資料の更新中にエラーが発生しました:', error.message);
    }
}

module.exports = {
    generateDocumentation,
    generateTypeDocDocs,
    generateJSDocDocs,
    generateIndexPage,
    checkLibraryDependencies,
    generateStructureDocumentation
}; 

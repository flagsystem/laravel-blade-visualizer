#!/usr/bin/env node

/**
 * プロジェクト構造自動解析スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - プロジェクト構造の自動解析
 * - ディレクトリとファイルの説明自動生成
 * - キャッシュファイルの自動更新
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * ディレクトリ構造を自動解析してキャッシュファイルを生成
 * @param {string} rootPath - 解析対象のルートパス
 * @returns {Object} 解析結果
 */
async function analyzeProjectStructure(rootPath = '.') {
    const structure = {};
    const ignorePatterns = [
        'node_modules',
        '.git',
        '.vscode-test',
        'dist',
        'coverage',
        '.nyc_output',
        '*.vsix',
        '*.log',
        '.cache'
    ];

    try {
        const items = await fs.readdir(rootPath);

        for (const item of items) {
            // 無視パターンをチェック
            if (ignorePatterns.some(pattern =>
                item.includes(pattern) ||
                (pattern.startsWith('*') && item.endsWith(pattern.slice(1)))
            )) {
                continue;
            }

            const itemPath = path.join(rootPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                // ディレクトリの場合
                const subItems = await fs.readdir(itemPath);
                const files = {};

                for (const subItem of subItems) {
                    const subItemPath = path.join(itemPath, subItem);
                    const subStats = await fs.stat(subItemPath);

                    if (subStats.isFile()) {
                        // ファイルの説明を生成
                        const description = generateFileDescription(subItem, item);
                        files[subItem] = description;
                    } else if (subStats.isDirectory()) {
                        // サブディレクトリ
                        files[`${subItem}/`] = `${subItem}関連のファイル`;
                    }
                }

                // ディレクトリの説明を生成
                const description = generateDirectoryDescription(item);
                const purpose = generateDirectoryPurpose(item);

                structure[item] = {
                    description,
                    purpose,
                    files
                };
            }
        }

        return structure;
    } catch (error) {
        console.error('❌ プロジェクト構造の解析中にエラーが発生しました:', error.message);
        throw error;
    }
}

/**
 * ファイルの説明を生成
 * @param {string} fileName - ファイル名
 * @param {string} dirName - ディレクトリ名
 * @returns {string} ファイルの説明
 */
function generateFileDescription(fileName, dirName) {
    const ext = path.extname(fileName).toLowerCase();

    // 拡張子に基づく説明
    const extDescriptions = {
        '.ts': 'TypeScriptファイル',
        '.js': 'JavaScriptファイル',
        '.json': '設定ファイル',
        '.md': 'ドキュメントファイル',
        '.yml': 'YAML設定ファイル',
        '.yaml': 'YAML設定ファイル',
        '.sh': 'シェルスクリプト',
        '.bat': 'バッチファイル',
        '.ps1': 'PowerShellスクリプト'
    };

    // ファイル名に基づく説明
    const nameDescriptions = {
        'package.json': 'npmパッケージ設定',
        'tsconfig.json': 'TypeScript設定',
        'README.md': 'プロジェクト説明書',
        'CHANGELOG.md': '変更履歴',
        'LICENSE': 'ライセンスファイル',
        'Dockerfile': 'Docker設定',
        'docker-compose.yml': 'Docker Compose設定',
        '.gitignore': 'Git除外設定',
        '.eslintrc': 'ESLint設定',
        '.prettierrc': 'Prettier設定'
    };

    // ディレクトリに基づく説明
    const dirDescriptions = {
        'src': 'ソースコード',
        '__test__': 'テストファイル',
        'scripts': '開発スクリプト',
        'docs': 'ドキュメント',
        'dist': 'ビルド成果物',
        '.husky': 'Git hooks',
        '.github': 'GitHub設定',
        'templates': 'テンプレート',
        '.devcontainer': '開発コンテナ設定'
    };

    // 優先順位: ファイル名 > ディレクトリ名 > 拡張子
    if (nameDescriptions[fileName]) {
        return nameDescriptions[fileName];
    }

    if (dirDescriptions[dirName]) {
        return `${dirDescriptions[dirName]} (${extDescriptions[ext] || 'ファイル'})`;
    }

    return extDescriptions[ext] || 'ファイル';
}

/**
 * ディレクトリの説明を生成
 * @param {string} dirName - ディレクトリ名
 * @returns {string} ディレクトリの説明
 */
function generateDirectoryDescription(dirName) {
    const descriptions = {
        'src': 'TypeScriptソースコード',
        '__test__': 'テストファイル',
        'scripts': '開発用スクリプト',
        'docs': '技術資料',
        'dist': 'ビルド成果物',
        '.husky': 'Git hooks',
        '.github': 'GitHub設定',
        'templates': 'テンプレートファイル',
        '.devcontainer': '開発コンテナ設定',
        '.cache': 'キャッシュファイル',
        'node_modules': 'npm依存関係',
        'coverage': 'テストカバレッジ',
        'build': 'ビルド成果物',
        'out': '出力ファイル',
        'public': '公開ファイル',
        'assets': 'アセットファイル',
        'components': 'コンポーネント',
        'utils': 'ユーティリティ',
        'types': '型定義',
        'interfaces': 'インターフェース',
        'models': 'データモデル',
        'services': 'サービス',
        'controllers': 'コントローラー',
        'middleware': 'ミドルウェア',
        'routes': 'ルーティング',
        'views': 'ビュー',
        'layouts': 'レイアウト',
        'styles': 'スタイル',
        'images': '画像ファイル',
        'fonts': 'フォントファイル',
        'data': 'データファイル',
        'config': '設定ファイル',
        'settings': '設定',
        'locales': '多言語対応',
        'i18n': '国際化',
        'tests': 'テスト',
        'spec': 'テスト仕様',
        'mocks': 'モックファイル',
        'fixtures': 'テストデータ',
        'examples': 'サンプル',
        'demos': 'デモ',
        'samples': 'サンプル',
        'backup': 'バックアップ',
        'temp': '一時ファイル',
        'tmp': '一時ファイル',
        'log': 'ログファイル',
        'logs': 'ログファイル'
    };

    return descriptions[dirName] || `${dirName}ディレクトリ`;
}

/**
 * ディレクトリの目的を生成
 * @param {string} dirName - ディレクトリ名
 * @returns {string} ディレクトリの目的
 */
function generateDirectoryPurpose(dirName) {
    const purposes = {
        'src': 'メインアプリケーションのソースコード',
        '__test__': 'ユニットテストと統合テスト',
        'scripts': 'ビルド、テスト、パッケージ化の自動化',
        'docs': 'プロジェクトの技術仕様と開発ガイド',
        'dist': 'ビルドされた成果物の格納',
        '.husky': 'コミット前の品質チェック自動化',
        '.github': 'GitHub ActionsによるCI/CD',
        'templates': 'プロジェクト生成用テンプレート',
        '.devcontainer': 'Docker環境での開発サポート',
        '.cache': 'プロジェクト構造のキャッシュとドキュメント生成設定',
        'node_modules': 'npmパッケージの依存関係管理',
        'coverage': 'テストカバレッジレポート',
        'build': 'ビルドプロセスの成果物',
        'out': 'コンパイル済みファイル',
        'public': '静的ファイルの配信',
        'assets': '画像、CSS、JS等のアセット',
        'components': '再利用可能なUIコンポーネント',
        'utils': '共通ユーティリティ関数',
        'types': 'TypeScript型定義',
        'interfaces': 'インターフェース定義',
        'models': 'データモデルとビジネスロジック',
        'services': '外部APIとの通信やビジネスロジック',
        'controllers': 'リクエスト処理とレスポンス生成',
        'middleware': 'リクエスト処理の前処理',
        'routes': 'URLルーティング定義',
        'views': 'ユーザーインターフェース',
        'layouts': 'ページレイアウトテンプレート',
        'styles': 'CSS、SCSS等のスタイル定義',
        'images': '画像ファイルの管理',
        'fonts': 'フォントファイルの管理',
        'data': '静的データファイル',
        'config': 'アプリケーション設定',
        'settings': 'ユーザー設定とアプリケーション設定',
        'locales': '多言語対応の翻訳ファイル',
        'i18n': '国際化とローカライゼーション',
        'tests': 'テストファイルとテスト設定',
        'spec': 'テスト仕様とテストケース',
        'mocks': 'テスト用のモックデータ',
        'fixtures': 'テスト用の固定データ',
        'examples': '使用例とサンプルコード',
        'demos': 'デモンストレーション',
        'samples': 'サンプルコードとテンプレート',
        'backup': 'バックアップファイル',
        'temp': '一時的なファイル',
        'tmp': '一時的なファイル',
        'log': 'ログファイルの管理',
        'logs': 'ログファイルの管理'
    };

    return purposes[dirName] || `${dirName}ディレクトリの管理`;
}

/**
 * キャッシュファイルを自動更新
 */
async function updateCacheFromStructure() {
    try {
        console.log('🔍 プロジェクト構造を自動解析中...');

        // プロジェクト構造を自動解析
        const structure = await analyzeProjectStructure('.');

        // キャッシュファイルを更新
        await fs.ensureDir('.cache');
        await fs.writeJson('.cache/project-structure.json', structure, { spaces: 2 });

        console.log('✅ キャッシュファイルを自動更新しました: .cache/project-structure.json');
        console.log(`📊 解析されたディレクトリ数: ${Object.keys(structure).length}`);

        return structure;
    } catch (error) {
        console.error('❌ キャッシュファイルの自動更新に失敗しました:', error.message);
        throw error;
    }
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
    console.log(`
📋 プロジェクト構造自動解析ツール

使用方法:
  node scripts/structure-analyzer.js [コマンド]

コマンド:
  analyze    プロジェクト構造を解析してキャッシュファイルを更新
  help       ヘルプを表示

例:
  node scripts/structure-analyzer.js analyze
`);
}

/**
 * メイン処理
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === '--help' || command === '-h' || command === 'help') {
        showHelp();
        return;
    }

    switch (command) {
        case 'analyze':
            await updateCacheFromStructure();
            break;

        default:
            console.error(`❌ 不明なコマンド: ${command}`);
            showHelp();
            break;
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

module.exports = {
    analyzeProjectStructure,
    generateFileDescription,
    generateDirectoryDescription,
    generateDirectoryPurpose,
    updateCacheFromStructure
}; 

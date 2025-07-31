#!/usr/bin/env node

/**
 * プロジェクト構造キャッシュ管理スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - キャッシュファイルの検証
 * - キャッシュファイルの更新
 * - キャッシュファイルのバックアップ
 * - キャッシュファイルの復元
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * 設定ファイルのパス
 */
const CONFIG_PATH = path.join('.cache', 'project-structure.json');
const BACKUP_PATH = path.join('.cache', 'project-structure.backup.json');

/**
 * キャッシュファイルを検証
 * @param {Object} config - 検証対象の設定
 * @returns {boolean} 検証結果
 */
function validateConfig(config) {
    try {
        // 必須フィールドのチェック
        for (const [dirName, dirInfo] of Object.entries(config)) {
            if (!dirInfo.description || !dirInfo.purpose) {
                console.error(`❌ キャッシュエラー: ${dirName} に必須フィールドが不足しています`);
                return false;
            }

            // filesフィールドの存在チェック
            if (!dirInfo.files) {
                console.error(`❌ キャッシュエラー: ${dirName} に files フィールドが不足しています`);
                return false;
            }
        }

        console.log('✅ キャッシュファイルの検証が完了しました');
        return true;
    } catch (error) {
        console.error('❌ キャッシュファイルの検証中にエラーが発生しました:', error.message);
        return false;
    }
}

/**
 * キャッシュファイルをバックアップ
 */
async function backupConfig() {
    try {
        if (await fs.pathExists(CONFIG_PATH)) {
            await fs.copy(CONFIG_PATH, BACKUP_PATH);
            console.log('✅ キャッシュファイルをバックアップしました:', BACKUP_PATH);
        } else {
            console.warn('⚠️ バックアップ対象のキャッシュファイルが見つかりません');
        }
    } catch (error) {
        console.error('❌ バックアップ中にエラーが発生しました:', error.message);
    }
}

/**
 * キャッシュファイルを復元
 */
async function restoreConfig() {
    try {
        if (await fs.pathExists(BACKUP_PATH)) {
            await fs.copy(BACKUP_PATH, CONFIG_PATH);
            console.log('✅ キャッシュファイルを復元しました:', CONFIG_PATH);
        } else {
            console.warn('⚠️ 復元対象のバックアップファイルが見つかりません');
        }
    } catch (error) {
        console.error('❌ 復元中にエラーが発生しました:', error.message);
    }
}

/**
 * キャッシュファイルを更新
 * @param {Object} updates - 更新内容
 */
async function updateConfig(updates) {
    try {
        // 現在の設定を読み込み
        let config = {};
        if (await fs.pathExists(CONFIG_PATH)) {
            const configData = await fs.readFile(CONFIG_PATH, 'utf8');
            config = JSON.parse(configData);
        }

        // 更新を適用
        Object.assign(config, updates);

        // 設定を検証
        if (!validateConfig(config)) {
            console.error('❌ キャッシュの更新を中止します');
            return false;
        }

        // 設定を保存
        await fs.ensureDir('.cache');
        await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
        console.log('✅ キャッシュファイルを更新しました:', CONFIG_PATH);

        return true;
    } catch (error) {
        console.error('❌ キャッシュファイルの更新中にエラーが発生しました:', error.message);
        return false;
    }
}

/**
 * キャッシュファイルを初期化
 */
async function initConfig() {
    try {
        // キャッシュファイルが既に存在するかチェック
        if (await fs.pathExists(CONFIG_PATH)) {
            console.log('⚠️ キャッシュファイルは既に存在します');
            console.log(`   ファイル: ${CONFIG_PATH}`);
            console.log('   上書きする場合は --force フラグを使用してください');
            return false;
        }

        // デフォルト設定を作成
        const defaultConfig = {
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
                    'config-manager.js': '設定管理スクリプト'
                }
            },
            'docs': {
                description: '技術資料',
                purpose: 'プロジェクトの技術仕様と開発ガイド',
                files: {
                    'TECHNICAL.md': '技術仕様書',
                    'STRUCTURE.md': 'プロジェクト構造説明（自動生成）',
                    'index.md': 'ドキュメントインデックス（自動生成）'
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
            },
            'config': {
                description: '設定ファイル',
                purpose: 'プロジェクト設定とドキュメント生成設定',
                files: {
                    'project-structure.json': 'プロジェクト構造定義'
                }
            }
        };

        // キャッシュファイルを作成
        await fs.ensureDir('.cache');
        await fs.writeJson(CONFIG_PATH, defaultConfig, { spaces: 2 });

        console.log('✅ キャッシュファイルを初期化しました:', CONFIG_PATH);
        console.log('📝 キャッシュファイルを編集してプロジェクト構造に合わせてください');

        return true;
    } catch (error) {
        console.error('❌ キャッシュファイルの初期化に失敗しました:', error.message);
        return false;
    }
}

/**
 * キャッシュファイルの状態を表示
 */
async function showConfigStatus() {
    try {
        console.log('📋 キャッシュファイルの状態:');

        if (await fs.pathExists(CONFIG_PATH)) {
            const configData = await fs.readFile(CONFIG_PATH, 'utf8');
            const config = JSON.parse(configData);

            console.log(`   📁 キャッシュファイル: ${CONFIG_PATH}`);
            console.log(`   📊 ディレクトリ数: ${Object.keys(config).length}`);

            // 各ディレクトリの情報を表示
            for (const [dirName, dirInfo] of Object.entries(config)) {
                const fileCount = Object.keys(dirInfo.files || {}).length;
                console.log(`      - ${dirName}/ (${fileCount} ファイル)`);
            }
        } else {
            console.log('   ❌ キャッシュファイルが見つかりません');
            console.log('   💡 キャッシュファイルを初期化してください: npm run config:init');
        }

        if (await fs.pathExists(BACKUP_PATH)) {
            console.log(`   💾 バックアップ: ${BACKUP_PATH}`);
        } else {
            console.log('   ❌ バックアップファイルが見つかりません');
        }

    } catch (error) {
        console.error('❌ キャッシュファイルの状態確認中にエラーが発生しました:', error.message);
    }
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
    console.log(`
📋 プロジェクト構造キャッシュ管理ツール

使用方法:
  node scripts/config-manager.js [コマンド] [オプション]

コマンド:
  init        キャッシュファイルを初期化
  validate    キャッシュファイルを検証
  backup      キャッシュファイルをバックアップ
  restore     キャッシュファイルを復元
  status      キャッシュファイルの状態を表示
  update      キャッシュファイルを更新（対話モード）

例:
  node scripts/config-manager.js init
  node scripts/config-manager.js validate
  node scripts/config-manager.js backup
  node scripts/config-manager.js status
`);
}

/**
 * メイン処理
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === '--help' || command === '-h') {
        showHelp();
        return;
    }

    switch (command) {
        case 'init':
            await initConfig();
            break;

        case 'validate':
            try {
                const configData = await fs.readFile(CONFIG_PATH, 'utf8');
                const config = JSON.parse(configData);
                validateConfig(config);
            } catch (error) {
                console.error('❌ キャッシュファイルの検証に失敗しました:', error.message);
            }
            break;

        case 'backup':
            await backupConfig();
            break;

        case 'restore':
            await restoreConfig();
            break;

        case 'status':
            await showConfigStatus();
            break;

        case 'update':
            console.log('🔄 キャッシュファイルの更新モード');
            console.log('   現在のキャッシュを確認してから更新してください');
            await showConfigStatus();
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
    validateConfig,
    backupConfig,
    restoreConfig,
    updateConfig,
    showConfigStatus
}; 

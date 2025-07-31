#!/usr/bin/env node

/**
 * プロジェクト構造設定管理スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - 設定ファイルの検証
 * - 設定ファイルの更新
 * - 設定ファイルのバックアップ
 * - 設定ファイルの復元
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * 設定ファイルのパス
 */
const CONFIG_PATH = path.join('config', 'project-structure.json');
const BACKUP_PATH = path.join('config', 'project-structure.backup.json');

/**
 * 設定ファイルを検証
 * @param {Object} config - 検証対象の設定
 * @returns {boolean} 検証結果
 */
function validateConfig(config) {
    try {
        // 必須フィールドのチェック
        for (const [dirName, dirInfo] of Object.entries(config)) {
            if (!dirInfo.description || !dirInfo.purpose) {
                console.error(`❌ 設定エラー: ${dirName} に必須フィールドが不足しています`);
                return false;
            }

            // filesフィールドの存在チェック
            if (!dirInfo.files) {
                console.error(`❌ 設定エラー: ${dirName} に files フィールドが不足しています`);
                return false;
            }
        }

        console.log('✅ 設定ファイルの検証が完了しました');
        return true;
    } catch (error) {
        console.error('❌ 設定ファイルの検証中にエラーが発生しました:', error.message);
        return false;
    }
}

/**
 * 設定ファイルをバックアップ
 */
async function backupConfig() {
    try {
        if (await fs.pathExists(CONFIG_PATH)) {
            await fs.copy(CONFIG_PATH, BACKUP_PATH);
            console.log('✅ 設定ファイルをバックアップしました:', BACKUP_PATH);
        } else {
            console.warn('⚠️ バックアップ対象の設定ファイルが見つかりません');
        }
    } catch (error) {
        console.error('❌ バックアップ中にエラーが発生しました:', error.message);
    }
}

/**
 * 設定ファイルを復元
 */
async function restoreConfig() {
    try {
        if (await fs.pathExists(BACKUP_PATH)) {
            await fs.copy(BACKUP_PATH, CONFIG_PATH);
            console.log('✅ 設定ファイルを復元しました:', CONFIG_PATH);
        } else {
            console.warn('⚠️ 復元対象のバックアップファイルが見つかりません');
        }
    } catch (error) {
        console.error('❌ 復元中にエラーが発生しました:', error.message);
    }
}

/**
 * 設定ファイルを更新
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
            console.error('❌ 設定の更新を中止します');
            return false;
        }

        // 設定を保存
        await fs.ensureDir('config');
        await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
        console.log('✅ 設定ファイルを更新しました:', CONFIG_PATH);

        return true;
    } catch (error) {
        console.error('❌ 設定ファイルの更新中にエラーが発生しました:', error.message);
        return false;
    }
}

/**
 * 設定ファイルの状態を表示
 */
async function showConfigStatus() {
    try {
        console.log('📋 設定ファイルの状態:');

        if (await fs.pathExists(CONFIG_PATH)) {
            const configData = await fs.readFile(CONFIG_PATH, 'utf8');
            const config = JSON.parse(configData);

            console.log(`   📁 設定ファイル: ${CONFIG_PATH}`);
            console.log(`   📊 ディレクトリ数: ${Object.keys(config).length}`);

            // 各ディレクトリの情報を表示
            for (const [dirName, dirInfo] of Object.entries(config)) {
                const fileCount = Object.keys(dirInfo.files || {}).length;
                console.log(`      - ${dirName}/ (${fileCount} ファイル)`);
            }
        } else {
            console.log('   ❌ 設定ファイルが見つかりません');
        }

        if (await fs.pathExists(BACKUP_PATH)) {
            console.log(`   💾 バックアップ: ${BACKUP_PATH}`);
        } else {
            console.log('   ❌ バックアップファイルが見つかりません');
        }

    } catch (error) {
        console.error('❌ 設定ファイルの状態確認中にエラーが発生しました:', error.message);
    }
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
    console.log(`
📋 プロジェクト構造設定管理ツール

使用方法:
  node scripts/config-manager.js [コマンド] [オプション]

コマンド:
  validate    設定ファイルを検証
  backup      設定ファイルをバックアップ
  restore     設定ファイルを復元
  status      設定ファイルの状態を表示
  update      設定ファイルを更新（対話モード）

例:
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
        case 'validate':
            try {
                const configData = await fs.readFile(CONFIG_PATH, 'utf8');
                const config = JSON.parse(configData);
                validateConfig(config);
            } catch (error) {
                console.error('❌ 設定ファイルの検証に失敗しました:', error.message);
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
            console.log('🔄 設定ファイルの更新モード');
            console.log('   現在の設定を確認してから更新してください');
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

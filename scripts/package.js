#!/usr/bin/env node

/**
 * VSCEパッケージ化の自動化スクリプト
 * 
 * このスクリプトは以下の処理を自動化します：
 * - コンパイル
 * - リント
 * - テスト実行
 * - パッケージ化（--yesフラグ付き）
 * - バージョン更新
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * コマンドを実行する
 * @param {string} command - 実行するコマンド
 * @param {string} description - コマンドの説明
 * @returns {Promise<boolean>} 実行が成功したかどうか
 */
async function runCommand(command, description) {
    return new Promise((resolve) => {
        console.log(`🔄 ${description}を実行中...`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ ${description}が失敗しました:`);
                console.error(stdout);
                console.error(stderr);
                resolve(false);
            } else {
                console.log(`✅ ${description}が成功しました`);
                if (stdout.trim()) {
                    console.log(stdout);
                }
                resolve(true);
            }
        });
    });
}

/**
 * パッケージファイルが存在するかチェックする
 * @returns {boolean} パッケージファイルが存在するかどうか
 */
function hasPackageFile() {
    const packageFiles = fs.readdirSync('.').filter(file =>
        file.endsWith('.vsix') && file.includes('laravel-blade-visualizer')
    );
    return packageFiles.length > 0;
}

/**
 * 最新のパッケージファイルを削除する
 */
function cleanupOldPackages() {
    const packageFiles = fs.readdirSync('.').filter(file =>
        file.endsWith('.vsix') && file.includes('laravel-blade-visualizer')
    );

    packageFiles.forEach(file => {
        fs.unlinkSync(file);
        console.log(`🗑️  古いパッケージファイルを削除しました: ${file}`);
    });
}

/**
 * バージョン情報を取得する
 * @returns {string} 現在のバージョン
 */
function getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
}

/**
 * パッケージ化を実行する
 * @param {boolean} updateVersion - バージョンを更新するかどうか
 */
async function packageExtension(updateVersion = false) {
    console.log('🚀 VSCEパッケージ化を開始します...');

    // 現在のバージョンを表示
    const currentVersion = getCurrentVersion();
    console.log(`📦 現在のバージョン: ${currentVersion}`);

    // 古いパッケージファイルをクリーンアップ
    cleanupOldPackages();

    // 前処理を実行
    const steps = [
        { command: 'npm run compile', description: 'TypeScriptコンパイル' },
        { command: 'npm run lint', description: 'コード品質チェック' },
        { command: 'npm test', description: 'テスト実行' }
    ];

    for (const step of steps) {
        const success = await runCommand(step.command, step.description);
        if (!success) {
            console.error('❌ パッケージ化を中止します');
            process.exit(1);
        }
    }

    // VSCEパッケージ化を実行
    const packageSuccess = await runCommand('npx vsce package --yes', 'VSCEパッケージ化');
    if (!packageSuccess) {
        console.error('❌ パッケージ化に失敗しました');
        process.exit(1);
    }

    // パッケージファイルの確認
    if (hasPackageFile()) {
        const packageFiles = fs.readdirSync('.').filter(file =>
            file.endsWith('.vsix') && file.includes('laravel-blade-visualizer')
        );
        console.log(`📦 パッケージファイルが作成されました: ${packageFiles[0]}`);
    }

    // バージョン更新
    if (updateVersion) {
        console.log('🔄 バージョンを更新中...');
        const versionSuccess = await runCommand('npm version patch', 'バージョン更新');
        if (versionSuccess) {
            const newVersion = getCurrentVersion();
            console.log(`📈 バージョンが更新されました: ${currentVersion} → ${newVersion}`);
        }
    }

    console.log('✨ パッケージ化が完了しました！');
}

/**
 * メイン関数
 */
async function main() {
    const args = process.argv.slice(2);
    const updateVersion = args.includes('--version') || args.includes('-v');

    try {
        await packageExtension(updateVersion);
    } catch (error) {
        console.error('❌ パッケージ化中にエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// スクリプトを実行
if (require.main === module) {
    main();
}

module.exports = {
    runCommand,
    hasPackageFile,
    cleanupOldPackages,
    getCurrentVersion,
    packageExtension
}; 

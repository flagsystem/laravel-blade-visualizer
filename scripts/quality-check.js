#!/usr/bin/env node

/**
 * 品質チェックスクリプト
 * コミット前の静的解析とテストを実行する
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * コマンドを実行し、エラーがあれば終了する
 * 
 * @param {string} command - 実行するコマンド
 * @param {string} description - コマンドの説明
 */
function runCommand(command, description) {
    console.log(`🔍 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description}が完了しました。`);
    } catch (error) {
        console.error(`❌ ${description}が失敗しました。`);
        process.exit(1);
    }
}

/**
 * メイン処理
 */
function main() {
    console.log('🚀 品質チェックを開始します...\n');

    // TypeScriptコンパイル
    runCommand('npm run compile', 'TypeScriptコンパイル');

    // ESLint静的解析
    runCommand('npm run lint', 'ESLint静的解析');

    // ユニットテスト実行
    runCommand('npm run test:simple', 'ユニットテスト');

    console.log('\n🎉 すべての品質チェックが完了しました！');
}

// スクリプトが直接実行された場合のみmain()を実行
if (require.main === module) {
    main();
}

module.exports = { runCommand, main }; 

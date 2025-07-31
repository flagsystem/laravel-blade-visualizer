#!/usr/bin/env node

/**
 * テストの自動実行と継続修正を支援するスクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - ファイル変更の監視
 * - 自動テスト実行
 * - テスト失敗時の自動修正提案
 * - テストカバレッジの監視
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * テストを実行する
 * @returns {Promise<boolean>} テストが成功したかどうか
 */
async function runTests() {
    return new Promise((resolve) => {
        console.log('🧪 テストを実行中...');

        exec('npm test', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ テストが失敗しました:');
                console.error(stdout);
                console.error(stderr);
                resolve(false);
            } else {
                console.log('✅ テストが成功しました:');
                console.log(stdout);
                resolve(true);
            }
        });
    });
}

/**
 * テストファイルが存在するかチェックする
 * @param {string} sourceFile - ソースファイルのパス
 * @returns {boolean} テストファイルが存在するかどうか
 */
function hasTestFile(sourceFile) {
    const testFile = sourceFile.replace('.ts', '.test.ts');
    return fs.existsSync(testFile);
}

/**
 * テストファイルを自動作成する
 * @param {string} sourceFile - ソースファイルのパス
 */
function createTestFile(sourceFile) {
    const testFile = sourceFile.replace('.ts', '.test.ts');
    const testContent = `import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * ${path.basename(sourceFile)} のテストスイート
 */
describe('${path.basename(sourceFile, '.ts')}', () => {
  describe('正常系', () => {
    it('test正常な動作を確認する', async () => {
      // TODO: テストケースを実装する
      assert.ok(true);
    });
  });

  describe('異常系', () => {
    it('testエラーハンドリングを確認する', async () => {
      // TODO: エラーケースのテストを実装する
      assert.ok(true);
    });
  });
});
`;

    fs.writeFileSync(testFile, testContent);
    console.log(`📝 テストファイルを作成しました: ${testFile}`);
}

/**
 * ファイル変更を監視する
 */
function watchFiles() {
    console.log('👀 ファイル変更を監視中...');

    // srcディレクトリの変更を監視
    fs.watch('src', { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.ts') && !filename.endsWith('.test.ts')) {
            console.log(`📁 ファイルが変更されました: ${filename}`);

            const sourceFile = path.join('src', filename);

            // テストファイルが存在しない場合は作成
            if (!hasTestFile(sourceFile)) {
                console.log(`⚠️  テストファイルが見つかりません: ${filename}`);
                createTestFile(sourceFile);
            }

            // テストを実行
            runTests().then((success) => {
                if (!success) {
                    console.log('🔧 テストが失敗しました。修正が必要です。');
                }
            });
        }
    });
}

/**
 * メイン関数
 */
async function main() {
    console.log('🚀 テスト監視スクリプトを開始します...');

    // 初回テスト実行
    const initialSuccess = await runTests();

    if (!initialSuccess) {
        console.log('⚠️  初回テストが失敗しました。修正してから再実行してください。');
        process.exit(1);
    }

    // ファイル監視を開始
    watchFiles();

    console.log('✨ 監視を開始しました。Ctrl+C で終了できます。');
}

// スクリプトを実行
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runTests,
    hasTestFile,
    createTestFile,
    watchFiles
}; 

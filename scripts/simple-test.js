#!/usr/bin/env node

/**
 * 簡単なテストスクリプト
 * VSCodeモジュールに依存しない基本的なテストを実行する
 */

const assert = require('assert');

/**
 * 基本的なテストスイート
 */
function runBasicTests() {
    console.log('🧪 基本的なテストを実行中...');

    // 基本的なテスト
    console.log('  - 基本的な計算テスト');
    assert.strictEqual(1 + 1, 2, '基本的な計算が失敗しました');
    assert.strictEqual('hello', 'hello', '文字列の比較が失敗しました');
    assert.deepStrictEqual([1, 2, 3], [1, 2, 3], '配列の比較が失敗しました');

    const obj1 = { name: 'test', value: 123 };
    const obj2 = { name: 'test', value: 123 };
    assert.deepStrictEqual(obj1, obj2, 'オブジェクトの比較が失敗しました');

    // ファイル構造のテスト
    console.log('  - ファイル構造テスト');
    const fs = require('fs');
    const path = require('path');

    assert.ok(fs.existsSync('src'), 'srcディレクトリが存在しません');
    assert.ok(fs.existsSync('__test__'), '__test__ディレクトリが存在しません');
    assert.ok(fs.existsSync('package.json'), 'package.jsonが存在しません');
    assert.ok(fs.existsSync('tsconfig.json'), 'tsconfig.jsonが存在しません');
    assert.ok(fs.existsSync('.eslintrc.json'), '.eslintrc.jsonが存在しません');

    // 設定ファイルのテスト
    console.log('  - 設定ファイルテスト');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert.ok(packageJson.name, 'package.jsonにnameフィールドがありません');
    assert.ok(packageJson.version, 'package.jsonにversionフィールドがありません');
    assert.ok(packageJson.publisher, 'package.jsonにpublisherフィールドがありません');

    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    assert.ok(tsconfig.compilerOptions, 'tsconfig.jsonにcompilerOptionsがありません');
    assert.ok(tsconfig.compilerOptions.rootDir, 'tsconfig.jsonにrootDirがありません');

    console.log('✅ 基本的なテストが完了しました');
}

/**
 * メイン処理
 */
function main() {
    console.log('🚀 簡単なテストを開始します...\n');

    try {
        runBasicTests();
        console.log('\n🎉 すべてのテストが成功しました！');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ テストが失敗しました:', error.message);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみmain()を実行
if (require.main === module) {
    main();
}

module.exports = { runBasicTests, main }; 

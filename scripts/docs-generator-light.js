#!/usr/bin/env node

/**
 * 軽量版ドキュメント生成スクリプト
 * 
 * コミット時の高速処理用に最適化されたドキュメント生成スクリプト
 * 基本的なドキュメント更新のみを実行し、重い処理はスキップします
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * 軽量版ドキュメント生成
 * コミット時の高速処理用
 */
async function generateLightDocumentation() {
    console.log('📚 軽量ドキュメント更新を実行中...');

    try {
        // 基本的なドキュメントディレクトリの作成
        const docsDir = 'docs';
        await fs.ensureDir(docsDir);

        // READMEの更新日時を記録
        await updateReadmeTimestamp();

        // 基本的な構造ドキュメントの更新
        await updateBasicStructure();

        console.log('✅ 軽量ドキュメント更新が完了しました');

    } catch (error) {
        console.error('❌ 軽量ドキュメント更新中にエラーが発生しました:', error.message);
        // エラーが発生してもコミットを継続する
        console.log('⚠️  エラーが発生しましたが、コミットを継続します');
        process.exit(0);
    }
}

/**
 * READMEの更新日時を記録
 */
async function updateReadmeTimestamp() {
    try {
        const readmePath = 'README.md';
        if (fs.existsSync(readmePath)) {
            const content = await fs.readFile(readmePath, 'utf8');
            const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

            // 更新日時を追加または更新
            const updatedContent = content.replace(
                /<!-- Last Updated: .*? -->/,
                `<!-- Last Updated: ${timestamp} -->`
            );

            if (updatedContent !== content) {
                await fs.writeFile(readmePath, updatedContent);
                console.log('📝 READMEの更新日時を更新しました');
            }
        }
    } catch (error) {
        console.log('⚠️  README更新のスキップ:', error.message);
    }
}

/**
 * 基本的な構造ドキュメントの更新
 */
async function updateBasicStructure() {
    try {
        const structureDir = path.join('docs', 'structure');
        await fs.ensureDir(structureDir);

        // 基本的な構造情報を生成
        const structureInfo = {
            lastUpdated: new Date().toISOString(),
            projectName: 'Laravel Blade Visualizer',
            version: require('../package.json').version,
            directories: [
                'src/',
                '__test__/',
                'docs/',
                'scripts/',
                'templates/'
            ]
        };

        const structurePath = path.join(structureDir, 'basic-structure.json');
        await fs.writeJson(structurePath, structureInfo, { spaces: 2 });

        console.log('📁 基本構造ドキュメントを更新しました');
    } catch (error) {
        console.log('⚠️  構造ドキュメント更新のスキップ:', error.message);
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    generateLightDocumentation();
}

module.exports = { generateLightDocumentation }; 

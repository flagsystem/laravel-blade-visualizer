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

        const structurePath = path.join(structureDir, 'basic-structure.json');

        // 現在のpackage.jsonからバージョン情報を取得
        const packageJson = require('../package.json');

        // 新しい構造情報を生成
        const newStructureInfo = {
            lastUpdated: new Date().toISOString(),
            projectName: 'Laravel Blade Visualizer',
            version: packageJson.version,
            directories: [
                'src/',
                '__test__/',
                'docs/',
                'scripts/',
                'templates/'
            ],
            // ファイル変更の検出用にハッシュを追加
            contentHash: generateContentHash(packageJson.version)
        };

        // 既存のファイルがあるかチェック
        let shouldUpdate = true;
        if (fs.existsSync(structurePath)) {
            try {
                const existingData = await fs.readJson(structurePath);

                // バージョンが同じで、contentHashも同じ場合は更新をスキップ
                if (existingData.version === newStructureInfo.version &&
                    existingData.contentHash === newStructureInfo.contentHash) {
                    shouldUpdate = false;
                    console.log('📁 基本構造ドキュメントは最新です（更新をスキップ）');
                }
            } catch (error) {
                console.log('⚠️  既存ファイルの読み込みエラー、新規作成します');
            }
        }

        if (shouldUpdate) {
            await fs.writeJson(structurePath, newStructureInfo, { spaces: 2 });
            console.log('📁 基本構造ドキュメントを更新しました');
        }

    } catch (error) {
        console.log('⚠️  構造ドキュメント更新のスキップ:', error.message);
    }
}

/**
 * コンテンツハッシュを生成
 * @param {string} version - バージョン情報
 * @returns {string} ハッシュ値
 */
function generateContentHash(version) {
    const crypto = require('crypto');
    const content = `version:${version}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// スクリプトが直接実行された場合
if (require.main === module) {
    generateLightDocumentation();
}

module.exports = { generateLightDocumentation }; 

#!/usr/bin/env node

/**
 * ファイル変更監視とドキュメント自動更新スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - プロジェクトファイルの変更監視
 * - 変更検知時のドキュメント自動生成
 * - デバウンス機能による過度な更新防止
 * - ログ出力による監視状況の可視化
 */

const chokidar = require('chokidar');
const path = require('path');
const { generateDocumentation } = require('./docs-generator');

/**
 * 監視設定
 */
const WATCH_CONFIG = {
    // 監視対象ディレクトリ
    directories: [
        'src/',
        '__test__/',
        'scripts/',
        'docs/',
        'templates/',
        '.github/'
    ],

    // 監視対象ファイル拡張子
    extensions: [
        'ts', 'js', 'json', 'md', 'yml', 'yaml'
    ],

    // 除外パターン
    ignored: [
        'node_modules/**',
        'dist/**',
        'out/**',
        '.vscode-test/**',
        '**/*.test.js',
        '**/*.test.ts',
        '**/*.vsix',
        'package-lock.json'
    ],

    // デバウンス時間（ミリ秒）
    debounceTime: 2000,

    // 監視オプション
    watchOptions: {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    }
};

/**
 * デバウンス機能付きのドキュメント更新
 */
class DebouncedDocumentationUpdater {
    constructor(debounceTime = 2000) {
        this.debounceTime = debounceTime;
        this.timeout = null;
        this.enhancedTimeout = null;
        this.isUpdating = false;
        this.isEnhancedUpdating = false;
    }

    /**
     * ドキュメント更新をスケジュール
     */
    scheduleUpdate() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.updateDocumentation();
        }, this.debounceTime);
    }

    /**
     * ドキュメント更新を実行
     */
    async updateDocumentation() {
        if (this.isUpdating) {
            console.log('⏳ 既にドキュメント更新が実行中です...');
            return;
        }

        this.isUpdating = true;

        try {
            console.log('🔄 ドキュメントを更新中...');
            await generateDocumentation();
            console.log('✅ ドキュメント更新が完了しました');
        } catch (error) {
            console.error('❌ ドキュメント更新中にエラーが発生しました:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    /**
 * 拡張版ドキュメント更新をスケジュール
 */
    scheduleEnhancedUpdate() {
        if (this.enhancedTimeout) {
            clearTimeout(this.enhancedTimeout);
        }

        this.enhancedTimeout = setTimeout(() => {
            this.updateEnhancedDocumentation();
        }, this.debounceTime);
    }

    /**
     * 拡張版ドキュメント更新を実行
     */
    async updateEnhancedDocumentation() {
        if (this.isEnhancedUpdating) {
            console.log('⏳ 既に拡張版ドキュメント更新が実行中です...');
            return;
        }

        this.isEnhancedUpdating = true;

        try {
            console.log('🔄 拡張版ドキュメントを更新中...');
            const { generateEnhancedDocumentation } = require('./docs-generator-enhanced');
            await generateEnhancedDocumentation();
            console.log('✅ 拡張版ドキュメント更新が完了しました');
        } catch (error) {
            console.error('❌ 拡張版ドキュメント更新中にエラーが発生しました:', error);
        } finally {
            this.isEnhancedUpdating = false;
        }
    }

    /**
     * 監視を停止
     */
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.enhancedTimeout) {
            clearTimeout(this.enhancedTimeout);
            this.enhancedTimeout = null;
        }
    }
}

/**
 * ファイル変更イベントハンドラー
 */
class FileChangeHandler {
    constructor() {
        this.updater = new DebouncedDocumentationUpdater(WATCH_CONFIG.debounceTime);
        this.changeCount = 0;
        this.lastChangeTime = Date.now();
    }

    /**
     * ファイル変更イベントを処理
     * @param {string} filePath - 変更されたファイルパス
     * @param {string} eventType - イベントタイプ
     */
    handleFileChange(filePath, eventType) {
        const relativePath = path.relative('.', filePath);
        const now = Date.now();

        // 変更カウントと時間を更新
        this.changeCount++;
        this.lastChangeTime = now;

        // ログ出力
        const eventEmoji = {
            'add': '➕',
            'change': '📝',
            'unlink': '🗑️',
            'addDir': '📁',
            'unlinkDir': '🗂️'
        };

        console.log(`${eventEmoji[eventType] || '❓'} ${eventType}: ${relativePath}`);

        // ドキュメント更新をスケジュール
        this.updater.scheduleUpdate();

        // 拡張版モードの場合は拡張版ドキュメントも更新
        if (process.argv.includes('--enhanced')) {
            this.updater.scheduleEnhancedUpdate();
        }
    }

    /**
     * 監視状況を表示
     */
    showStatus() {
        const elapsed = Date.now() - this.lastChangeTime;
        console.log(`\n📊 監視状況:`);
        console.log(`   - 変更回数: ${this.changeCount}`);
        console.log(`   - 最終変更: ${elapsed}ms前`);
        console.log(`   - 監視対象: ${WATCH_CONFIG.directories.join(', ')}`);
    }

    /**
     * 監視を停止
     */
    stop() {
        this.updater.stop();
    }
}

/**
 * 監視パターンを生成
 * @returns {Array} 監視パターンの配列
 */
function generateWatchPatterns() {
    const patterns = [];

    for (const dir of WATCH_CONFIG.directories) {
        for (const ext of WATCH_CONFIG.extensions) {
            patterns.push(`${dir}**/*.${ext}`);
        }
    }

    return patterns;
}

/**
 * 監視を開始
 */
function startWatching() {
    console.log('👀 ドキュメント監視を開始します...');
    console.log(`📁 監視対象: ${WATCH_CONFIG.directories.join(', ')}`);
    console.log(`📄 ファイル形式: ${WATCH_CONFIG.extensions.join(', ')}`);
    console.log('⏹️  停止するには Ctrl+C を押してください\n');

    const handler = new FileChangeHandler();
    const patterns = generateWatchPatterns();

    // ファイル監視を開始
    const watcher = chokidar.watch(patterns, {
        ...WATCH_CONFIG.watchOptions,
        ignored: WATCH_CONFIG.ignored
    });

    // イベントリスナーを設定
    watcher
        .on('add', (path) => handler.handleFileChange(path, 'add'))
        .on('change', (path) => handler.handleFileChange(path, 'change'))
        .on('unlink', (path) => handler.handleFileChange(path, 'unlink'))
        .on('addDir', (path) => handler.handleFileChange(path, 'addDir'))
        .on('unlinkDir', (path) => handler.handleFileChange(path, 'unlinkDir'))
        .on('error', (error) => {
            console.error('❌ 監視中にエラーが発生しました:', error);
        })
        .on('ready', () => {
            console.log('✅ ファイル監視の準備が完了しました');
        });

    // プロセス終了時の処理
    process.on('SIGINT', () => {
        console.log('\n🛑 監視を停止しています...');
        handler.showStatus();
        handler.stop();
        watcher.close();
        process.exit(0);
    });

    // 定期的なステータス表示
    setInterval(() => {
        handler.showStatus();
    }, 30000); // 30秒ごと

    return { watcher, handler };
}

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
    console.log(`
📚 Laravel Blade Visualizer - ドキュメント監視ツール

使用方法:
  node scripts/docs-watcher.js [オプション]

オプション:
  --help, -h     このヘルプメッセージを表示
  --once         一度だけドキュメントを生成して終了
  --debug        デバッグ情報を表示

例:
  node scripts/docs-watcher.js          # 監視モードで開始
  node scripts/docs-watcher.js --once   # 一度だけ生成
  npm run docs:watch                    # npmスクリプト経由で実行
`);
}

/**
 * メイン処理
 */
async function main() {
    const args = process.argv.slice(2);

    // ヘルプ表示
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }

    // 一度だけ実行モード
    if (args.includes('--once')) {
        console.log('📚 ドキュメントを一度だけ生成します...');
        try {
            await generateDocumentation();
            console.log('✅ ドキュメント生成が完了しました');
        } catch (error) {
            console.error('❌ ドキュメント生成中にエラーが発生しました:', error);
            process.exit(1);
        }
        return;
    }

    // 拡張版モード
    if (args.includes('--enhanced')) {
        console.log('📚 拡張版ドキュメントを一度だけ生成します...');
        try {
            const { generateEnhancedDocumentation } = require('./docs-generator-enhanced');
            await generateEnhancedDocumentation();
            console.log('✅ 拡張版ドキュメント生成が完了しました');
        } catch (error) {
            console.error('❌ 拡張版ドキュメント生成中にエラーが発生しました:', error);
            process.exit(1);
        }
        return;
    }

    // デバッグモード
    if (args.includes('--debug')) {
        console.log('🐛 デバッグモードで実行中...');
        console.log('監視設定:', JSON.stringify(WATCH_CONFIG, null, 2));
    }

    // 監視モードで開始
    startWatching();
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

module.exports = {
    startWatching,
    DebouncedDocumentationUpdater,
    FileChangeHandler,
    WATCH_CONFIG
}; 

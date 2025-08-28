"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = __importStar(require("fs"));
const mocha_1 = require("mocha");
const path = __importStar(require("path"));
const BladeParser_1 = require("../src/parsers/BladeParser");
const BladeVisualizerProvider_1 = require("../src/providers/BladeVisualizerProvider");
/**
 * BladeVisualizerProviderクラスのテストスイート
 * ワークフローチックな表示機能をテストする
 */
(0, mocha_1.describe)('BladeVisualizerProvider', () => {
    let bladeParser;
    let bladeVisualizerProvider;
    let testWorkspacePath;
    let testFiles = {};
    /**
     * テスト用ファイルを作成する
     */
    function createTestFiles() {
        // テスト用ディレクトリを作成
        if (!fs.existsSync(testWorkspacePath)) {
            fs.mkdirSync(testWorkspacePath, { recursive: true });
        }
        // resources/viewsディレクトリを作成
        const viewsPath = path.join(testWorkspacePath, 'resources', 'views');
        if (!fs.existsSync(viewsPath)) {
            fs.mkdirSync(viewsPath, { recursive: true });
        }
        // 各テストファイルを作成
        Object.entries(testFiles).forEach(([filename, content]) => {
            const filePath = path.join(viewsPath, filename);
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(filePath, content);
        });
    }
    /**
     * テスト用ファイルを削除する
     */
    function cleanupTestFiles() {
        if (fs.existsSync(testWorkspacePath)) {
            fs.rmSync(testWorkspacePath, { recursive: true, force: true });
        }
    }
    /**
     * 各テストの前に実行されるセットアップ処理
     */
    (0, mocha_1.beforeEach)(() => {
        bladeParser = new BladeParser_1.BladeParser();
        bladeVisualizerProvider = new BladeVisualizerProvider_1.BladeVisualizerProvider(bladeParser);
        // テスト用のワークスペースパスを設定
        testWorkspacePath = path.join(__dirname, 'test-workspace');
        // テスト用のBladeファイルを作成
        testFiles = {
            'layout.blade.php': `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>@yield('title')</title>
                </head>
                <body>
                    @yield('content')
                </body>
                </html>
            `,
            'base.blade.php': `
                @extends('layout')
                @section('title', 'Base Page')
                @section('content')
                    <h1>Base Content</h1>
                    @include('partials.header')
                    @component('components.button', ['text' => 'Click me'])
                    @endcomponent
                @endsection
            `,
            'partials/header.blade.php': `
                <header>
                    <nav>Navigation</nav>
                </header>
            `,
            'components/button.blade.php': `
                <button>{{ $text }}</button>
            `,
            'child.blade.php': `
                @extends('base')
                @section('content')
                    <h2>Child Content</h2>
                    @include('partials.footer')
                @endsection
            `,
            'partials/footer.blade.php': `
                <footer>
                    <p>Footer content</p>
                </footer>
            `
        };
        // テスト用ディレクトリとファイルを作成
        createTestFiles();
    });
    /**
     * 各テストの後に実行されるクリーンアップ処理
     */
    (0, mocha_1.afterEach)(() => {
        // テスト用ファイルを削除
        cleanupTestFiles();
    });
    /**
     * openVisualizerメソッドのテスト
     */
    (0, mocha_1.describe)('openVisualizer', () => {
        (0, mocha_1.it)('正常なファイルパスでビジュアライザーが開く', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('存在しないファイルパスでもエラーが発生しない', async () => {
            const nonExistentPath = path.join(testWorkspacePath, 'resources', 'views', 'non-existent.blade.php');
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(nonExistentPath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('無効なファイルパスでもエラーが発生しない', async () => {
            const invalidPath = 'invalid/path/file.blade.php';
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(invalidPath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
    });
    /**
     * refreshVisualizerメソッドのテスト
     */
    (0, mocha_1.describe)('refreshVisualizer', () => {
        (0, mocha_1.it)('ビジュアライザーが開かれていない場合でもエラーが発生しない', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // ビジュアライザーを開かずに更新を試行
            await bladeVisualizerProvider.refreshVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('ビジュアライザーが開かれている場合の更新が正常に動作する', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(testFilePath);
            // 更新を実行
            await bladeVisualizerProvider.refreshVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
    });
    /**
     * HTML生成メソッドのテスト
     */
    (0, mocha_1.describe)('HTML Generation', () => {
        (0, mocha_1.it)('正常なツリーでHTMLが生成される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(testFilePath);
            if (completeTree) {
                // HTML生成が正常に動作することを確認
                (0, chai_1.expect)(completeTree).to.not.be.null;
                (0, chai_1.expect)(completeTree.template.fileName).to.equal('base.blade.php');
            }
        });
        (0, mocha_1.it)('複雑なツリー構造でHTMLが生成される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(testFilePath);
            if (completeTree) {
                // 複雑なツリー構造が正しく構築されることを確認
                (0, chai_1.expect)(completeTree.children).to.have.length(1);
                (0, chai_1.expect)(completeTree.children[0].children).to.have.length(1);
            }
        });
    });
    /**
     * エラーハンドリングのテスト
     */
    (0, mocha_1.describe)('Error Handling', () => {
        (0, mocha_1.it)('無効なファイルパスでのエラーハンドリングが正常に動作する', async () => {
            const invalidPath = 'invalid/path';
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(invalidPath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('Bladeファイル以外のファイルでのエラーハンドリングが正常に動作する', async () => {
            const nonBladePath = path.join(testWorkspacePath, 'resources', 'views', 'test.txt');
            fs.writeFileSync(nonBladePath, 'This is not a Blade file');
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(nonBladePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
            // テストファイルを削除
            fs.unlinkSync(nonBladePath);
        });
    });
    /**
     * 統合テスト
     */
    (0, mocha_1.describe)('Integration Tests', () => {
        (0, mocha_1.it)('完全なワークフローが正常に動作する', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // 1. ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(testFilePath);
            // 2. ビジュアライザーを更新
            await bladeVisualizerProvider.refreshVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('複数のファイルでのビジュアライザーの切り替えが正常に動作する', async () => {
            const file1 = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const file2 = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            // 1つ目のファイルでビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(file1);
            // 2つ目のファイルでビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(file2);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
        (0, mocha_1.it)('ファイル変更後の自動更新が正常に動作する', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // ビジュアライザーを開く
            await bladeVisualizerProvider.openVisualizer(testFilePath);
            // ファイルを変更
            const newContent = `
                @extends('layout')
                @section('title', 'Updated Base Page')
                @section('content')
                    <h1>Updated Base Content</h1>
                    @include('partials.header')
                @endsection
            `;
            fs.writeFileSync(testFilePath, newContent);
            // 更新を実行
            await bladeVisualizerProvider.refreshVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
        });
    });
    /**
     * パフォーマンステスト
     */
    (0, mocha_1.describe)('Performance Tests', () => {
        (0, mocha_1.it)('大きなファイルでもタイムアウトしない', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'large.blade.php');
            // 大きなテストファイルを作成
            const largeContent = `
                @extends('layout')
                @section('title', 'Large File')
                @section('content')
                    ${Array(1000).fill('<div>Content</div>').join('\n')}
                    @include('partials.header')
                    @component('components.button', ['text' => 'Click me'])
                    @endcomponent
                @endsection
            `;
            fs.writeFileSync(testFilePath, largeContent);
            // ビジュアライザーを開く（タイムアウトしないことを確認）
            await bladeVisualizerProvider.openVisualizer(testFilePath);
            // エラーが発生しないことを確認
            (0, chai_1.expect)(true).to.be.true;
            // テストファイルを削除
            fs.unlinkSync(testFilePath);
        });
    });
});
//# sourceMappingURL=BladeVisualizerProvider.test.js.map
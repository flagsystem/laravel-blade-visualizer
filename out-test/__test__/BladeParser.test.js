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
/**
 * BladeParserクラスのテストスイート
 * 新しく追加された完全なツリー構築機能をテストする
 */
(0, mocha_1.describe)('BladeParser', () => {
    let bladeParser;
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
     * buildCompleteTreeメソッドのテスト
     */
    (0, mocha_1.describe)('buildCompleteTree', () => {
        (0, mocha_1.it)('選択中のファイルの完全なツリーを構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            (0, chai_1.expect)(completeTree).to.not.be.null;
            (0, chai_1.expect)(completeTree.template.fileName).to.equal('child.blade.php');
            (0, chai_1.expect)(completeTree.type).to.equal('root');
            (0, chai_1.expect)(completeTree.level).to.equal(0);
            (0, chai_1.expect)(completeTree.isSelected).to.be.true;
        });
        (0, mocha_1.it)('継承関係（extends）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            (0, chai_1.expect)(completeTree.children).to.have.length(1);
            const extendsNode = completeTree.children[0];
            (0, chai_1.expect)(extendsNode.type).to.equal('extends');
            (0, chai_1.expect)(extendsNode.template.fileName).to.equal('base.blade.php');
            (0, chai_1.expect)(extendsNode.level).to.equal(1);
        });
        (0, mocha_1.it)('複数レベルの継承関係を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // child -> base -> layout の継承関係を確認
            const baseNode = completeTree.children[0];
            (0, chai_1.expect)(baseNode.children).to.have.length(1);
            const layoutNode = baseNode.children[0];
            (0, chai_1.expect)(layoutNode.type).to.equal('extends');
            (0, chai_1.expect)(layoutNode.template.fileName).to.equal('layout.blade.php');
            (0, chai_1.expect)(layoutNode.level).to.equal(2);
        });
        (0, mocha_1.it)('インクルード関係（include）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // baseファイルのインクルード関係を確認
            const includeNodes = completeTree.children.filter(child => child.type === 'include');
            (0, chai_1.expect)(includeNodes).to.have.length(1);
            (0, chai_1.expect)(includeNodes[0].template.fileName).to.equal('partials/header.blade.php');
        });
        (0, mocha_1.it)('コンポーネント関係（component）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // baseファイルのコンポーネント関係を確認
            const componentNodes = completeTree.children.filter(child => child.type === 'component');
            (0, chai_1.expect)(componentNodes).to.have.length(1);
            (0, chai_1.expect)(componentNodes[0].template.fileName).to.equal('components/button.blade.php');
        });
        (0, mocha_1.it)('存在しないファイルの場合はnullを返す', async () => {
            const nonExistentPath = path.join(testWorkspacePath, 'resources', 'views', 'non-existent.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(nonExistentPath);
            (0, chai_1.expect)(completeTree).to.be.null;
        });
    });
    /**
     * ツリー構造の階層レベルのテスト
     */
    (0, mocha_1.describe)('Tree Level Structure', () => {
        (0, mocha_1.it)('正しい階層レベルが設定される', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // ルートレベル
            (0, chai_1.expect)(completeTree.level).to.equal(0);
            // 第1レベル（base）
            const baseNode = completeTree.children[0];
            (0, chai_1.expect)(baseNode.level).to.equal(1);
            // 第2レベル（layout）
            const layoutNode = baseNode.children[0];
            (0, chai_1.expect)(layoutNode.level).to.equal(2);
        });
        (0, mocha_1.it)('親子関係が正しく設定される', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            const baseNode = completeTree.children[0];
            (0, chai_1.expect)(baseNode.parent).to.equal(completeTree);
            const layoutNode = baseNode.children[0];
            (0, chai_1.expect)(layoutNode.parent).to.equal(baseNode);
        });
    });
    /**
     * 複雑な関係性のテスト
     */
    (0, mocha_1.describe)('Complex Relationships', () => {
        (0, mocha_1.it)('複数のインクルードとコンポーネントを含むツリーを構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // 子要素の総数を確認
            const totalChildren = completeTree.children.length;
            (0, chai_1.expect)(totalChildren).to.be.greaterThan(0);
            // 各タイプの子要素が存在することを確認
            const hasExtends = completeTree.children.some(child => child.type === 'extends');
            const hasInclude = completeTree.children.some(child => child.type === 'include');
            const hasComponent = completeTree.children.some(child => child.type === 'component');
            (0, chai_1.expect)(hasExtends).to.be.true;
            (0, chai_1.expect)(hasInclude).to.be.true;
            (0, chai_1.expect)(hasComponent).to.be.true;
        });
        (0, mocha_1.it)('ネストしたインクルード関係を正しく処理できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);
            // child -> base -> partials/header の関係を確認
            const baseNode = completeTree.children[0];
            const headerNode = baseNode.children.find(child => child.type === 'include' && child.template.fileName.includes('header'));
            (0, chai_1.expect)(headerNode).to.not.be.undefined;
            (0, chai_1.expect)(headerNode.type).to.equal('include');
        });
    });
    /**
     * エラーハンドリングのテスト
     */
    (0, mocha_1.describe)('Error Handling', () => {
        (0, mocha_1.it)('無効なファイルパスの場合はnullを返す', async () => {
            const invalidPath = 'invalid/path/file.blade.php';
            const completeTree = await bladeParser.buildCompleteTree(invalidPath);
            (0, chai_1.expect)(completeTree).to.be.null;
        });
        (0, mocha_1.it)('Bladeファイル以外の場合はnullを返す', async () => {
            const nonBladePath = path.join(testWorkspacePath, 'resources', 'views', 'test.txt');
            fs.writeFileSync(nonBladePath, 'This is not a Blade file');
            const completeTree = await bladeParser.buildCompleteTree(nonBladePath);
            (0, chai_1.expect)(completeTree).to.be.null;
            // テストファイルを削除
            fs.unlinkSync(nonBladePath);
        });
    });
});
//# sourceMappingURL=BladeParser.test.js.map
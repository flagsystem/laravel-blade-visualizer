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
const vscode = __importStar(require("vscode"));
const BladeParser_1 = require("../src/parsers/BladeParser");
const BladeTemplateProvider_1 = require("../src/providers/BladeTemplateProvider");
/**
 * SelectedFileTreeProviderクラスのテストスイート
 * 選択中のファイルの完全なツリーを表示する機能をテストする
 */
(0, mocha_1.describe)('SelectedFileTreeProvider', () => {
    let bladeParser;
    let selectedFileTreeProvider;
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
        selectedFileTreeProvider = new BladeTemplateProvider_1.SelectedFileTreeProvider(bladeParser);
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
                @endsection
            `,
            'partials/header.blade.php': `
                <header>
                    <nav>Navigation</nav>
                </header>
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
     * setSelectedFileメソッドのテスト
     */
    (0, mocha_1.describe)('setSelectedFile', () => {
        (0, mocha_1.it)('選択中のファイルを設定できる', () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            // プライベートプロパティにアクセスできないため、refresh()の動作で確認
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
        (0, mocha_1.it)('ファイルパスが正しく設定される', () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            // refresh()が正常に動作することを確認
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
    });
    /**
     * refreshメソッドのテスト
     */
    (0, mocha_1.describe)('refresh', () => {
        (0, mocha_1.it)('ツリーデータの更新が正常に動作する', () => {
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
        (0, mocha_1.it)('複数回の更新が正常に動作する', () => {
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
    });
    /**
     * getTreeItemメソッドのテスト
     */
    (0, mocha_1.describe)('getTreeItem', () => {
        (0, mocha_1.it)('選択中のファイルのツリーアイテムが正しく生成される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            const children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children).to.have.length(1);
            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);
            (0, chai_1.expect)(treeItem).to.be.instanceOf(vscode.TreeItem);
        });
        (0, mocha_1.it)('ツリーアイテムのラベルが正しく設定される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            const children = await selectedFileTreeProvider.getChildren();
            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);
            (0, chai_1.expect)(treeItem.label).to.include('base.blade.php');
        });
    });
    /**
     * getChildrenメソッドのテスト
     */
    (0, mocha_1.describe)('getChildren', () => {
        (0, mocha_1.it)('ルートレベルの場合、選択中のファイルのツリーが返される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            const children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children).to.have.length(1);
            (0, chai_1.expect)(children[0].template.fileName).to.equal('base.blade.php');
        });
        (0, mocha_1.it)('ファイルが選択されていない場合、空の配列が返される', async () => {
            const children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children).to.have.length(0);
        });
        (0, mocha_1.it)('子レベルの場合、子要素が返される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            const rootChildren = await selectedFileTreeProvider.getChildren();
            const rootItem = rootChildren[0];
            const childChildren = await selectedFileTreeProvider.getChildren(rootItem);
            (0, chai_1.expect)(childChildren).to.be.an('array');
        });
    });
    /**
     * エラーハンドリングのテスト
     */
    (0, mocha_1.describe)('Error Handling', () => {
        (0, mocha_1.it)('存在しないファイルパスでもエラーが発生しない', () => {
            const nonExistentPath = '/non/existent/path/file.blade.php';
            (0, chai_1.expect)(() => selectedFileTreeProvider.setSelectedFile(nonExistentPath)).to.not.throw();
        });
        (0, mocha_1.it)('無効なファイルパスでもエラーが発生しない', () => {
            const invalidPath = 'invalid/path';
            (0, chai_1.expect)(() => selectedFileTreeProvider.setSelectedFile(invalidPath)).to.not.throw();
        });
    });
    /**
     * 統合テスト
     */
    (0, mocha_1.describe)('Integration Tests', () => {
        (0, mocha_1.it)('完全なワークフローが正常に動作する', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            // 1. ファイルを選択
            selectedFileTreeProvider.setSelectedFile(testFilePath);
            // 2. ツリーを取得
            const children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children).to.have.length(1);
            // 3. ツリーアイテムを生成
            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);
            (0, chai_1.expect)(treeItem).to.be.instanceOf(vscode.TreeItem);
            // 4. 更新
            (0, chai_1.expect)(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
        (0, mocha_1.it)('複数のファイルの切り替えが正常に動作する', async () => {
            const file1 = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const file2 = path.join(testWorkspacePath, 'resources', 'views', 'layout.blade.php');
            // 1つ目のファイルを選択
            selectedFileTreeProvider.setSelectedFile(file1);
            let children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children[0].template.fileName).to.equal('base.blade.php');
            // 2つ目のファイルに切り替え
            selectedFileTreeProvider.setSelectedFile(file2);
            children = await selectedFileTreeProvider.getChildren();
            (0, chai_1.expect)(children[0].template.fileName).to.equal('layout.blade.php');
        });
    });
});
//# sourceMappingURL=SelectedFileTreeProvider.test.js.map
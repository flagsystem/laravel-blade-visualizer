import { expect } from 'chai';
import * as fs from 'fs';
import { afterEach, beforeEach, describe, it } from 'mocha';
import * as path from 'path';
import * as vscode from 'vscode';
import { BladeParser } from '../src/parsers/BladeParser';
import { SelectedFileTreeProvider } from '../src/providers/BladeTemplateProvider';

/**
 * SelectedFileTreeProviderクラスのテストスイート
 * 選択中のファイルの完全なツリーを表示する機能をテストする
 */
describe('SelectedFileTreeProvider', () => {
    let bladeParser: BladeParser;
    let selectedFileTreeProvider: SelectedFileTreeProvider;
    let testWorkspacePath: string;
    let testFiles: { [key: string]: string } = {};

    /**
     * テスト用ファイルを作成する
     */
    function createTestFiles(): void {
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
    function cleanupTestFiles(): void {
        if (fs.existsSync(testWorkspacePath)) {
            fs.rmSync(testWorkspacePath, { recursive: true, force: true });
        }
    }

    /**
     * 各テストの前に実行されるセットアップ処理
     */
    beforeEach(() => {
        bladeParser = new BladeParser();
        selectedFileTreeProvider = new SelectedFileTreeProvider(bladeParser);

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
    afterEach(() => {
        // テスト用ファイルを削除
        cleanupTestFiles();
    });

    /**
     * setSelectedFileメソッドのテスト
     */
    describe('setSelectedFile', () => {
        it('選択中のファイルを設定できる', () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            // プライベートプロパティにアクセスできないため、refresh()の動作で確認
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });

        it('ファイルパスが正しく設定される', () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            // refresh()が正常に動作することを確認
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
    });

    /**
     * refreshメソッドのテスト
     */
    describe('refresh', () => {
        it('ツリーデータの更新が正常に動作する', () => {
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });

        it('複数回の更新が正常に動作する', () => {
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });
    });

    /**
     * getTreeItemメソッドのテスト
     */
    describe('getTreeItem', () => {
        it('選択中のファイルのツリーアイテムが正しく生成される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            const children = await selectedFileTreeProvider.getChildren();
            expect(children).to.have.length(1);

            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);
            expect(treeItem).to.be.instanceOf(vscode.TreeItem);
        });

        it('ツリーアイテムのラベルが正しく設定される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            const children = await selectedFileTreeProvider.getChildren();
            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);

            expect(treeItem.label).to.include('base.blade.php');
        });
    });

    /**
     * getChildrenメソッドのテスト
     */
    describe('getChildren', () => {
        it('ルートレベルの場合、選択中のファイルのツリーが返される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            const children = await selectedFileTreeProvider.getChildren();
            expect(children).to.have.length(1);
            expect(children[0].template.fileName).to.equal('base.blade.php');
        });

        it('ファイルが選択されていない場合、空の配列が返される', async () => {
            const children = await selectedFileTreeProvider.getChildren();
            expect(children).to.have.length(0);
        });

        it('子レベルの場合、子要素が返される', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            const rootChildren = await selectedFileTreeProvider.getChildren();
            const rootItem = rootChildren[0];

            const childChildren = await selectedFileTreeProvider.getChildren(rootItem);
            expect(childChildren).to.be.an('array');
        });
    });

    /**
     * エラーハンドリングのテスト
     */
    describe('Error Handling', () => {
        it('存在しないファイルパスでもエラーが発生しない', () => {
            const nonExistentPath = '/non/existent/path/file.blade.php';
            expect(() => selectedFileTreeProvider.setSelectedFile(nonExistentPath)).to.not.throw();
        });

        it('無効なファイルパスでもエラーが発生しない', () => {
            const invalidPath = 'invalid/path';
            expect(() => selectedFileTreeProvider.setSelectedFile(invalidPath)).to.not.throw();
        });
    });

    /**
     * 統合テスト
     */
    describe('Integration Tests', () => {
        it('完全なワークフローが正常に動作する', async () => {
            const testFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');

            // 1. ファイルを選択
            selectedFileTreeProvider.setSelectedFile(testFilePath);

            // 2. ツリーを取得
            const children = await selectedFileTreeProvider.getChildren();
            expect(children).to.have.length(1);

            // 3. ツリーアイテムを生成
            const treeItem = selectedFileTreeProvider.getTreeItem(children[0]);
            expect(treeItem).to.be.instanceOf(vscode.TreeItem);

            // 4. 更新
            expect(() => selectedFileTreeProvider.refresh()).to.not.throw();
        });

        it('複数のファイルの切り替えが正常に動作する', async () => {
            const file1 = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const file2 = path.join(testWorkspacePath, 'resources', 'views', 'layout.blade.php');

            // 1つ目のファイルを選択
            selectedFileTreeProvider.setSelectedFile(file1);
            let children = await selectedFileTreeProvider.getChildren();
            expect(children[0].template.fileName).to.equal('base.blade.php');

            // 2つ目のファイルに切り替え
            selectedFileTreeProvider.setSelectedFile(file2);
            children = await selectedFileTreeProvider.getChildren();
            expect(children[0].template.fileName).to.equal('layout.blade.php');
        });
    });
}); 

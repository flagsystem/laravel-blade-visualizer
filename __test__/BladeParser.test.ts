import { expect } from 'chai';
import * as fs from 'fs';
import { afterEach, beforeEach, describe, it } from 'mocha';
import * as path from 'path';
import { BladeParser } from '../src/parsers/BladeParser';

/**
 * BladeParserクラスのテストスイート
 * 新しく追加された完全なツリー構築機能をテストする
 */
describe('BladeParser', () => {
    let bladeParser: BladeParser;
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
    afterEach(() => {
        // テスト用ファイルを削除
        cleanupTestFiles();
    });

    /**
     * buildCompleteTreeメソッドのテスト
     */
    describe('buildCompleteTree', () => {
        it('選択中のファイルの完全なツリーを構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            expect(completeTree).to.not.be.null;
            expect(completeTree!.template.fileName).to.equal('child.blade.php');
            expect(completeTree!.type).to.equal('root');
            expect(completeTree!.level).to.equal(0);
            expect(completeTree!.isSelected).to.be.true;
        });

        it('継承関係（extends）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            expect(completeTree!.children).to.have.length(1);
            const extendsNode = completeTree!.children[0];
            expect(extendsNode.type).to.equal('extends');
            expect(extendsNode.template.fileName).to.equal('base.blade.php');
            expect(extendsNode.level).to.equal(1);
        });

        it('複数レベルの継承関係を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // child -> base -> layout の継承関係を確認
            const baseNode = completeTree!.children[0];
            expect(baseNode.children).to.have.length(1);
            const layoutNode = baseNode.children[0];
            expect(layoutNode.type).to.equal('extends');
            expect(layoutNode.template.fileName).to.equal('layout.blade.php');
            expect(layoutNode.level).to.equal(2);
        });

        it('インクルード関係（include）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // baseファイルのインクルード関係を確認
            const includeNodes = completeTree!.children.filter(child => child.type === 'include');
            expect(includeNodes).to.have.length(1);
            expect(includeNodes[0].template.fileName).to.equal('partials/header.blade.php');
        });

        it('コンポーネント関係（component）を正しく構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // baseファイルのコンポーネント関係を確認
            const componentNodes = completeTree!.children.filter(child => child.type === 'component');
            expect(componentNodes).to.have.length(1);
            expect(componentNodes[0].template.fileName).to.equal('components/button.blade.php');
        });

        it('存在しないファイルの場合はnullを返す', async () => {
            const nonExistentPath = path.join(testWorkspacePath, 'resources', 'views', 'non-existent.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(nonExistentPath);

            expect(completeTree).to.be.null;
        });
    });

    /**
     * ツリー構造の階層レベルのテスト
     */
    describe('Tree Level Structure', () => {
        it('正しい階層レベルが設定される', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // ルートレベル
            expect(completeTree!.level).to.equal(0);

            // 第1レベル（base）
            const baseNode = completeTree!.children[0];
            expect(baseNode.level).to.equal(1);

            // 第2レベル（layout）
            const layoutNode = baseNode.children[0];
            expect(layoutNode.level).to.equal(2);
        });

        it('親子関係が正しく設定される', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            const baseNode = completeTree!.children[0];
            expect(baseNode.parent).to.equal(completeTree);

            const layoutNode = baseNode.children[0];
            expect(layoutNode.parent).to.equal(baseNode);
        });
    });

    /**
     * 複雑な関係性のテスト
     */
    describe('Complex Relationships', () => {
        it('複数のインクルードとコンポーネントを含むツリーを構築できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'base.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // 子要素の総数を確認
            const totalChildren = completeTree!.children.length;
            expect(totalChildren).to.be.greaterThan(0);

            // 各タイプの子要素が存在することを確認
            const hasExtends = completeTree!.children.some(child => child.type === 'extends');
            const hasInclude = completeTree!.children.some(child => child.type === 'include');
            const hasComponent = completeTree!.children.some(child => child.type === 'component');

            expect(hasExtends).to.be.true;
            expect(hasInclude).to.be.true;
            expect(hasComponent).to.be.true;
        });

        it('ネストしたインクルード関係を正しく処理できる', async () => {
            const selectedFilePath = path.join(testWorkspacePath, 'resources', 'views', 'child.blade.php');
            const completeTree = await bladeParser.buildCompleteTree(selectedFilePath);

            // child -> base -> partials/header の関係を確認
            const baseNode = completeTree!.children[0];
            const headerNode = baseNode.children.find(child =>
                child.type === 'include' && child.template.fileName.includes('header')
            );

            expect(headerNode).to.not.be.undefined;
            expect(headerNode!.type).to.equal('include');
        });
    });

    /**
     * エラーハンドリングのテスト
     */
    describe('Error Handling', () => {
        it('無効なファイルパスの場合はnullを返す', async () => {
            const invalidPath = 'invalid/path/file.blade.php';
            const completeTree = await bladeParser.buildCompleteTree(invalidPath);

            expect(completeTree).to.be.null;
        });

        it('Bladeファイル以外の場合はnullを返す', async () => {
            const nonBladePath = path.join(testWorkspacePath, 'resources', 'views', 'test.txt');
            fs.writeFileSync(nonBladePath, 'This is not a Blade file');

            const completeTree = await bladeParser.buildCompleteTree(nonBladePath);
            expect(completeTree).to.be.null;

            // テストファイルを削除
            fs.unlinkSync(nonBladePath);
        });
    });
}); 

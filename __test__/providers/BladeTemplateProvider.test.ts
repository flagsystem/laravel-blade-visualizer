import * as assert from 'assert';
import * as vscode from 'vscode';
import { BladeParser, BladeTemplate } from '../../src/parsers/BladeParser';
import { BladeTemplateItem, BladeTemplateProvider } from '../../src/providers/BladeTemplateProvider';

/**
 * BladeTemplateProviderクラスのテストスイート
 * Bladeテンプレートのツリービュー表示とファイルジャンプ機能をテストする
 */
describe('BladeTemplateProvider', () => {
    let bladeParser: BladeParser;
    let bladeTemplateProvider: BladeTemplateProvider;

    /**
     * 各テストの前に実行されるセットアップ処理
     */
    beforeEach(() => {
        bladeParser = new BladeParser();
        bladeTemplateProvider = new BladeTemplateProvider(bladeParser);
    });

    describe('正常系', () => {
        it('testツリーデータプロバイダーの初期化が正常に動作する', () => {
            assert.ok(bladeTemplateProvider);
            assert.ok(bladeTemplateProvider.onDidChangeTreeData);
        });

        it('testrefreshメソッドが正常に動作する', () => {
            // refreshメソッドがエラーを投げないことを確認
            assert.doesNotThrow(() => {
                bladeTemplateProvider.refresh();
            });
        });

        it('testgetTreeItemメソッドが正常に動作する', () => {
            const mockTemplate: BladeTemplate = {
                filePath: '/test/path/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            const treeItem = new BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.Collapsed);
            const result = bladeTemplateProvider.getTreeItem(treeItem);

            assert.ok(result);
            assert.strictEqual(result.label, 'test.blade.php');
        });
    });

    describe('ファイルパス解決機能', () => {
        it('testextendsディレクティブで解決されたファイルパスが正しく表示される', async () => {
            // BladeParserのfindBladeFilesとparseBladeFileをモック化
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                extends: 'layouts.app',
                extendsPath: '/workspace/resources/views/layouts/app.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            bladeParser.findBladeFiles = async () => mockBladeFiles;
            bladeParser.parseBladeFile = async () => mockTemplate;

            const children = await bladeTemplateProvider.getChildren();
            assert.strictEqual(children.length, 1);

            const templateItem = children[0];
            const templateChildren = await bladeTemplateProvider.getChildren(templateItem);

            // extendsディレクティブの子アイテムが存在することを確認
            const extendsItem = templateChildren.find(item => item.type === 'extends');
            assert.ok(extendsItem);
            assert.strictEqual(extendsItem.template.filePath, '/workspace/resources/views/layouts/app.blade.php');
            assert.ok(extendsItem.command); // ファイルを開くコマンドが設定されている
        });

        it('testincludeディレクティブで解決されたファイルパスが正しく表示される', async () => {
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: ['partials.header'],
                includePaths: ['/workspace/resources/views/partials/header.blade.php'],
                components: [],
                componentPaths: [],
                sections: []
            };

            bladeParser.findBladeFiles = async () => mockBladeFiles;
            bladeParser.parseBladeFile = async () => mockTemplate;

            const children = await bladeTemplateProvider.getChildren();
            const templateItem = children[0];
            const templateChildren = await bladeTemplateProvider.getChildren(templateItem);

            // includeディレクティブの子アイテムが存在することを確認
            const includeItem = templateChildren.find(item => item.type === 'include');
            assert.ok(includeItem);
            assert.strictEqual(includeItem.template.filePath, '/workspace/resources/views/partials/header.blade.php');
            assert.ok(includeItem.command); // ファイルを開くコマンドが設定されている
        });

        it('testcomponentディレクティブで解決されたファイルパスが正しく表示される', async () => {
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                includePaths: [],
                components: ['components.alert'],
                componentPaths: ['/workspace/resources/views/components/alert.blade.php'],
                sections: []
            };

            bladeParser.findBladeFiles = async () => mockBladeFiles;
            bladeParser.parseBladeFile = async () => mockTemplate;

            const children = await bladeTemplateProvider.getChildren();
            const templateItem = children[0];
            const templateChildren = await bladeTemplateProvider.getChildren(templateItem);

            // componentディレクティブの子アイテムが存在することを確認
            const componentItem = templateChildren.find(item => item.type === 'component');
            assert.ok(componentItem);
            assert.strictEqual(componentItem.template.filePath, '/workspace/resources/views/components/alert.blade.php');
            assert.ok(componentItem.command); // ファイルを開くコマンドが設定されている
        });
    });

    describe('ファイルジャンプ機能', () => {
        it('test絶対パスの場合にファイルを開くコマンドが設定される', () => {
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/layouts/app.blade.php',
                fileName: 'app.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            const treeItem = new BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.None, 'extends');

            assert.ok(treeItem.command);
            assert.strictEqual(treeItem.command.command, 'vscode.open');
            assert.ok(treeItem.command.arguments);
            assert.strictEqual(treeItem.command.arguments[0].fsPath, '/workspace/resources/views/layouts/app.blade.php');
        });

        it('test相対パスの場合にファイルを開くコマンドが設定されない', () => {
            const mockTemplate: BladeTemplate = {
                filePath: 'layouts.app',
                fileName: 'app.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            const treeItem = new BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.None, 'extends');

            assert.strictEqual(treeItem.command, undefined);
            const tooltip = treeItem.tooltip;
            const description = treeItem.description;
            if (typeof tooltip === 'string') {
                assert.ok(tooltip.includes('⚠️ ファイルが見つかりません'));
            }
            if (typeof description === 'string') {
                assert.ok(description.includes('(not found)'));
            }
        });
    });

    describe('異常系', () => {
        it('testBladeParserでエラーが発生した場合に適切に処理される', async () => {
            // findBladeFilesでエラーを発生させる
            bladeParser.findBladeFiles = async () => {
                throw new Error('Parser error');
            };

            try {
                const children = await bladeTemplateProvider.getChildren();
                assert.deepStrictEqual(children, []);
            } catch (error) {
                // エラーが適切に処理されることを確認
                assert.ok(error instanceof Error);
            }
        });

        it('testparseBladeFileでエラーが発生した場合に適切に処理される', async () => {
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            bladeParser.findBladeFiles = async () => mockBladeFiles;
            bladeParser.parseBladeFile = async () => null; // nullを返す

            const children = await bladeTemplateProvider.getChildren();
            assert.deepStrictEqual(children, []);
        });
    });

    describe('境界値テスト', () => {
        it('test空のBladeファイルリストが正常に処理される', async () => {
            bladeParser.findBladeFiles = async () => [];

            const children = await bladeTemplateProvider.getChildren();
            assert.deepStrictEqual(children, []);
        });

        it('test大量のBladeファイルが正常に処理される', async () => {
            const mockBladeFiles = Array.from({ length: 100 }, (_, i) => `/workspace/resources/views/file${i}.blade.php`);
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            bladeParser.findBladeFiles = async () => mockBladeFiles;
            bladeParser.parseBladeFile = async () => mockTemplate;

            const children = await bladeTemplateProvider.getChildren();
            assert.strictEqual(children.length, 100);
        });
    });
}); 

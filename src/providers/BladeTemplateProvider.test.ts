import * as assert from 'assert';
import * as vscode from 'vscode';
import { BladeParser, BladeTemplate } from '../parsers/BladeParser';
import { BladeTemplateItem, BladeTemplateProvider } from './BladeTemplateProvider';

/**
 * BladeTemplateProviderクラスのテストスイート
 * VSCodeのツリービューにBladeテンプレートの親子関係を表示する機能をテストする
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
        it('testルートレベルの子要素が正常に取得される', async () => {
            // BladeParserのfindBladeFilesメソッドをモック化
            const mockBladeFiles = [
                '/workspace/resources/views/layouts/app.blade.php',
                '/workspace/resources/views/pages/home.blade.php',
                '/workspace/resources/views/partials/header.blade.php'
            ];

            const originalFindBladeFiles = bladeParser.findBladeFiles;
            bladeParser.findBladeFiles = async () => mockBladeFiles;

            // parseBladeFileメソッドをモック化
            const mockTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/layouts/app.blade.php',
                fileName: 'app.blade.php',
                includes: ['partials.header'],
                components: ['components.alert'],
                sections: ['content']
            };

            bladeParser.parseBladeFile = async () => mockTemplate;

            try {
                const children = await bladeTemplateProvider.getChildren();

                assert.ok(children);
                assert.strictEqual(children.length, 3);
                assert.ok(children[0] instanceof BladeTemplateItem);
                assert.strictEqual(children[0].template.fileName, 'app.blade.php');
            } finally {
                // モックを元に戻す
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });

        it('test子レベルの親子関係が正常に表示される', async () => {
            // 親テンプレートアイテムを作成
            const parentTemplate: BladeTemplate = {
                filePath: '/workspace/resources/views/layouts/app.blade.php',
                fileName: 'app.blade.php',
                extends: 'layouts.master',
                includes: ['partials.header', 'partials.footer'],
                components: ['components.alert', 'components.button'],
                sections: ['content', 'sidebar']
            };

            const parentItem = new BladeTemplateItem(
                parentTemplate,
                vscode.TreeItemCollapsibleState.Expanded
            );

            const children = await bladeTemplateProvider.getChildren(parentItem);

            assert.ok(children);
            // extends + includes + components の数
            assert.strictEqual(children.length, 1 + 2 + 2);

            // extends関係の確認
            const extendsItem = children.find(item => item.type === 'extends');
            assert.ok(extendsItem);
            assert.strictEqual(extendsItem.template.fileName, 'Extends: layouts.master');

            // includes関係の確認
            const includeItems = children.filter(item => item.type === 'include');
            assert.strictEqual(includeItems.length, 2);

            // components関係の確認
            const componentItems = children.filter(item => item.type === 'component');
            assert.strictEqual(componentItems.length, 2);
        });

        it('testツリーアイテムの表示設定が正常に設定される', () => {
            const template: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };

            const treeItem = bladeTemplateProvider.getTreeItem(
                new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed)
            );

            assert.ok(treeItem);
            assert.strictEqual(treeItem.label, 'test.blade.php');
            assert.strictEqual(treeItem.collapsibleState, vscode.TreeItemCollapsibleState.Collapsed);
        });

        it('testrefreshメソッドが正常に動作する', () => {
            // refreshメソッドが例外を投げないことを確認
            assert.doesNotThrow(() => {
                bladeTemplateProvider.refresh();
            });
        });
    });

    describe('異常系', () => {
        it('testBladeParserがエラーを投げた場合の処理', async () => {
            // BladeParserのfindBladeFilesメソッドでエラーを発生させる
            const originalFindBladeFiles = bladeParser.findBladeFiles;
            bladeParser.findBladeFiles = async () => {
                throw new Error('Parser error');
            };

            try {
                const children = await bladeTemplateProvider.getChildren();
                // エラーが発生しても空配列が返されることを確認
                assert.deepStrictEqual(children, []);
            } finally {
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });

        it('testparseBladeFileがnullを返した場合の処理', async () => {
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            const originalFindBladeFiles = bladeParser.findBladeFiles;
            bladeParser.findBladeFiles = async () => mockBladeFiles;

            // parseBladeFileがnullを返すようにモック化
            bladeParser.parseBladeFile = async () => null;

            try {
                const children = await bladeTemplateProvider.getChildren();
                // nullが返された場合は空配列になることを確認
                assert.deepStrictEqual(children, []);
            } finally {
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });
    });

    describe('BladeTemplateItem', () => {
        it('testテンプレートアイテムが正常に作成される', () => {
            const template: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);

            assert.ok(item);
            assert.strictEqual(item.template, template);
            assert.strictEqual(item.type, 'template');
            assert.strictEqual(item.label, 'test.blade.php');
        });

        it('testextendsタイプのアイテムが正しいアイコンを持つ', () => {
            const template: BladeTemplate = {
                filePath: 'layouts.master',
                fileName: 'Extends: layouts.master',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(
                template,
                vscode.TreeItemCollapsibleState.None,
                'extends'
            );

            assert.ok(item.iconPath);
            // アイコンが正しく設定されていることを確認（実際のアイコンオブジェクトの型チェック）
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });

        it('testincludeタイプのアイテムが正しいアイコンを持つ', () => {
            const template: BladeTemplate = {
                filePath: 'partials.header',
                fileName: 'Include: partials.header',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(
                template,
                vscode.TreeItemCollapsibleState.None,
                'include'
            );

            assert.ok(item.iconPath);
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });

        it('testcomponentタイプのアイテムが正しいアイコンを持つ', () => {
            const template: BladeTemplate = {
                filePath: 'components.alert',
                fileName: 'Component: components.alert',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(
                template,
                vscode.TreeItemCollapsibleState.None,
                'component'
            );

            assert.ok(item.iconPath);
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });

        it('testファイルを開くコマンドが正しく設定される', () => {
            const template: BladeTemplate = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);

            assert.ok(item.command);
            assert.strictEqual(item.command.command, 'vscode.open');
            assert.strictEqual(item.command.title, 'Open File');
            assert.ok(item.command.arguments);
            assert.strictEqual(item.command.arguments.length, 1);
        });
    });

    describe('境界値テスト', () => {
        it('test空のテンプレート配列が正常に処理される', async () => {
            const originalFindBladeFiles = bladeParser.findBladeFiles;
            bladeParser.findBladeFiles = async () => [];

            try {
                const children = await bladeTemplateProvider.getChildren();
                assert.deepStrictEqual(children, []);
            } finally {
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });

        it('test非常に長いファイルパスが正常に処理される', () => {
            const longPath = '/workspace/' + 'a'.repeat(1000) + '/test.blade.php';
            const template: BladeTemplate = {
                filePath: longPath,
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };

            const item = new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);

            assert.ok(item);
            assert.strictEqual(item.tooltip, longPath);
            assert.strictEqual(item.description, longPath);
        });
    });
}); 

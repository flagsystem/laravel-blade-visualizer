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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const BladeParser_1 = require("../../src/parsers/BladeParser");
const BladeTemplateProvider_1 = require("../../src/providers/BladeTemplateProvider");
/**
 * BladeTemplateProviderクラスのテストスイート
 * VSCodeのツリービューにBladeテンプレートの親子関係を表示する機能をテストする
 */
describe('BladeTemplateProvider', () => {
    let bladeParser;
    let bladeTemplateProvider;
    /**
     * 各テストの前に実行されるセットアップ処理
     */
    beforeEach(() => {
        bladeParser = new BladeParser_1.BladeParser();
        bladeTemplateProvider = new BladeTemplateProvider_1.BladeTemplateProvider(bladeParser);
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
            const mockTemplate = {
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
                assert.ok(children[0] instanceof BladeTemplateProvider_1.BladeTemplateItem);
                assert.strictEqual(children[0].template.fileName, 'app.blade.php');
            }
            finally {
                // モックを元に戻す
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });
        it('test子レベルの親子関係が正常に表示される', async () => {
            // 親テンプレートアイテムを作成
            const parentTemplate = {
                filePath: '/workspace/resources/views/layouts/app.blade.php',
                fileName: 'app.blade.php',
                extends: 'layouts.master',
                includes: ['partials.header', 'partials.footer'],
                components: ['components.alert', 'components.button'],
                sections: ['content', 'sidebar']
            };
            const parentItem = new BladeTemplateProvider_1.BladeTemplateItem(parentTemplate, vscode.TreeItemCollapsibleState.Expanded);
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
            const template = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };
            const treeItem = bladeTemplateProvider.getTreeItem(new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed));
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
            }
            finally {
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
            }
            finally {
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });
    });
    describe('BladeTemplateItem', () => {
        it('testテンプレートアイテムが正常に作成される', () => {
            const template = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);
            assert.ok(item);
            assert.strictEqual(item.template, template);
            assert.strictEqual(item.type, 'template');
            assert.strictEqual(item.label, 'test.blade.php');
        });
        it('testextendsタイプのアイテムが正しいアイコンを持つ', () => {
            const template = {
                filePath: 'layouts.master',
                fileName: 'Extends: layouts.master',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.None, 'extends');
            assert.ok(item.iconPath);
            // アイコンが正しく設定されていることを確認（実際のアイコンオブジェクトの型チェック）
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });
        it('testincludeタイプのアイテムが正しいアイコンを持つ', () => {
            const template = {
                filePath: 'partials.header',
                fileName: 'Include: partials.header',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.None, 'include');
            assert.ok(item.iconPath);
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });
        it('testcomponentタイプのアイテムが正しいアイコンを持つ', () => {
            const template = {
                filePath: 'components.alert',
                fileName: 'Component: components.alert',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.None, 'component');
            assert.ok(item.iconPath);
            assert.ok(item.iconPath instanceof vscode.ThemeIcon);
        });
        it('testファイルを開くコマンドが正しく設定される', () => {
            const template = {
                filePath: '/workspace/resources/views/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);
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
            }
            finally {
                bladeParser.findBladeFiles = originalFindBladeFiles;
            }
        });
        it('test非常に長いファイルパスが正常に処理される', () => {
            const longPath = '/workspace/' + 'a'.repeat(1000) + '/test.blade.php';
            const template = {
                filePath: longPath,
                fileName: 'test.blade.php',
                includes: [],
                components: [],
                sections: []
            };
            const item = new BladeTemplateProvider_1.BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed);
            assert.ok(item);
            assert.strictEqual(item.tooltip, longPath);
            assert.strictEqual(item.description, longPath);
        });
    });
});
//# sourceMappingURL=BladeTemplateProvider.test.js.map
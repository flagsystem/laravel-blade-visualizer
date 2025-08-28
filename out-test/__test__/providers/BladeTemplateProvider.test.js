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
 * Bladeテンプレートのツリービュー表示とファイルジャンプ機能をテストする
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
            const mockTemplate = {
                filePath: '/test/path/test.blade.php',
                fileName: 'test.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };
            const treeItem = new BladeTemplateProvider_1.BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.Collapsed);
            const result = bladeTemplateProvider.getTreeItem(treeItem);
            assert.ok(result);
            assert.strictEqual(result.label, 'test.blade.php');
        });
    });
    describe('ファイルパス解決機能', () => {
        it('testextendsディレクティブで解決されたファイルパスが正しく表示される', async () => {
            // BladeParserのfindBladeFilesとparseBladeFileをモック化
            const mockBladeFiles = ['/workspace/resources/views/test.blade.php'];
            const mockTemplate = {
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
            const mockTemplate = {
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
            const mockTemplate = {
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
            const mockTemplate = {
                filePath: '/workspace/resources/views/layouts/app.blade.php',
                fileName: 'app.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };
            const treeItem = new BladeTemplateProvider_1.BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.None, 'extends');
            assert.ok(treeItem.command);
            assert.strictEqual(treeItem.command.command, 'vscode.open');
            assert.ok(treeItem.command.arguments);
            assert.strictEqual(treeItem.command.arguments[0].fsPath, '/workspace/resources/views/layouts/app.blade.php');
        });
        it('test相対パスの場合にファイルを開くコマンドが設定されない', () => {
            const mockTemplate = {
                filePath: 'layouts.app',
                fileName: 'app.blade.php',
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };
            const treeItem = new BladeTemplateProvider_1.BladeTemplateItem(mockTemplate, vscode.TreeItemCollapsibleState.None, 'extends');
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
            }
            catch (error) {
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
            const mockTemplate = {
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
//# sourceMappingURL=BladeTemplateProvider.test.js.map
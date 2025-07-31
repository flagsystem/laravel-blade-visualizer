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
const extension_1 = require("../src/extension");
/**
 * 拡張機能のメインファイルのテストスイート
 * アクティベーションと非アクティベーション機能をテストする
 */
describe('Extension', () => {
    let mockContext;
    /**
     * 各テストの前に実行されるセットアップ処理
     */
    beforeEach(() => {
        // モックコンテキストを作成
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/extension/path',
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve(),
                keys: () => []
            },
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve(),
                keys: () => []
            },
            asAbsolutePath: (relativePath) => `/test/extension/path/${relativePath}`,
            storagePath: '/test/storage/path',
            globalStoragePath: '/test/global/storage/path',
            logPath: '/test/log/path',
            extensionUri: vscode.Uri.file('/test/extension/path'),
            environmentVariableCollection: {},
            extensionMode: vscode.ExtensionMode.Test
        };
    });
    describe('正常系', () => {
        it('test拡張機能が正常にアクティベートされる', () => {
            // アクティベーション関数が例外を投げないことを確認
            assert.doesNotThrow(() => {
                (0, extension_1.activate)(mockContext);
            });
            // コンテキストにサブスクリプションが追加されていることを確認
            assert.ok(mockContext.subscriptions.length > 0);
        });
        it('test拡張機能が正常に非アクティベートされる', () => {
            // 非アクティベーション関数が例外を投げないことを確認
            assert.doesNotThrow(() => {
                (0, extension_1.deactivate)();
            });
        });
        it('testアクティベーション後にコマンドが登録される', () => {
            // 元のコマンド登録関数を保存
            const originalRegisterCommand = vscode.commands.registerCommand;
            let registeredCommands = [];
            // コマンド登録をモック化
            vscode.commands.registerCommand = (command, callback) => {
                registeredCommands.push(command);
                return {
                    dispose: () => { }
                };
            };
            try {
                (0, extension_1.activate)(mockContext);
                // 期待されるコマンドが登録されていることを確認
                assert.ok(registeredCommands.includes('laravel-blade-visualizer.showTree'));
            }
            finally {
                // モックを元に戻す
                vscode.commands.registerCommand = originalRegisterCommand;
            }
        });
        it('testアクティベーション後にツリーデータプロバイダーが登録される', () => {
            // 元のツリーデータプロバイダー登録関数を保存
            const originalRegisterTreeDataProvider = vscode.window.registerTreeDataProvider;
            let registeredProviders = [];
            // ツリーデータプロバイダー登録をモック化
            vscode.window.registerTreeDataProvider = (viewId, provider) => {
                registeredProviders.push(viewId);
                return {
                    dispose: () => { }
                };
            };
            try {
                (0, extension_1.activate)(mockContext);
                // 期待されるプロバイダーが登録されていることを確認
                assert.ok(registeredProviders.includes('bladeTemplateTree'));
            }
            finally {
                // モックを元に戻す
                vscode.window.registerTreeDataProvider = originalRegisterTreeDataProvider;
            }
        });
        it('testアクティベーション後にファイル監視が設定される', () => {
            // 元のファイル監視作成関数を保存
            const originalCreateFileSystemWatcher = vscode.workspace.createFileSystemWatcher;
            let watcherCreated = false;
            // ファイル監視作成をモック化
            vscode.workspace.createFileSystemWatcher = (globPattern) => {
                watcherCreated = true;
                return {
                    onDidChange: () => ({ dispose: () => { } }),
                    onDidCreate: () => ({ dispose: () => { } }),
                    onDidDelete: () => ({ dispose: () => { } }),
                    dispose: () => { },
                    ignoreCreateEvents: false,
                    ignoreChangeEvents: false,
                    ignoreDeleteEvents: false
                };
            };
            try {
                (0, extension_1.activate)(mockContext);
                // ファイル監視が作成されていることを確認
                assert.ok(watcherCreated);
            }
            finally {
                // モックを元に戻す
                vscode.workspace.createFileSystemWatcher = originalCreateFileSystemWatcher;
            }
        });
    });
    describe('異常系', () => {
        it('test無効なコンテキストでアクティベーションが失敗しない', () => {
            const invalidContext = {};
            // 無効なコンテキストでも例外が発生しないことを確認
            assert.doesNotThrow(() => {
                (0, extension_1.activate)(invalidContext);
            });
        });
        it('testコンテキストがnullの場合の処理', () => {
            // nullコンテキストでも例外が発生しないことを確認
            assert.doesNotThrow(() => {
                (0, extension_1.activate)(null);
            });
        });
    });
    describe('統合テスト', () => {
        it('testアクティベーションと非アクティベーションの連続実行', () => {
            // アクティベーションと非アクティベーションを連続で実行
            assert.doesNotThrow(() => {
                (0, extension_1.activate)(mockContext);
                (0, extension_1.deactivate)();
                (0, extension_1.activate)(mockContext);
                (0, extension_1.deactivate)();
            });
        });
        it('test複数回のアクティベーション', () => {
            // 複数回アクティベーションを実行しても問題ないことを確認
            assert.doesNotThrow(() => {
                (0, extension_1.activate)(mockContext);
                (0, extension_1.activate)(mockContext);
                (0, extension_1.activate)(mockContext);
            });
        });
    });
});
//# sourceMappingURL=extension.test.js.map
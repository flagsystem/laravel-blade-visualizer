import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate, deactivate } from '../src/extension';

/**
 * 拡張機能のメインファイルのテストスイート
 * アクティベーションと非アクティベーション機能をテストする
 */
describe('Extension', () => {
    let mockContext: any;

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
            asAbsolutePath: (relativePath: string) => `/test/extension/path/${relativePath}`,
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
                activate(mockContext);
            });

            // コンテキストにサブスクリプションが追加されていることを確認
            assert.ok(mockContext.subscriptions.length > 0);
        });

        it('test拡張機能が正常に非アクティベートされる', () => {
            // 非アクティベーション関数が例外を投げないことを確認
            assert.doesNotThrow(() => {
                deactivate();
            });
        });

        it('testアクティベーション後にコマンドが登録される', () => {
            // 元のコマンド登録関数を保存
            const originalRegisterCommand = vscode.commands.registerCommand;
            let registeredCommands: string[] = [];

            // コマンド登録をモック化
            vscode.commands.registerCommand = (command: string, callback: any) => {
                registeredCommands.push(command);
                return {
                    dispose: () => { }
                } as vscode.Disposable;
            };

            try {
                activate(mockContext);

                // 期待されるコマンドが登録されていることを確認
                assert.ok(registeredCommands.includes('laravel-blade-visualizer.showTree'));
            } finally {
                // モックを元に戻す
                vscode.commands.registerCommand = originalRegisterCommand;
            }
        });

        it('testアクティベーション後にツリーデータプロバイダーが登録される', () => {
            // 元のツリーデータプロバイダー登録関数を保存
            const originalRegisterTreeDataProvider = vscode.window.registerTreeDataProvider;
            let registeredProviders: string[] = [];

            // ツリーデータプロバイダー登録をモック化
            vscode.window.registerTreeDataProvider = (viewId: string, provider: any) => {
                registeredProviders.push(viewId);
                return {
                    dispose: () => { }
                } as vscode.Disposable;
            };

            try {
                activate(mockContext);

                // 期待されるプロバイダーが登録されていることを確認
                assert.ok(registeredProviders.includes('bladeTemplateTree'));
            } finally {
                // モックを元に戻す
                vscode.window.registerTreeDataProvider = originalRegisterTreeDataProvider;
            }
        });

        it('testアクティベーション後にファイル監視が設定される', () => {
            // 元のファイル監視作成関数を保存
            const originalCreateFileSystemWatcher = vscode.workspace.createFileSystemWatcher;
            let watcherCreated = false;

            // ファイル監視作成をモック化
            vscode.workspace.createFileSystemWatcher = (globPattern: vscode.GlobPattern) => {
                watcherCreated = true;
                return {
                    onDidChange: () => ({ dispose: () => { } }),
                    onDidCreate: () => ({ dispose: () => { } }),
                    onDidDelete: () => ({ dispose: () => { } }),
                    dispose: () => { },
                    ignoreCreateEvents: false,
                    ignoreChangeEvents: false,
                    ignoreDeleteEvents: false
                } as any;
            };

            try {
                activate(mockContext);

                // ファイル監視が作成されていることを確認
                assert.ok(watcherCreated);
            } finally {
                // モックを元に戻す
                vscode.workspace.createFileSystemWatcher = originalCreateFileSystemWatcher;
            }
        });
    });

    describe('異常系', () => {
        it('test無効なコンテキストでアクティベーションが失敗しない', () => {
            const invalidContext = {} as any;

            // 無効なコンテキストでも例外が発生しないことを確認
            assert.doesNotThrow(() => {
                activate(invalidContext);
            });
        });

        it('testコンテキストがnullの場合の処理', () => {
            // nullコンテキストでも例外が発生しないことを確認
            assert.doesNotThrow(() => {
                activate(null as any);
            });
        });
    });

    describe('統合テスト', () => {
        it('testアクティベーションと非アクティベーションの連続実行', () => {
            // アクティベーションと非アクティベーションを連続で実行
            assert.doesNotThrow(() => {
                activate(mockContext);
                deactivate();
                activate(mockContext);
                deactivate();
            });
        });

        it('test複数回のアクティベーション', () => {
            // 複数回アクティベーションを実行しても問題ないことを確認
            assert.doesNotThrow(() => {
                activate(mockContext);
                activate(mockContext);
                activate(mockContext);
            });
        });
    });
}); 

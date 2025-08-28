/**
 * VSCodeモジュールのモック
 * テスト環境でVSCodeのAPIをモック化する
 */

const fs = require('fs');
const path = require('path');

// VSCodeの主要なAPIをモック化
const vscode = {
    // Uri
    Uri: {
        file: (p) => ({ fsPath: p, scheme: 'file' })
    },

    // TreeItemCollapsibleState
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },

    // ViewColumn
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3
    },

    // ExtensionMode
    ExtensionMode: {
        Production: 1,
        Development: 2,
        Test: 3
    },

    // ThemeIcon
    ThemeIcon: class ThemeIcon {
        constructor(id) {
            this.id = id;
        }
    },

    // Disposable
    Disposable: class Disposable {
        constructor(dispose) {
            this.dispose = dispose || (() => { });
        }
    },

    // FileSystemWatcher
    FileSystemWatcher: class FileSystemWatcher {
        constructor() {
            this.onDidChange = () => ({ dispose: () => { } });
            this.onDidCreate = () => ({ dispose: () => { } });
            this.onDidDelete = () => ({ dispose: () => { } });
            this.dispose = () => { };
            this.ignoreCreateEvents = false;
            this.ignoreChangeEvents = false;
            this.ignoreDeleteEvents = false;
        }
    },

    // workspace
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/workspace' } }],
        openTextDocument: async (arg) => {
            const filePath = typeof arg === 'string' ? arg : (arg && arg.fsPath) ? arg.fsPath : '';
            const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
            return {
                getText: () => content,
                fileName: filePath
            };
        },
        findFiles: async (pattern) => [],
        createFileSystemWatcher: (pattern) => new vscode.FileSystemWatcher(),
        getConfiguration: () => ({
            get: () => ({})
        })
    },

    // window
    window: {
        _activeTextEditor: undefined,
        registerTreeDataProvider: (viewId, provider) => new vscode.Disposable(() => { }),
        showInformationMessage: (message) => { },
        showErrorMessage: (message) => { },
        showTextDocument: async (document) => {
            vscode.window._activeTextEditor = { document };
            return vscode.window._activeTextEditor;
        },
        get activeTextEditor() {
            return this._activeTextEditor;
        },
        createWebviewPanel: (viewType, title, viewColumn, options) => {
            let disposed = false;
            const disposeCallbacks = [];
            const webview = {
                html: '',
                onDidReceiveMessage: (listener) => new vscode.Disposable(() => { /* no-op in tests */ }),
                postMessage: async () => true
            };
            return {
                webview,
                onDidDispose: (cb) => { disposeCallbacks.push(cb); return new vscode.Disposable(() => { }); },
                dispose: () => { disposed = true; disposeCallbacks.forEach(cb => cb()); }
            };
        }
    },

    // commands
    commands: {
        _commands: new Set([
            'laravel-blade-visualizer.showTree',
            'laravel-blade-visualizer.showSelectedFileTree',
            'laravel-blade-visualizer.openVisualizer',
            'laravel-blade-visualizer.refreshTree',
            'vscode.openFolder',
            'vscode.open'
        ]),
        registerCommand: (command, callback) => {
            vscode.commands._commands.add(command);
            return new vscode.Disposable(() => { vscode.commands._commands.delete(command); });
        },
        getCommands: async () => Array.from(vscode.commands._commands),
        executeCommand: async (command, ...args) => {
            // テストでは副作用は不要なため、成功扱いにする
            return undefined;
        }
    },

    // extensions
    extensions: {
        getExtension: (id) => ({ id, isActive: true })
    },

    // EventEmitter
    EventEmitter: class EventEmitter {
        constructor() {
            this._handlers = [];
            this.event = (handler) => { this._handlers.push(handler); };
            this.fire = (e) => { this._handlers.forEach(h => h(e)); };
        }
    },

    // TreeDataProvider
    TreeDataProvider: class TreeDataProvider {
        constructor() {
            this.onDidChangeTreeData = new vscode.EventEmitter();
        }
    },

    // TreeItem
    TreeItem: class TreeItem {
        constructor(label, collapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
            this.tooltip = '';
            this.description = '';
            this.iconPath = null;
            // command はデフォルト未定義（undefined）
        }
    }
};

module.exports = vscode; 

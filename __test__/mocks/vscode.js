/**
 * VSCodeモジュールのモック
 * テスト環境でVSCodeのAPIをモック化する
 */

// VSCodeの主要なAPIをモック化
const vscode = {
    // Uri
    Uri: {
        file: (path) => ({ fsPath: path, scheme: 'file' })
    },

    // TreeItemCollapsibleState
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
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
            this.dispose = dispose;
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
        openTextDocument: async (path) => ({
            getText: () => ''
        }),
        findFiles: async (pattern) => [],
        createFileSystemWatcher: (pattern) => new vscode.FileSystemWatcher(),
        getConfiguration: () => ({
            get: () => ({})
        })
    },

    // window
    window: {
        registerTreeDataProvider: (viewId, provider) => new vscode.Disposable(() => { }),
        showInformationMessage: (message) => { },
        showErrorMessage: (message) => { }
    },

    // commands
    commands: {
        registerCommand: (command, callback) => new vscode.Disposable(() => { })
    },

    // EventEmitter
    EventEmitter: class EventEmitter {
        constructor() {
            this.event = () => { };
            this.fire = () => { };
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
            this.command = null;
        }
    }
};

module.exports = vscode; 

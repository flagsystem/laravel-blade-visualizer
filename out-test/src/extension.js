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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const BladeParser_1 = require("./parsers/BladeParser");
const BladeTemplateProvider_1 = require("./providers/BladeTemplateProvider");
const BladeVisualizerProvider_1 = require("./providers/BladeVisualizerProvider");
function activate(context) {
    const bladeParser = new BladeParser_1.BladeParser();
    // explorers
    const bladeTemplateProvider = new BladeTemplateProvider_1.BladeTemplateProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeTemplateTree', bladeTemplateProvider);
    const selectedFileTreeProvider = new BladeTemplateProvider_1.SelectedFileTreeProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeFileTree', selectedFileTreeProvider);
    // visualizer (editor webview)
    const bladeVisualizerProvider = new BladeVisualizerProvider_1.BladeVisualizerProvider(bladeParser);
    // commands
    const showSelectedFileTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.showSelectedFileTree', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(activeEditor.document.fileName);
        }
        else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });
    const refreshTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.refreshTree', () => {
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });
    const openVisualizerForFile = vscode.commands.registerCommand('laravel-blade-visualizer.openVisualizerForFile', (filePath) => {
        const targetPath = filePath || vscode.window.activeTextEditor?.document.fileName;
        if (targetPath && targetPath.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(targetPath);
            bladeVisualizerProvider.openVisualizer(targetPath);
        }
        else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });
    // react on active editor changes
    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(editor.document.fileName);
            bladeTemplateProvider.refresh();
        }
        else {
            bladeTemplateProvider.refresh();
        }
    });
    // initialize once on activation for the currently active editor (fix: first-open empty tree)
    const initEditor = vscode.window.activeTextEditor;
    if (initEditor && initEditor.document.fileName.endsWith('.blade.php')) {
        selectedFileTreeProvider.setSelectedFile(initEditor.document.fileName);
    }
    // file watching
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.blade.php');
    fileWatcher.onDidChange(uri => {
        bladeParser.invalidate(uri.fsPath);
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });
    fileWatcher.onDidCreate(uri => {
        bladeParser.invalidate(uri.fsPath);
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });
    fileWatcher.onDidDelete(uri => {
        bladeParser.invalidate(uri.fsPath);
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });
    context.subscriptions.push(showSelectedFileTreeDisposable, refreshTreeDisposable, openVisualizerForFile, activeEditorChangeDisposable, fileWatcher);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
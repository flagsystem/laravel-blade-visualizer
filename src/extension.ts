import * as vscode from 'vscode';
import { BladeParser } from './parsers/BladeParser';
import { BladeTemplateProvider, SelectedFileTreeProvider } from './providers/BladeTemplateProvider';
import { BladeVisualizerProvider } from './providers/BladeVisualizerProvider';

export function activate(context: vscode.ExtensionContext) {
    const bladeParser = new BladeParser();

    // explorers
    const bladeTemplateProvider = new BladeTemplateProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeTemplateTree', bladeTemplateProvider);

    const selectedFileTreeProvider = new SelectedFileTreeProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeFileTree', selectedFileTreeProvider);

    // visualizer (editor webview)
    const bladeVisualizerProvider = new BladeVisualizerProvider(bladeParser);

    // commands
    const showSelectedFileTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.showSelectedFileTree', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(activeEditor.document.fileName);
        } else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });

    const refreshTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.refreshTree', () => {
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });

    const openVisualizerForFile = vscode.commands.registerCommand('laravel-blade-visualizer.openVisualizerForFile', (filePath?: string) => {
        const targetPath = filePath || vscode.window.activeTextEditor?.document.fileName;
        if (targetPath && targetPath.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(targetPath);
            bladeVisualizerProvider.openVisualizer(targetPath);
        } else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });

    // react on active editor changes
    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(editor.document.fileName);
            bladeTemplateProvider.refresh();
        } else {
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

    context.subscriptions.push(
        showSelectedFileTreeDisposable,
        refreshTreeDisposable,
        openVisualizerForFile,
        activeEditorChangeDisposable,
        fileWatcher
    );
}

export function deactivate() { } 

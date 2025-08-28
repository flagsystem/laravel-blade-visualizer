import * as vscode from 'vscode';
import { BladeParser } from './parsers/BladeParser';
import { BladeTemplateProvider, SelectedFileTreeProvider } from './providers/BladeTemplateProvider';
import { BladeVisualizerProvider } from './providers/BladeVisualizerProvider';

/**
 * Laravel Blade Visualizer拡張機能のアクティベーション関数
 * 拡張機能が有効になった時に実行され、Bladeテンプレートの解析とビジュアライゼーション機能を初期化する
 * 
 * @param {vscode.ExtensionContext} context - VSCode拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Laravel Blade Visualizer is now active!');

    // Bladeパーサーの初期化
    const bladeParser = new BladeParser();

    // 既存のツリーデータプロバイダーの登録
    const bladeTemplateProvider = new BladeTemplateProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeTemplateTree', bladeTemplateProvider);

    // 新しい選択ファイルツリープロバイダーの登録
    const selectedFileTreeProvider = new SelectedFileTreeProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeFileTree', selectedFileTreeProvider);

    // ビジュアライザープロバイダーの初期化
    const bladeVisualizerProvider = new BladeVisualizerProvider(bladeParser);

    // コマンドの登録
    let disposable = vscode.commands.registerCommand('laravel-blade-visualizer.showTree', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            bladeTemplateProvider.refresh();
            vscode.window.showInformationMessage(`選択中のファイルのツリーを表示: ${activeEditor.document.fileName}`);
        } else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });

    // 選択中のファイルの完全ツリーを表示するコマンド
    let showSelectedFileTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.showSelectedFileTree', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(activeEditor.document.fileName);
            vscode.window.showInformationMessage(`選択中のファイルの完全ツリーを表示: ${activeEditor.document.fileName}`);
        } else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });

    // ツリーを更新するコマンド
    let refreshTreeDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.refreshTree', () => {
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
        vscode.window.showInformationMessage('ツリーを更新しました');
    });

    // ビジュアライザーを開くコマンド
    let openVisualizerDisposable = vscode.commands.registerCommand('laravel-blade-visualizer.openVisualizer', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            bladeVisualizerProvider.openVisualizer(activeEditor.document.fileName);
        } else {
            vscode.window.showWarningMessage('Bladeファイルを選択してください');
        }
    });

    // アクティブエディタの変更を監視し、Bladeファイルが選択された時にツリーを更新
    let activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.setSelectedFile(editor.document.fileName);
            bladeTemplateProvider.refresh(); // BladeTemplateProviderも更新
        } else {
            // Bladeファイル以外が選択された場合も更新
            bladeTemplateProvider.refresh();
        }
    });

    // ファイル変更の監視を設定し、Bladeファイルの変更時にツリーを更新する
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.blade.php');
    fileWatcher.onDidChange(() => {
        bladeTemplateProvider.refresh();
        // 現在選択中のファイルがある場合は、そのファイルのツリーも更新
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.blade.php')) {
            selectedFileTreeProvider.refresh();
        }
    });
    fileWatcher.onDidCreate(() => {
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });
    fileWatcher.onDidDelete(() => {
        bladeTemplateProvider.refresh();
        selectedFileTreeProvider.refresh();
    });

    // サブスクリプションに追加
    context.subscriptions.push(
        disposable,
        showSelectedFileTreeDisposable,
        refreshTreeDisposable,
        openVisualizerDisposable,
        activeEditorChangeDisposable,
        fileWatcher
    );
}

/**
 * Laravel Blade Visualizer拡張機能の非アクティベーション関数
 * 拡張機能が無効になった時に実行される
 */
export function deactivate() {
    console.log('Laravel Blade Visualizer is now deactivated!');
} 

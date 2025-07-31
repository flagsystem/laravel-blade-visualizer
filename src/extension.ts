import * as vscode from 'vscode';
import { BladeParser } from './parsers/BladeParser';
import { BladeTemplateProvider } from './providers/BladeTemplateProvider';

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

    // ツリーデータプロバイダーの登録
    const bladeTemplateProvider = new BladeTemplateProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeTemplateTree', bladeTemplateProvider);

    // コマンドの登録
    let disposable = vscode.commands.registerCommand('laravel-blade-visualizer.showTree', () => {
        vscode.window.showInformationMessage('Blade Template Tree activated!');
        bladeTemplateProvider.refresh();
    });

    context.subscriptions.push(disposable);

    // ファイル変更の監視を設定し、Bladeファイルの変更時にツリーを更新する
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.blade.php');
    fileWatcher.onDidChange(() => {
        bladeTemplateProvider.refresh();
    });
    fileWatcher.onDidCreate(() => {
        bladeTemplateProvider.refresh();
    });
    fileWatcher.onDidDelete(() => {
        bladeTemplateProvider.refresh();
    });

    context.subscriptions.push(fileWatcher);
}

/**
 * Laravel Blade Visualizer拡張機能の非アクティベーション関数
 * 拡張機能が無効になった時に実行される
 */
export function deactivate() {
    console.log('Laravel Blade Visualizer is now deactivated!');
} 

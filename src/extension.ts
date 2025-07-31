import * as vscode from 'vscode';
import { BladeParser } from './parsers/BladeParser';
import { BladeTemplateProvider } from './providers/BladeTemplateProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Laravel Blade Visualizer is now active!');

    // Initialize the Blade parser
    const bladeParser = new BladeParser();

    // Register the tree data provider
    const bladeTemplateProvider = new BladeTemplateProvider(bladeParser);
    vscode.window.registerTreeDataProvider('bladeTemplateTree', bladeTemplateProvider);

    // Register commands
    let disposable = vscode.commands.registerCommand('laravel-blade-visualizer.showTree', () => {
        vscode.window.showInformationMessage('Blade Template Tree activated!');
        bladeTemplateProvider.refresh();
    });

    context.subscriptions.push(disposable);

    // Watch for file changes to update the tree
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

export function deactivate() {
    console.log('Laravel Blade Visualizer is now deactivated!');
} 

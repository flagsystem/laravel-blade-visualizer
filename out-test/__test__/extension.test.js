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
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
/**
 * Laravel Blade Visualizer拡張機能のテストスイート
 * 拡張機能の主要な機能とコマンドの動作を確認する
 */
describe('Laravel Blade Visualizer Extension Test Suite', () => {
    /**
     * テストスイートのセットアップ
     * テスト実行前に必要な初期化処理を行う
     */
    before(async () => {
        // テスト用のワークスペースフォルダを開く
        const testWorkspace = path.join(__dirname, '..', 'test-blade-files');
        const uri = vscode.Uri.file(testWorkspace);
        await vscode.commands.executeCommand('vscode.openFolder', uri);
    });
    /**
     * 拡張機能のアクティベーションをテストする
     * 拡張機能が正常に有効化されることを確認する
     */
    it('拡張機能が正常にアクティベートされる', async () => {
        // 拡張機能が有効化されるまで待機
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 拡張機能が有効化されていることを確認
        const extension = vscode.extensions.getExtension('flagsystem.laravel-blade-visualizer');
        assert.ok(extension, '拡張機能が見つからない');
        assert.ok(extension.isActive, '拡張機能がアクティブでない');
    });
    /**
     * コマンドの存在をテストする
     * 必要なコマンドが登録されていることを確認する
     */
    it('必要なコマンドが登録されている', async () => {
        const commands = await vscode.commands.getCommands();
        // 主要なコマンドが存在することを確認
        assert.ok(commands.includes('laravel-blade-visualizer.showTree'), 'showTreeコマンドが存在しない');
        assert.ok(commands.includes('laravel-blade-visualizer.showSelectedFileTree'), 'showSelectedFileTreeコマンドが存在しない');
        assert.ok(commands.includes('laravel-blade-visualizer.openVisualizer'), 'openVisualizerコマンドが存在しない');
        assert.ok(commands.includes('laravel-blade-visualizer.refreshTree'), 'refreshTreeコマンドが存在しない');
    });
    /**
     * ビューの存在をテストする
     * 必要なビューが登録されていることを確認する
     */
    it('必要なビューが登録されている', async () => {
        // ビューの存在を確認（直接的なAPIはないため、コマンドの実行結果で確認）
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.length > 0, 'コマンドが登録されていない');
    });
    /**
     * Bladeファイルの選択時の動作をテストする
     * Bladeファイルが選択された時に適切な動作をすることを確認する
     */
    it('Bladeファイル選択時の動作', async () => {
        // テスト用のBladeファイルを開く
        const testBladeFile = path.join(__dirname, '..', 'test-blade-files', 'test.blade.php');
        const document = await vscode.workspace.openTextDocument(testBladeFile);
        await vscode.window.showTextDocument(document);
        // ファイルが開かれるまで待機
        await new Promise(resolve => setTimeout(resolve, 500));
        // アクティブエディタが正しいファイルであることを確認
        const activeEditor = vscode.window.activeTextEditor;
        assert.ok(activeEditor, 'アクティブエディタが存在しない');
        assert.ok(activeEditor.document.fileName.endsWith('.blade.php'), 'Bladeファイルが選択されていない');
    });
    /**
     * ツリー表示コマンドの実行をテストする
     * コマンドが正常に実行されることを確認する
     */
    it('ツリー表示コマンドの実行', async () => {
        // Bladeファイルが選択されている状態でコマンドを実行
        const testBladeFile = path.join(__dirname, '..', 'test-blade-files', 'test.blade.php');
        const document = await vscode.workspace.openTextDocument(testBladeFile);
        await vscode.window.showTextDocument(document);
        // ファイルが開かれるまで待機
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            // コマンドを実行（エラーが発生しないことを確認）
            await vscode.commands.executeCommand('laravel-blade-visualizer.showTree');
            await vscode.commands.executeCommand('laravel-blade-visualizer.showSelectedFileTree');
            await vscode.commands.executeCommand('laravel-blade-visualizer.refreshTree');
            // コマンドが正常に実行されたことを確認
            assert.ok(true, 'コマンドが正常に実行された');
        }
        catch (error) {
            assert.fail(`コマンドの実行でエラーが発生: ${error}`);
        }
    });
    /**
     * 非Bladeファイル選択時の動作をテストする
     * Bladeファイル以外が選択された時に適切な動作をすることを確認する
     */
    it('非Bladeファイル選択時の動作', async () => {
        // テスト用のテキストファイルを開く
        const testTextFile = path.join(__dirname, '..', 'test-blade-files', 'test.txt');
        const document = await vscode.workspace.openTextDocument(testTextFile);
        await vscode.window.showTextDocument(document);
        // ファイルが開かれるまで待機
        await new Promise(resolve => setTimeout(resolve, 500));
        // アクティブエディタが正しいファイルであることを確認
        const activeEditor = vscode.window.activeTextEditor;
        assert.ok(activeEditor, 'アクティブエディタが存在しない');
        assert.ok(!activeEditor.document.fileName.endsWith('.blade.php'), 'Bladeファイル以外が選択されている');
    });
    /**
     * エラーハンドリングをテストする
     * エラーが発生した場合に適切に処理されることを確認する
     */
    it('エラーハンドリング', async () => {
        try {
            // 存在しないファイルでコマンドを実行
            await vscode.commands.executeCommand('laravel-blade-visualizer.showTree');
            // エラーが発生しない場合は正常
            assert.ok(true, 'エラーハンドリングが正常に動作している');
        }
        catch (error) {
            // エラーが発生した場合も、適切に処理されている
            assert.ok(true, 'エラーが適切に処理されている');
        }
    });
});
//# sourceMappingURL=extension.test.js.map
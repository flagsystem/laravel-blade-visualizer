import * as path from 'path';
import * as vscode from 'vscode';
import { BladeParser, BladeTreeItem } from '../parsers/BladeParser';

/**
 * Bladeテンプレートの関係をワークフローチックに表示するWebviewProvider
 * 親子関係を矢印や線で表現し、階層構造を視覚的に分かりやすく表示する
 */
export class BladeVisualizerProvider {
    /** 現在表示中のWebview */
    private currentPanel: vscode.WebviewPanel | undefined;
    /** Bladeパーサーインスタンス */
    private bladeParser: BladeParser;

    /**
     * BladeVisualizerProviderのコンストラクタ
     * 
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(bladeParser: BladeParser) {
        this.bladeParser = bladeParser;
    }

    /**
     * ビジュアライザーを開く
     * 
     * @param {string} filePath - 表示対象のBladeファイルのパス
     */
    async openVisualizer(filePath: string): Promise<void> {
        // 既存のパネルがある場合は閉じる
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }

        // 新しいWebviewパネルを作成
        this.currentPanel = vscode.window.createWebviewPanel(
            'bladeVisualizer',
            'Blade Template Visualizer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // 完全なツリーを構築
        const completeTree = await this.bladeParser.buildCompleteTree(filePath);
        if (!completeTree) {
            this.currentPanel.webview.html = this.getErrorHtml('テンプレートの解析に失敗しました');
            return;
        }

        // WebviewのHTMLコンテンツを設定
        this.currentPanel.webview.html = this.getWebviewContent(completeTree, filePath);

        // Webviewが閉じられた時の処理
        this.currentPanel.onDidDispose(() => {
            this.currentPanel = undefined;
        });

        // Webviewからのメッセージを受信
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openFile':
                        this.openFile(message.filePath);
                        break;
                    case 'refresh':
                        this.refreshVisualizer(filePath);
                        break;
                }
            }
        );
    }

    /**
     * ビジュアライザーを更新する
     * 
     * @param {string} filePath - 表示対象のBladeファイルのパス
     */
    async refreshVisualizer(filePath: string): Promise<void> {
        if (this.currentPanel) {
            const completeTree = await this.bladeParser.buildCompleteTree(filePath);
            if (completeTree) {
                this.currentPanel.webview.html = this.getWebviewContent(completeTree, filePath);
            }
        }
    }

    /**
     * ファイルを開く
     * 
     * @param {string} filePath - 開くファイルのパス
     */
    private openFile(filePath: string): void {
        vscode.workspace.openTextDocument(filePath).then(document => {
            vscode.window.showTextDocument(document);
        });
    }

    /**
     * WebviewのHTMLコンテンツを生成する
     * 
     * @param {BladeTreeItem} tree - 表示対象のツリー構造
     * @param {string} selectedFilePath - 選択中のファイルパス
     * @returns {string} HTMLコンテンツ
     */
    private getWebviewContent(tree: BladeTreeItem, selectedFilePath: string): string {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blade Template Visualizer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .title {
            font-size: 18px;
            font-weight: bold;
        }
        .controls {
            display: flex;
            gap: 10px;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .visualizer-container {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            min-height: 600px;
            position: relative;
        }
        .tree-node {
            display: inline-block;
            margin: 10px;
            padding: 12px 16px;
            border: 2px solid var(--vscode-panel-border);
            border-radius: 6px;
            background-color: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        .tree-node:hover {
            border-color: var(--vscode-focusBorder);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .tree-node.selected {
            border-color: var(--vscode-focusBorder);
            background-color: var(--vscode-focusBorder);
            color: var(--vscode-editor-background);
        }
        .tree-node.extends {
            border-color: var(--vscode-charts-blue);
            background-color: var(--vscode-charts-blue);
            color: white;
        }
        .tree-node.include {
            border-color: var(--vscode-charts-green);
            background-color: var(--vscode-charts-green);
            color: white;
        }
        .tree-node.component {
            border-color: var(--vscode-charts-orange);
            background-color: var(--vscode-charts-orange);
            color: white;
        }
        .node-label {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .node-path {
            font-size: 12px;
            opacity: 0.8;
            word-break: break-all;
            max-width: 200px;
        }
        .node-type {
            font-size: 11px;
            text-transform: uppercase;
            margin-top: 4px;
            opacity: 0.7;
        }
        .tree-level {
            text-align: center;
            margin: 20px 0;
            position: relative;
        }
        .tree-level::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--vscode-panel-border);
            z-index: -1;
        }
        .connection-line {
            position: absolute;
            background-color: var(--vscode-panel-border);
            z-index: -1;
        }
        .connection-line.vertical {
            width: 2px;
        }
        .connection-line.horizontal {
            height: 2px;
        }
        .level-indicator {
            background-color: var(--vscode-editor-background);
            padding: 0 10px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-weight: bold;
        }
        .legend {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 16px;
            font-size: 12px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            margin-right: 8px;
        }
        .legend-color.selected { background-color: var(--vscode-focusBorder); }
        .legend-color.extends { background-color: var(--vscode-charts-blue); }
        .legend-color.include { background-color: var(--vscode-charts-green); }
        .legend-color.component { background-color: var(--vscode-charts-orange); }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🎯 Blade Template Visualizer</div>
        <div class="controls">
            <button onclick="refreshVisualizer()">🔄 更新</button>
            <button onclick="expandAll()">📂 全て展開</button>
            <button onclick="collapseAll()">📁 全て折りたたみ</button>
        </div>
    </div>

    <div class="visualizer-container" id="visualizer">
        ${this.generateTreeHTML(tree)}
    </div>

    <div class="legend">
        <div style="font-weight: bold; margin-bottom: 10px;">凡例</div>
        <div class="legend-item">
            <div class="legend-color selected"></div>
            <span>選択中のファイル</span>
        </div>
        <div class="legend-item">
            <div class="legend-color extends"></div>
            <span>継承元 (@extends)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color include"></div>
            <span>インクルード (@include)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color component"></div>
            <span>コンポーネント (@component)</span>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // ファイルを開く
        function openFile(filePath) {
            vscode.postMessage({
                command: 'openFile',
                filePath: filePath
            });
        }

        // ビジュアライザーを更新
        function refreshVisualizer() {
            vscode.postMessage({
                command: 'refresh'
            });
        }

        // 全て展開
        function expandAll() {
            const nodes = document.querySelectorAll('.tree-node');
            nodes.forEach(node => {
                node.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    node.style.transform = 'scale(1)';
                }, 200);
            });
        }

        // 全て折りたたみ
        function collapseAll() {
            const nodes = document.querySelectorAll('.tree-node');
            nodes.forEach(node => {
                node.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    node.style.transform = 'scale(1)';
                }, 200);
            });
        }

        // ノードクリック時の処理
        document.addEventListener('click', function(e) {
            if (e.target.closest('.tree-node')) {
                const node = e.target.closest('.tree-node');
                const filePath = node.dataset.filePath;
                if (filePath) {
                    openFile(filePath);
                }
            }
        });

        // 接続線を描画
        function drawConnections() {
            const levels = document.querySelectorAll('.tree-level');
            levels.forEach((level, levelIndex) => {
                if (levelIndex < levels.length - 1) {
                    const currentNodes = level.querySelectorAll('.tree-node');
                    const nextLevel = levels[levelIndex + 1];
                    const nextNodes = nextLevel.querySelectorAll('.tree-node');
                    
                    currentNodes.forEach((currentNode, nodeIndex) => {
                        if (nodeIndex < nextNodes.length) {
                            const line = document.createElement('div');
                            line.className = 'connection-line vertical';
                            line.style.left = (currentNode.offsetLeft + currentNode.offsetWidth / 2) + 'px';
                            line.style.top = currentNode.offsetTop + currentNode.offsetHeight + 'px';
                            line.style.height = (nextLevel.offsetTop - (currentNode.offsetTop + currentNode.offsetHeight)) + 'px';
                            document.getElementById('visualizer').appendChild(line);
                        }
                    });
                }
            });
        }

        // ページ読み込み完了後に接続線を描画
        window.addEventListener('load', function() {
            setTimeout(drawConnections, 100);
        });
    </script>
</body>
</html>`;
    }

    /**
     * エラー表示用のHTMLを生成する
     * 
     * @param {string} errorMessage - エラーメッセージ
     * @returns {string} エラー表示用HTML
     */
    private getErrorHtml(errorMessage: string): string {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Blade Template Visualizer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .error-container {
            text-align: center;
            padding: 40px;
            border: 2px solid var(--vscode-errorForeground);
            border-radius: 8px;
            background-color: var(--vscode-inputValidation-errorBackground);
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .error-message {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .error-details {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">❌</div>
        <div class="error-message">エラーが発生しました</div>
        <div class="error-details">${errorMessage}</div>
    </div>
</body>
</html>`;
    }

    /**
     * ツリー構造のHTMLを生成する
     * 
     * @param {BladeTreeItem} tree - 表示対象のツリー構造
     * @returns {string} ツリー構造のHTML
     */
    private generateTreeHTML(tree: BladeTreeItem): string {
        const levels = this.groupNodesByLevel(tree);
        let html = '';

        // 各レベルごとにHTMLを生成
        for (let level = 0; level < levels.length; level++) {
            const nodes = levels[level];
            html += '<div class="tree-level">';
            html += `<div class="level-indicator">Level ${level}</div>`;

            nodes.forEach(node => {
                const nodeClass = this.getNodeClass(node);
                const nodeType = this.getNodeTypeLabel(node.type);

                html += `
                    <div class="tree-node ${nodeClass}" 
                         data-file-path="${node.template.filePath}"
                         title="${node.template.filePath}">
                        <div class="node-label">${node.template.fileName}</div>
                        <div class="node-path">${this.getShortPath(node.template.filePath)}</div>
                        <div class="node-type">${nodeType}</div>
                    </div>
                `;
            });

            html += '</div>';
        }

        return html;
    }

    /**
     * ノードをレベルごとにグループ化する
     * 
     * @param {BladeTreeItem} tree - ツリー構造
     * @returns {BladeTreeItem[][]} レベルごとにグループ化されたノード
     */
    private groupNodesByLevel(tree: BladeTreeItem): BladeTreeItem[][] {
        const levels: BladeTreeItem[][] = [];
        this.collectNodesByLevel(tree, 0, levels);
        return levels;
    }

    /**
     * ノードをレベルごとに収集する（再帰処理）
     * 
     * @param {BladeTreeItem} node - 現在のノード
     * @param {number} level - 現在のレベル
     * @param {BladeTreeItem[][]} levels - レベルごとのノード配列
     */
    private collectNodesByLevel(node: BladeTreeItem, level: number, levels: BladeTreeItem[][]): void {
        if (!levels[level]) {
            levels[level] = [];
        }
        levels[level].push(node);

        // 子要素を再帰的に処理
        node.children.forEach(child => {
            this.collectNodesByLevel(child, level + 1, levels);
        });
    }

    /**
     * ノードのCSSクラスを取得する
     * 
     * @param {BladeTreeItem} node - ノード
     * @returns {string} CSSクラス
     */
    private getNodeClass(node: BladeTreeItem): string {
        if (node.isSelected) {
            return 'selected';
        }
        return node.type;
    }

    /**
     * ノードタイプのラベルを取得する
     * 
     * @param {string} type - ノードタイプ
     * @returns {string} ラベル
     */
    private getNodeTypeLabel(type: string): string {
        switch (type) {
            case 'root': return 'ルート';
            case 'extends': return '継承元';
            case 'include': return 'インクルード';
            case 'component': return 'コンポーネント';
            default: return type;
        }
    }

    /**
     * ファイルパスを短縮表示用に加工する
     * 
     * @param {string} filePath - ファイルパス
     * @returns {string} 短縮されたパス
     */
    private getShortPath(filePath: string): string {
        if (filePath.includes('resources/views/')) {
            return filePath.split('resources/views/')[1];
        }
        return path.basename(filePath);
    }
} 

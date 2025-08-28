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
exports.BladeRelationshipViewProvider = exports.BladeVisualizerProvider = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
/**
 * Bladeテンプレートの関係をワークフローチックに表示するWebviewProvider
 * 親子関係を矢印や線で表現し、階層構造を視覚的に分かりやすく表示する
 */
class BladeVisualizerProvider {
    /**
     * BladeVisualizerProviderのコンストラクタ
     *
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(bladeParser) {
        this.bladeParser = bladeParser;
    }
    /**
     * ビジュアライザーを開く
     *
     * @param {string} filePath - 表示対象のBladeファイルのパス
     */
    async openVisualizer(filePath) {
        // 既存のパネルがある場合は閉じる
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }
        // 新しいWebviewパネルを作成
        this.currentPanel = vscode.window.createWebviewPanel('bladeVisualizer', 'Blade Template Visualizer', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
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
        this.currentPanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'openFile':
                    this.openFile(message.filePath);
                    break;
                case 'refresh':
                    this.refreshVisualizer(filePath);
                    break;
            }
        });
    }
    /**
     * ビジュアライザーを更新する
     *
     * @param {string} filePath - 表示対象のBladeファイルのパス
     */
    async refreshVisualizer(filePath) {
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
    openFile(filePath) {
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
    getWebviewContent(tree, selectedFilePath) {
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
			position: relative;
			z-index: 2;
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
			overflow: auto;
		}
		.tree-diagram ul { list-style: none; margin: 0; padding-left: 24px; position: relative; }
		.tree-diagram ul.root { padding-left: 0; }
		.tree-diagram ul::before { content: ''; position: absolute; top: 0; bottom: 0; left: 10px; width: 2px; background: var(--vscode-descriptionForeground); }
		.tree-diagram li { position: relative; padding-left: 24px; margin: 6px 0; }
		.tree-diagram li::before { content: ''; position: absolute; top: 12px; left: 0; width: 10px; height: 2px; background: var(--vscode-descriptionForeground); }

        .tree-node {
            display: inline-block;
			margin: 0;
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
			border-color: #d70022;
			background-color: #d70022;
			color: #ffffff;
        }
        		/* 祖先（extends）を青、子孫（include/component）を緑で表現 */
		.tree-node.extends { border-color: var(--vscode-charts-blue); }
		.tree-node.include, .tree-node.component { border-color: var(--vscode-charts-green); }
		/* 未選択の最上位祖先(ルート)を紫で表現 */
		.tree-node.root-unselected { border-color: var(--vscode-charts-purple); }
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
			bottom: 20px;
            right: 20px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 16px;
            font-size: 12px;
			pointer-events: none;
			z-index: 1;
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
			border: 1px solid var(--vscode-panel-border);
        }
				.legend-color.selected { background-color: #d70022; }
		.legend-color.ancestors { background-color: var(--vscode-charts-blue); }
		.legend-color.descendants { background-color: var(--vscode-charts-green); }
		.legend-color.root { background-color: var(--vscode-charts-purple); }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🎯 Blade Template Visualizer</div>
        <div class="controls">
            <button onclick="refreshVisualizer()">🔄 更新</button>
        </div>
    </div>

    <div class="visualizer-container" id="visualizer">
        ${this.generateTreeHTML(tree)}
    </div>

    <div class="legend">
        <div style="font-weight: bold; margin-bottom: 10px;">凡例</div>
		<div class="legend-item"><div class="legend-color selected"></div><span>選択中</span></div>
		<div class="legend-item"><div class="legend-color root"></div><span>未選択の最上位祖先(ルート)</span></div>
		<div class="legend-item"><div class="legend-color ancestors"></div><span>祖先チェーン（extends）</span></div>
		<div class="legend-item"><div class="legend-color descendants"></div><span>子孫（include/component）</span></div>
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
    getErrorHtml(errorMessage) {
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
    generateTreeHTML(tree) {
        const renderNode = (node) => {
            const nodeClass = this.getNodeClass(node);
            const nodeType = this.getNodeTypeLabel(node.type);
            const childrenHtml = node.children.length > 0
                ? `<ul>${node.children.map(c => renderNode(c)).join('')}</ul>`
                : '';
            return `
				<li>
					<div class="tree-node ${nodeClass}" data-file-path="${node.template.filePath}" title="${node.template.filePath}">
                        <div class="node-label">${node.template.fileName}</div>
                        <div class="node-path">${this.getShortPath(node.template.filePath)}</div>
                        <div class="node-type">${nodeType}</div>
                    </div>
					${childrenHtml}
				</li>
			`;
        };
        return `<div class="tree-diagram"><ul class="root">${renderNode(tree)}</ul></div>`;
    }
    /**
     * ノードをレベルごとにグループ化する
     *
     * @param {BladeTreeItem} tree - ツリー構造
     * @returns {BladeTreeItem[][]} レベルごとにグループ化されたノード
     */
    groupNodesByLevel(tree) {
        const levels = [];
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
    collectNodesByLevel(node, level, levels) {
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
    getNodeClass(node) {
        if (node.isSelected) {
            return 'selected';
        }
        if (node.type === 'root') {
            return 'root-unselected';
        }
        return node.type;
    }
    /**
     * ノードタイプのラベルを取得する
     *
     * @param {string} type - ノードタイプ
     * @returns {string} ラベル
     */
    getNodeTypeLabel(type) {
        switch (type) {
            case 'root': return 'ルート';
            case 'extends': return '継承元';
            case 'include': return 'インクルード';
            case 'component': return 'コンポーネント';
            case 'usedBy': return '参照元';
            default: return type;
        }
    }
    /**
     * ファイルパスを短縮表示用に加工する
     *
     * @param {string} filePath - ファイルパス
     * @returns {string} 短縮されたパス
     */
    getShortPath(filePath) {
        if (filePath.includes('resources/views/')) {
            return filePath.split('resources/views/')[1];
        }
        return path.basename(filePath);
    }
}
exports.BladeVisualizerProvider = BladeVisualizerProvider;
/**
 * サイドバーの`bladeRelationshipView`にグラフを描画するWebviewViewProvider
 */
class BladeRelationshipViewProvider {
    constructor(bladeParser) {
        this.bladeParser = bladeParser;
    }
    /**
     * @param webviewView WebviewView
     */
    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        // 初回描画
        this.renderForActiveEditor();
        // アクティブエディタ変更で更新
        vscode.window.onDidChangeActiveTextEditor(() => this.renderForActiveEditor());
    }
    /**
     * アクティブなBladeファイルに対して描画
     */
    async renderForActiveEditor() {
        if (!this.view) {
            return;
        }
        const active = vscode.window.activeTextEditor;
        if (!active || !active.document.fileName.endsWith('.blade.php')) {
            this.view.webview.html = this.renderInfo('Bladeファイルを開くと、ここに関係グラフが表示されます');
            return;
        }
        const tree = await this.bladeParser.buildCompleteTree(active.document.fileName);
        if (!tree) {
            this.view.webview.html = this.renderInfo('ツリーの構築に失敗しました');
            return;
        }
        // BladeVisualizerProviderのHTML生成を再利用せず、このビュー用の軽量HTMLを生成
        this.view.webview.html = this.renderGraphHtml(tree);
    }
    renderInfo(message) {
        return `<div style="padding:12px;color:var(--vscode-descriptionForeground);">${message}</div>`;
    }
    renderGraphHtml(tree) {
        const renderNode = (n) => {
            const cls = n.isSelected ? 'selected' : (n.type === 'root' ? 'root-unselected' : n.type);
            const children = n.children.length ? `<ul>${n.children.map(renderNode).join('')}</ul>` : '';
            return `<li>
                <div class="tree-node ${cls}">
                    <div class="node-label">${n.template.fileName}</div>
                    <div class="node-path">${this.shortPath(n.template.filePath)}</div>
                </div>
                ${children}
            </li>`;
        };
        return `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <style>
            body{margin:0;padding:8px;background:var(--vscode-editor-background);color:var(--vscode-editor-foreground);} 
            .tree ul{list-style:none;margin:0;padding-left:24px;position:relative}
            .tree ul.root{padding-left:0}
            			.tree ul::before{content:'';position:absolute;top:0;bottom:0;left:10px;width:2px;background:var(--vscode-descriptionForeground)}
			.tree li{position:relative;padding-left:24px;margin:6px 0}
			.tree li::before{content:'';position:absolute;top:12px;left:0;width:10px;height:2px;background:var(--vscode-descriptionForeground)}
            .tree-node{display:inline-block;margin:0;padding:8px 10px;border:2px solid var(--vscode-panel-border);border-radius:6px}
            .tree-node.selected{border-color:#d70022;background:#d70022;color:#fff}
            .tree-node.extends{border-color:var(--vscode-charts-blue)}
            .tree-node.include,.tree-node.component{border-color:var(--vscode-charts-green)}
            .tree-node.root-unselected{border-color:var(--vscode-charts-purple)}
            .node-label{font-weight:bold}
            .node-path{font-size:11px;opacity:.8;max-width:180px;word-break:break-all}
        </style></head><body>
            <div class="tree"><ul class="root">${renderNode(tree)}</ul></div>
        </body></html>`;
    }
    // levelizeは不要になったが一旦残す
    shortPath(filePath) {
        return filePath.includes('resources/views/') ? filePath.split('resources/views/')[1] : path.basename(filePath);
    }
}
exports.BladeRelationshipViewProvider = BladeRelationshipViewProvider;
BladeRelationshipViewProvider.viewType = 'bladeRelationshipView';
//# sourceMappingURL=BladeVisualizerProvider.js.map
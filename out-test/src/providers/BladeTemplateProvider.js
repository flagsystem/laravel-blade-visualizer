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
exports.BladeTemplateItem = exports.SelectedFileTreeProvider = exports.BladeTemplateProvider = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
/**
 * VSCodeのツリービューにBladeテンプレートの親子関係を表示するプロバイダークラス
 * TreeDataProviderインターフェースを実装し、Bladeテンプレートの階層構造を視覚的に表現する
 */
class BladeTemplateProvider {
    /**
     * BladeTemplateProviderのコンストラクタ
     *
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(bladeParser) {
        this.bladeParser = bladeParser;
        /** ツリーデータの変更を通知するイベントエミッター */
        this._onDidChangeTreeData = new vscode.EventEmitter();
        /** ツリーデータの変更イベント */
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    /**
     * ツリーデータを更新し、UIに変更を通知する
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * ツリーアイテムの表示設定を取得する
     *
     * @param {BladeTemplateItem} element - 表示対象のツリーアイテム
     * @returns {vscode.TreeItem} 設定されたツリーアイテム
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * 指定された要素の子要素を取得する
     * ルートレベルの場合は選択中のファイルのみを表示し、
     * 子レベルの場合は親子関係（extends、include、component）を表示する
     *
     * @param {BladeTemplateItem} element - 親要素（ルートレベルの場合はundefined）
     * @returns {Promise<BladeTemplateItem[]>} 子要素の配列
     */
    async getChildren(element) {
        if (!element) {
            // ルートレベル - 選択中のファイルのみを表示（なければ全テンプレートの一覧を表示）
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.blade.php')) {
                // アクティブなBladeファイルが無い場合、ワークスペースのBladeファイルからトップレベルを構築
                try {
                    const files = await this.bladeParser.findBladeFiles();
                    const items = await Promise.all(files.map(async (file) => {
                        const tpl = await this.bladeParser.parseBladeFile(file);
                        return tpl ? new BladeTemplateItem(tpl, vscode.TreeItemCollapsibleState.Collapsed) : null;
                    }));
                    return items.filter((i) => i !== null);
                }
                catch {
                    return [new BladeTemplateItem({
                            filePath: '',
                            fileName: 'Bladeファイルを選択してください',
                            includes: [],
                            includePaths: [],
                            components: [],
                            componentPaths: [],
                            sections: []
                        }, vscode.TreeItemCollapsibleState.None, 'info')];
                }
            }
            const selectedFilePath = activeEditor.document.fileName;
            const template = await this.bladeParser.parseBladeFile(selectedFilePath);
            if (template) {
                return [new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed)];
            }
            return [];
        }
        else {
            // 子レベル - 親子関係を表示
            const relationships = [];
            // @extendsディレクティブの関係を表示
            if (element.template.extends) {
                const extendsPath = element.template.extendsPath || element.template.extends;
                relationships.push(new BladeTemplateItem({
                    filePath: extendsPath,
                    fileName: `Extends: ${element.template.extends}`,
                    includes: [],
                    includePaths: [],
                    components: [],
                    componentPaths: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'extends'));
            }
            // @includeディレクティブの関係を表示
            element.template.includes.forEach((include, index) => {
                const includePath = element.template.includePaths[index] || include;
                relationships.push(new BladeTemplateItem({
                    filePath: includePath,
                    fileName: `Include: ${include}`,
                    includes: [],
                    includePaths: [],
                    components: [],
                    componentPaths: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'include'));
            });
            // @componentディレクティブの関係を表示
            element.template.components.forEach((component, index) => {
                const componentPath = element.template.componentPaths[index] || component;
                relationships.push(new BladeTemplateItem({
                    filePath: componentPath,
                    fileName: `Component: ${component}`,
                    includes: [],
                    includePaths: [],
                    components: [],
                    componentPaths: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'component'));
            });
            return relationships;
        }
    }
}
exports.BladeTemplateProvider = BladeTemplateProvider;
/**
 * 選択中のファイルの完全なツリーを表示するプロバイダークラス
 * 祖先から末端まで、すべての関係を視覚的に表現する
 */
class SelectedFileTreeProvider {
    /**
     * SelectedFileTreeProviderのコンストラクタ
     *
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(bladeParser) {
        this.bladeParser = bladeParser;
        /** ツリーデータの変更を通知するイベントエミッター */
        this._onDidChangeTreeData = new vscode.EventEmitter();
        /** ツリーデータの変更イベント */
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        /** 現在選択中のファイルパス */
        this.selectedFilePath = null;
    }
    /**
     * 選択中のファイルを設定し、ツリーを更新する
     *
     * @param {string} filePath - 選択中のファイルパス
     */
    setSelectedFile(filePath) {
        this.selectedFilePath = filePath;
        this.refresh();
    }
    /**
     * ツリーデータを更新し、UIに変更を通知する
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * ツリーアイテムの表示設定を取得する
     *
     * @param {BladeTreeItem} element - 表示対象のツリーアイテム
     * @returns {vscode.TreeItem} 設定されたツリーアイテム
     */
    getTreeItem(element) {
        const treeItem = new vscode.TreeItem(element.template.fileName, element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        // 選択中のファイルをハイライト表示
        if (element.isSelected) {
            treeItem.label = `🎯 ${element.template.fileName}`;
            treeItem.description = '(選択中)';
            treeItem.iconPath = new vscode.ThemeIcon('star');
        }
        else {
            // アイテムの種類に応じてアイコンを設定
            switch (element.type) {
                case 'extends':
                    treeItem.iconPath = new vscode.ThemeIcon('arrow-up');
                    treeItem.description = `継承元 (L${element.level})`;
                    break;
                case 'include':
                    treeItem.iconPath = new vscode.ThemeIcon('arrow-right');
                    treeItem.description = `インクルード (L${element.level})`;
                    break;
                case 'component':
                    treeItem.iconPath = new vscode.ThemeIcon('symbol-class');
                    treeItem.description = `コンポーネント (L${element.level})`;
                    break;
                default:
                    treeItem.iconPath = new vscode.ThemeIcon('file-code');
                    treeItem.description = `ルート (L${element.level})`;
            }
        }
        // ツールチップとファイルを開くコマンドを設定
        treeItem.tooltip = element.template.filePath;
        if (this.isAbsolutePath(element.template.filePath)) {
            treeItem.command = {
                command: 'laravel-blade-visualizer.openVisualizerForFile',
                title: 'Visualize Blade Relationships',
                arguments: [element.template.filePath]
            };
        }
        return treeItem;
    }
    /**
     * 指定された要素の子要素を取得する
     *
     * @param {BladeTreeItem} element - 親要素（ルートレベルの場合はundefined）
     * @returns {Promise<BladeTreeItem[]>} 子要素の配列
     */
    async getChildren(element) {
        if (!element) {
            // ルートレベル - 選択中のファイルの完全なツリーを表示
            if (!this.selectedFilePath) {
                return [];
            }
            const completeTree = await this.bladeParser.buildCompleteTree(this.selectedFilePath);
            return completeTree ? [completeTree] : [];
        }
        else {
            // 子レベル - 子要素を返す
            return element.children;
        }
    }
    /**
     * パスが絶対パスかどうかを判定する
     *
     * @param {string} filePath - 判定対象のファイルパス
     * @returns {boolean} 絶対パスの場合はtrue、相対パスの場合はfalse
     */
    isAbsolutePath(filePath) {
        return path.isAbsolute(filePath) && filePath.includes('.blade.php');
    }
}
exports.SelectedFileTreeProvider = SelectedFileTreeProvider;
/**
 * VSCodeのツリービューに表示されるBladeテンプレートアイテムクラス
 * テンプレートファイルとその関係性を視覚的に表現する
 */
class BladeTemplateItem extends vscode.TreeItem {
    /**
     * BladeTemplateItemのコンストラクタ
     *
     * @param {BladeTemplate} template - 表示対象のBladeテンプレート
     * @param {vscode.TreeItemCollapsibleState} collapsibleState - ツリーアイテムの展開状態
     * @param {string} type - アイテムの種類（'template'、'extends'、'include'、'component'）
     */
    constructor(template, collapsibleState, type = 'template') {
        super(template.fileName, collapsibleState);
        this.template = template;
        this.collapsibleState = collapsibleState;
        this.type = type;
        // ツールチップと説明を設定
        this.tooltip = template.filePath;
        this.description = template.filePath ? template.filePath : '';
        // アイテムの種類に応じてアイコンを設定
        switch (type) {
            case 'extends':
                this.iconPath = new vscode.ThemeIcon('arrow-up');
                break;
            case 'include':
                this.iconPath = new vscode.ThemeIcon('arrow-right');
                break;
            case 'component':
                this.iconPath = new vscode.ThemeIcon('symbol-class');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('file-code');
        }
        // ファイルパスが実際のファイルパス（絶対パス）の場合のみ、ファイルを開くコマンドを設定
        if (this.isAbsolutePath(template.filePath)) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(template.filePath)]
            };
        }
        else {
            // 相対パスの場合はツールチップに警告を表示
            this.tooltip = `${template.filePath}\n⚠️ ファイルが見つかりません`;
            this.description = `${template.filePath} (not found)`;
        }
    }
    /**
     * パスが絶対パスかどうかを判定する
     *
     * @param {string} filePath - 判定対象のファイルパス
     * @returns {boolean} 絶対パスの場合はtrue、相対パスの場合はfalse
     */
    isAbsolutePath(filePath) {
        return path.isAbsolute(filePath) && filePath.includes('.blade.php');
    }
}
exports.BladeTemplateItem = BladeTemplateItem;
//# sourceMappingURL=BladeTemplateProvider.js.map
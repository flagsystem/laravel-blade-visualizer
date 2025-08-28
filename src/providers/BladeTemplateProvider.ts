import * as path from 'path';
import * as vscode from 'vscode';
import { BladeParser, BladeTemplate, BladeTreeItem } from '../parsers/BladeParser';

/**
 * VSCodeのツリービューにBladeテンプレートの親子関係を表示するプロバイダークラス
 * TreeDataProviderインターフェースを実装し、Bladeテンプレートの階層構造を視覚的に表現する
 */
export class BladeTemplateProvider implements vscode.TreeDataProvider<BladeTemplateItem> {
    /** ツリーデータの変更を通知するイベントエミッター */
    private _onDidChangeTreeData: vscode.EventEmitter<BladeTemplateItem | undefined | null | void> = new vscode.EventEmitter<BladeTemplateItem | undefined | null | void>();
    /** ツリーデータの変更イベント */
    readonly onDidChangeTreeData: vscode.Event<BladeTemplateItem | undefined | null | void> = this._onDidChangeTreeData.event;

    /**
     * BladeTemplateProviderのコンストラクタ
     * 
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(private bladeParser: BladeParser) { }

    /**
     * ツリーデータを更新し、UIに変更を通知する
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * ツリーアイテムの表示設定を取得する
     * 
     * @param {BladeTemplateItem} element - 表示対象のツリーアイテム
     * @returns {vscode.TreeItem} 設定されたツリーアイテム
     */
    getTreeItem(element: BladeTemplateItem): vscode.TreeItem {
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
    async getChildren(element?: BladeTemplateItem): Promise<BladeTemplateItem[]> {
        if (!element) {
            // ルートレベル - 選択中のファイルのみを表示
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.blade.php')) {
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

            const selectedFilePath = activeEditor.document.fileName;
            const template = await this.bladeParser.parseBladeFile(selectedFilePath);
            if (template) {
                return [new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed)];
            }

            return [];
        } else {
            // 子レベル - 親子関係を表示
            const relationships: BladeTemplateItem[] = [];

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

/**
 * 選択中のファイルの完全なツリーを表示するプロバイダークラス
 * 祖先から末端まで、すべての関係を視覚的に表現する
 */
export class SelectedFileTreeProvider implements vscode.TreeDataProvider<BladeTreeItem> {
    /** ツリーデータの変更を通知するイベントエミッター */
    private _onDidChangeTreeData: vscode.EventEmitter<BladeTreeItem | undefined | null | void> = new vscode.EventEmitter<BladeTreeItem | undefined | null | void>();
    /** ツリーデータの変更イベント */
    readonly onDidChangeTreeData: vscode.Event<BladeTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    /** 現在選択中のファイルパス */
    private selectedFilePath: string | null = null;

    /**
     * SelectedFileTreeProviderのコンストラクタ
     * 
     * @param {BladeParser} bladeParser - Bladeテンプレートを解析するパーサーインスタンス
     */
    constructor(private bladeParser: BladeParser) { }

    /**
     * 選択中のファイルを設定し、ツリーを更新する
     * 
     * @param {string} filePath - 選択中のファイルパス
     */
    setSelectedFile(filePath: string): void {
        this.selectedFilePath = filePath;
        this.refresh();
    }

    /**
     * ツリーデータを更新し、UIに変更を通知する
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * ツリーアイテムの表示設定を取得する
     * 
     * @param {BladeTreeItem} element - 表示対象のツリーアイテム
     * @returns {vscode.TreeItem} 設定されたツリーアイテム
     */
    getTreeItem(element: BladeTreeItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.template.fileName,
            element.children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );

        // 選択中のファイルをハイライト表示
        if (element.isSelected) {
            treeItem.label = `🎯 ${element.template.fileName}`;
            treeItem.description = '(選択中)';
            treeItem.iconPath = new vscode.ThemeIcon('star');
        } else {
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
    async getChildren(element?: BladeTreeItem): Promise<BladeTreeItem[]> {
        if (!element) {
            // ルートレベル - 選択中のファイルの完全なツリーを表示
            if (!this.selectedFilePath) {
                return [];
            }

            const completeTree = await this.bladeParser.buildCompleteTree(this.selectedFilePath);
            return completeTree ? [completeTree] : [];
        } else {
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
    private isAbsolutePath(filePath: string): boolean {
        return path.isAbsolute(filePath) && filePath.includes('.blade.php');
    }
}

/**
 * VSCodeのツリービューに表示されるBladeテンプレートアイテムクラス
 * テンプレートファイルとその関係性を視覚的に表現する
 */
export class BladeTemplateItem extends vscode.TreeItem {
    /**
     * BladeTemplateItemのコンストラクタ
     * 
     * @param {BladeTemplate} template - 表示対象のBladeテンプレート
     * @param {vscode.TreeItemCollapsibleState} collapsibleState - ツリーアイテムの展開状態
     * @param {string} type - アイテムの種類（'template'、'extends'、'include'、'component'）
     */
    constructor(
        public readonly template: BladeTemplate,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string = 'template'
    ) {
        super(template.fileName, collapsibleState);

        // ツールチップと説明を設定
        this.tooltip = template.filePath;
        this.description = template.filePath;

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
                command: 'workbench.view.extension.bladeVisualizer',
                title: 'Laravel Blade Visualizer を開く'
            };
        } else {
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
    private isAbsolutePath(filePath: string): boolean {
        return path.isAbsolute(filePath) && filePath.includes('.blade.php');
    }
} 

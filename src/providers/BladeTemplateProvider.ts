import * as vscode from 'vscode';
import { BladeParser, BladeTemplate } from '../parsers/BladeParser';

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
     * ルートレベルの場合はすべてのBladeファイルを表示し、
     * 子レベルの場合は親子関係（extends、include、component）を表示する
     * 
     * @param {BladeTemplateItem} element - 親要素（ルートレベルの場合はundefined）
     * @returns {Promise<BladeTemplateItem[]>} 子要素の配列
     */
    async getChildren(element?: BladeTemplateItem): Promise<BladeTemplateItem[]> {
        if (!element) {
            // ルートレベル - すべてのBladeファイルを表示
            const bladeFiles = await this.bladeParser.findBladeFiles();
            const templates: BladeTemplateItem[] = [];

            // 各Bladeファイルを解析してテンプレートアイテムを作成
            for (const filePath of bladeFiles) {
                const template = await this.bladeParser.parseBladeFile(filePath);
                if (template) {
                    templates.push(new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed));
                }
            }

            return templates;
        } else {
            // 子レベル - 親子関係を表示
            const relationships: BladeTemplateItem[] = [];

            // @extendsディレクティブの関係を表示
            if (element.template.extends) {
                relationships.push(new BladeTemplateItem({
                    filePath: element.template.extends,
                    fileName: `Extends: ${element.template.extends}`,
                    includes: [],
                    components: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'extends'));
            }

            // @includeディレクティブの関係を表示
            element.template.includes.forEach(include => {
                relationships.push(new BladeTemplateItem({
                    filePath: include,
                    fileName: `Include: ${include}`,
                    includes: [],
                    components: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'include'));
            });

            // @componentディレクティブの関係を表示
            element.template.components.forEach(component => {
                relationships.push(new BladeTemplateItem({
                    filePath: component,
                    fileName: `Component: ${component}`,
                    includes: [],
                    components: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'component'));
            });

            return relationships;
        }
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

        // ファイルを開くコマンドを設定
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [vscode.Uri.file(template.filePath)]
        };
    }
} 

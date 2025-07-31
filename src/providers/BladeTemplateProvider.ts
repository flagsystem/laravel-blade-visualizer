import * as vscode from 'vscode';
import { BladeParser, BladeTemplate } from '../parsers/BladeParser';

export class BladeTemplateProvider implements vscode.TreeDataProvider<BladeTemplateItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BladeTemplateItem | undefined | null | void> = new vscode.EventEmitter<BladeTemplateItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BladeTemplateItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private bladeParser: BladeParser) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BladeTemplateItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: BladeTemplateItem): Promise<BladeTemplateItem[]> {
        if (!element) {
            // Root level - show all Blade files
            const bladeFiles = await this.bladeParser.findBladeFiles();
            const templates: BladeTemplateItem[] = [];

            for (const filePath of bladeFiles) {
                const template = await this.bladeParser.parseBladeFile(filePath);
                if (template) {
                    templates.push(new BladeTemplateItem(template, vscode.TreeItemCollapsibleState.Collapsed));
                }
            }

            return templates;
        } else {
            // Child level - show relationships
            const relationships: BladeTemplateItem[] = [];

            if (element.template.extends) {
                relationships.push(new BladeTemplateItem({
                    filePath: element.template.extends,
                    fileName: `Extends: ${element.template.extends}`,
                    includes: [],
                    components: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'extends'));
            }

            element.template.includes.forEach(include => {
                relationships.push(new BladeTemplateItem({
                    filePath: include,
                    fileName: `Include: ${include}`,
                    includes: [],
                    components: [],
                    sections: []
                }, vscode.TreeItemCollapsibleState.None, 'include'));
            });

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

export class BladeTemplateItem extends vscode.TreeItem {
    constructor(
        public readonly template: BladeTemplate,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string = 'template'
    ) {
        super(template.fileName, collapsibleState);

        this.tooltip = template.filePath;
        this.description = template.filePath;

        // Set icon based on type
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

        // Add command to open file
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [vscode.Uri.file(template.filePath)]
        };
    }
} 

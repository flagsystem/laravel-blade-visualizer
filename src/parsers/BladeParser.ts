import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Bladeテンプレートの構造を表すインターフェース
 * テンプレートファイルの親子関係とコンポーネント情報を格納する
 */
export interface BladeTemplate {
    /** テンプレートファイルの絶対パス */
    filePath: string;
    /** テンプレートファイル名 */
    fileName: string;
    /** 継承元のテンプレート名（@extendsディレクティブ） */
    extends?: string;
    /** 継承元のテンプレートの実際のファイルパス */
    extendsPath?: string;
    /** インクルードされるテンプレート名の配列（@includeディレクティブ） */
    includes: string[];
    /** インクルードされるテンプレートの実際のファイルパスの配列 */
    includePaths: string[];
    /** 使用されるコンポーネント名の配列（@componentディレクティブ） */
    components: string[];
    /** 使用されるコンポーネントの実際のファイルパスの配列 */
    componentPaths: string[];
    /** 定義されるセクション名の配列（@sectionディレクティブ） */
    sections: string[];
}

/**
 * 完全なツリー構造を表すインターフェース
 * 選択中のファイルを中心とした祖先から末端までの関係を表現する
 */
export interface BladeTreeItem {
    /** テンプレート情報 */
    template: BladeTemplate;
    /** 親要素（継承元） */
    parent?: BladeTreeItem;
    /** 子要素（継承先、インクルード先、コンポーネント） */
    children: BladeTreeItem[];
    /** アイテムの種類 */
    type: 'root' | 'extends' | 'include' | 'component';
    /** 階層レベル */
    level: number;
    /** 選択中のファイルかどうか */
    isSelected: boolean;
}

/**
 * Laravel Bladeテンプレートファイルを解析するクラス
 * Bladeディレクティブ（@extends、@include、@component、@section）を解析し、
 * テンプレート間の親子関係を抽出する
 */
export class BladeParser {
    /** @extendsディレクティブを検出する正規表現 */
    private readonly extendsRegex = /@extends\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    /** @includeディレクティブを検出する正規表現 */
    private readonly includeRegex = /@include\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    /** @componentディレクティブを検出する正規表現 */
    private readonly componentRegex = /@component\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    /** @sectionディレクティブを検出する正規表現 */
    private readonly sectionRegex = /@section\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    /**
     * Bladeテンプレートファイルを解析し、テンプレート構造を抽出する
     * 
     * @param {string} filePath - 解析対象のBladeファイルのパス
     * @returns {Promise<BladeTemplate | null>} 解析結果のテンプレート構造、エラー時はnull
     * @throws {Error} ファイル読み込みエラー
     */
    async parseBladeFile(filePath: string): Promise<BladeTemplate | null> {
        try {
            // VSCodeのドキュメントAPIを使用してファイルを読み込む
            const document = await vscode.workspace.openTextDocument(filePath);
            const content = document.getText();

            // テンプレート構造の初期化
            const template: BladeTemplate = {
                filePath,
                fileName: path.basename(filePath),
                includes: [],
                includePaths: [],
                components: [],
                componentPaths: [],
                sections: []
            };

            // @extendsディレクティブの解析
            const extendsMatch = this.extendsRegex.exec(content);
            if (extendsMatch) {
                template.extends = extendsMatch[1];
                template.extendsPath = this.resolveTemplatePath(extendsMatch[1], filePath);
            }

            // @includeディレクティブの解析（複数存在する可能性があるためループ処理）
            let includeMatch;
            while ((includeMatch = this.includeRegex.exec(content)) !== null) {
                template.includes.push(includeMatch[1]);
                const resolvedPath = this.resolveTemplatePath(includeMatch[1], filePath);
                if (resolvedPath) {
                    template.includePaths.push(resolvedPath);
                }
            }

            // @componentディレクティブの解析（複数存在する可能性があるためループ処理）
            let componentMatch;
            while ((componentMatch = this.componentRegex.exec(content)) !== null) {
                template.components.push(componentMatch[1]);
                const resolvedPath = this.resolveTemplatePath(componentMatch[1], filePath);
                if (resolvedPath) {
                    template.componentPaths.push(resolvedPath);
                }
            }

            // @sectionディレクティブの解析（複数存在する可能性があるためループ処理）
            let sectionMatch;
            while ((sectionMatch = this.sectionRegex.exec(content)) !== null) {
                template.sections.push(sectionMatch[1]);
            }

            return template;
        } catch (error) {
            console.error(`Error parsing Blade file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 選択中のファイルの完全なツリーを構築する
     * 祖先から末端まで、すべての関係を解析してツリー構造を作成する
     * 
     * @param {string} selectedFilePath - 選択中のBladeファイルのパス
     * @returns {Promise<BladeTreeItem | null>} 完全なツリー構造、エラー時はnull
     */
    async buildCompleteTree(selectedFilePath: string): Promise<BladeTreeItem | null> {
        try {
            // 選択中のファイルを解析
            const selectedTemplate = await this.parseBladeFile(selectedFilePath);
            if (!selectedTemplate) {
                return null;
            }

            // ルートアイテムを作成
            const rootItem: BladeTreeItem = {
                template: selectedTemplate,
                children: [],
                type: 'root',
                level: 0,
                isSelected: true
            };

            // 祖先（extends）を再帰的に探索
            await this.buildAncestorTree(rootItem, selectedTemplate, 1);

            // 子要素（includes、components）を再帰的に探索
            await this.buildDescendantTree(rootItem, selectedTemplate, 1);

            return rootItem;
        } catch (error) {
            console.error(`Error building complete tree for ${selectedFilePath}:`, error);
            return null;
        }
    }

    /**
     * 祖先（extends）のツリーを構築する
     * 
     * @param {BladeTreeItem} parentItem - 親アイテム
     * @param {BladeTemplate} template - 現在のテンプレート
     * @param {number} level - 現在の階層レベル
     */
    private async buildAncestorTree(parentItem: BladeTreeItem, template: BladeTemplate, level: number): Promise<void> {
        if (!template.extends || !template.extendsPath) {
            return;
        }

        // 継承元のテンプレートを解析
        const extendsTemplate = await this.parseBladeFile(template.extendsPath);
        if (!extendsTemplate) {
            return;
        }

        // 継承元のアイテムを作成
        const extendsItem: BladeTreeItem = {
            template: extendsTemplate,
            parent: parentItem,
            children: [],
            type: 'extends',
            level,
            isSelected: false
        };

        // 親アイテムに追加
        parentItem.children.push(extendsItem);

        // さらに上位の継承元がある場合は再帰的に探索
        if (extendsTemplate.extends && extendsTemplate.extendsPath) {
            await this.buildAncestorTree(extendsItem, extendsTemplate, level + 1);
        }
    }

    /**
     * 子要素（includes、components）のツリーを構築する
     * 
     * @param {BladeTreeItem} parentItem - 親アイテム
     * @param {BladeTemplate} template - 現在のテンプレート
     * @param {number} level - 現在の階層レベル
     */
    private async buildDescendantTree(parentItem: BladeTreeItem, template: BladeTemplate, level: number): Promise<void> {
        // インクルード先を処理
        for (let i = 0; i < template.includes.length; i++) {
            const includeName = template.includes[i];
            const includePath = template.includePaths[i];

            if (includePath) {
                const includeTemplate = await this.parseBladeFile(includePath);
                if (includeTemplate) {
                    const includeItem: BladeTreeItem = {
                        template: includeTemplate,
                        parent: parentItem,
                        children: [],
                        type: 'include',
                        level,
                        isSelected: false
                    };

                    parentItem.children.push(includeItem);

                    // インクルード先の子要素も再帰的に探索
                    await this.buildDescendantTree(includeItem, includeTemplate, level + 1);
                }
            }
        }

        // コンポーネントを処理
        for (let i = 0; i < template.components.length; i++) {
            const componentName = template.components[i];
            const componentPath = template.componentPaths[i];

            if (componentPath) {
                const componentTemplate = await this.parseBladeFile(componentPath);
                if (componentTemplate) {
                    const componentItem: BladeTreeItem = {
                        template: componentTemplate,
                        parent: parentItem,
                        children: [],
                        type: 'component',
                        level,
                        isSelected: false
                    };

                    parentItem.children.push(componentItem);

                    // コンポーネントの子要素も再帰的に探索
                    await this.buildDescendantTree(componentItem, componentTemplate, level + 1);
                }
            }
        }
    }

    /**
     * ワークスペース内のすべてのBladeファイル（.blade.php）を検索する
     * 
     * @returns {Promise<string[]>} 検索されたBladeファイルの絶対パスの配列
     */
    async findBladeFiles(): Promise<string[]> {
        const files = await vscode.workspace.findFiles('**/*.blade.php');
        return files.map(file => file.fsPath);
    }

    /**
     * テンプレート名から実際のファイルパスを解決する
     * Laravelのテンプレート命名規則に従って、相対パスや絶対パスを適切に解決する
     * 
     * @param {string} templateName - 解決対象のテンプレート名（例：'common.layouts.blank'）
     * @param {string} currentFilePath - 現在のファイルパス（基準となるパス）
     * @returns {string} 解決されたファイルパス、見つからない場合は空文字列
     */
    resolveTemplatePath(templateName: string, currentFilePath: string): string {
        // .blade.php拡張子が含まれている場合は除去
        const cleanName = templateName.replace(/\.blade\.php$/, '');

        // ワークスペースのルートディレクトリを取得
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return '';
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;

        // Laravelの標準的なビューディレクトリパターンを定義
        const possiblePaths = [
            // 直接的なパス（resources/views/から始まる）
            path.join(workspaceRoot, 'resources', 'views', `${cleanName}.blade.php`),
            // ドット区切りのパスをスラッシュ区切りに変換
            path.join(workspaceRoot, 'resources', 'views', cleanName.replace(/\./g, '/') + '.blade.php'),
            // 現在のファイルからの相対パス
            path.resolve(path.dirname(currentFilePath), `${cleanName}.blade.php`),
            path.resolve(path.dirname(currentFilePath), cleanName.replace(/\./g, '/') + '.blade.php'),
            // 現在のファイルのディレクトリからの相対パス
            path.resolve(path.dirname(currentFilePath), '..', `${cleanName}.blade.php`),
            path.resolve(path.dirname(currentFilePath), '..', cleanName.replace(/\./g, '/') + '.blade.php')
        ];

        // 各パスパターンを試行し、存在するファイルを返す
        for (const possiblePath of possiblePaths) {
            try {
                if (fs.existsSync(possiblePath)) {
                    return possiblePath;
                }
            } catch (error) {
                // ファイルアクセスエラーは無視して次のパスを試行
                continue;
            }
        }

        return '';
    }
} 

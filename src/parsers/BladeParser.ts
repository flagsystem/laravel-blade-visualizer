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
    type: 'root' | 'extends' | 'include' | 'component' | 'usedBy' | 'info';
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

    /** 解析結果のキャッシュ（ファイルパス→テンプレート） */
    private templateCache: Map<string, BladeTemplate | null> = new Map();
    /** テンプレート名解決のメモ化キャッシュ（key: currentDir::name → resolvedPath） */
    private resolveCache: Map<string, string> = new Map();

    /** 正引き参照インデックス（filePath → {extends, includePaths, componentPaths}） */
    private forwardIndex: Map<string, { extendsPath?: string; includePaths: string[]; componentPaths: string[] }> = new Map();
    /** 逆引き参照インデックス（filePath → このファイルを参照するファイル集合） */
    private reverseIndex: Map<string, Set<string>> = new Map();
    /** インデックス構築済みフラグ */
    private indexBuilt = false;
    /** インデックス再構築のデバウンス用タイマー */
    private indexRebuildTimer: NodeJS.Timeout | null = null;

    /**
     * 指定ファイルのキャッシュとインデックスを無効化する
     * 
     * @param {string} filePath - 無効化対象のBladeファイルパス
     */
    invalidate(filePath: string): void {
        this.templateCache.delete(filePath);
        // 正引き・逆引きから当該ファイルに関する情報を削除
        this.forwardIndex.delete(filePath);
        for (const [, dependents] of this.reverseIndex) {
            dependents.delete(filePath);
        }
        this.indexBuilt = false;
        this.scheduleIndexRebuild();
    }

    /**
     * インデックスの再構築をデバウンスしてスケジュールする
     */
    private scheduleIndexRebuild(): void {
        if (this.indexRebuildTimer) {
            clearTimeout(this.indexRebuildTimer);
        }
        this.indexRebuildTimer = setTimeout(() => {
            this.buildIndex().catch(err => console.error('Index rebuild failed:', err));
        }, 300);
    }

    /**
     * 全Bladeファイルを走査し、参照関係のインデックスを構築する
     */
    async buildIndex(): Promise<void> {
        const files = await this.findBladeFiles();
        this.forwardIndex.clear();
        this.reverseIndex.clear();

        for (const file of files) {
            const tpl = await this.parseBladeFile(file);
            if (!tpl) { continue; }
            this.forwardIndex.set(file, {
                extendsPath: tpl.extendsPath,
                includePaths: tpl.includePaths.filter(Boolean),
                componentPaths: tpl.componentPaths.filter(Boolean)
            });
        }

        // 逆引き生成
        for (const [from, refs] of this.forwardIndex) {
            const addReverse = (to?: string) => {
                if (!to) { return; }
                if (!this.reverseIndex.has(to)) { this.reverseIndex.set(to, new Set()); }
                this.reverseIndex.get(to)!.add(from);
            };
            addReverse(refs.extendsPath);
            refs.includePaths.forEach(addReverse);
            refs.componentPaths.forEach(addReverse);
        }

        this.indexBuilt = true;
    }

    /**
     * インデックスが未構築の場合のみ構築する
     */
    private async ensureIndex(): Promise<void> {
        if (!this.indexBuilt) {
            await this.buildIndex();
        }
    }

    /**
     * Bladeテンプレートファイルを解析し、テンプレート構造を抽出する
     * 
     * @param {string} filePath - 解析対象のBladeファイルのパス
     * @returns {Promise<BladeTemplate | null>} 解析結果のテンプレート構造、エラー時はnull
     * @throws {Error} ファイル読み込みエラー
     */
    async parseBladeFile(filePath: string): Promise<BladeTemplate | null> {
        // キャッシュヒット
        if (this.templateCache.has(filePath)) {
            return this.templateCache.get(filePath) ?? null;
        }
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

            // @componentディレクティブの解析
            let componentMatch;
            while ((componentMatch = this.componentRegex.exec(content)) !== null) {
                template.components.push(componentMatch[1]);
                const resolvedPath = this.resolveTemplatePath(componentMatch[1], filePath);
                if (resolvedPath) {
                    template.componentPaths.push(resolvedPath);
                }
            }

            // 必要なら@section等もここで解析（省略）

            // キャッシュ保存
            this.templateCache.set(filePath, template);
            return template;
        } catch (error) {
            console.error(`Error parsing Blade file ${filePath}:`, error);
            this.templateCache.set(filePath, null);
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

            // 最上位の祖先までextendsチェーンを辿って配列化（上位→下位の順）
            const extendsChain: BladeTemplate[] = [];
            let cursor: BladeTemplate | null = selectedTemplate;
            while (cursor) {
                extendsChain.unshift(cursor); // 常に先頭に追加し、最上位がindex 0になる
                if (!cursor.extendsPath) {
                    break;
                }
                const parent: BladeTemplate | null = await this.parseBladeFile(cursor.extendsPath);
                if (!parent) {
                    break;
                }
                cursor = parent;
            }

            // チェーンの先頭（最上位祖先）をルートにする
            const topMost = extendsChain[0];
            const rootItem: BladeTreeItem = {
                template: topMost,
                children: [],
                type: 'root',
                level: 0,
                isSelected: topMost.filePath === selectedFilePath
            };

            // 祖先チェーンを順に紐付け（type: 'extends'）。選択中のファイルにフラグを立てる
            let prevItem = rootItem;
            for (let i = 1; i < extendsChain.length; i++) {
                const t = extendsChain[i];
                const item: BladeTreeItem = {
                    template: t,
                    parent: prevItem,
                    children: [],
                    type: 'extends',
                    level: i,
                    isSelected: t.filePath === selectedFilePath
                };
                prevItem.children.push(item);
                prevItem = item;
            }

            // 各チェーン要素について、インクルード/コンポーネントの子要素を再帰構築
            // ルート（レベル0）は子をレベル1から開始
            let chainCursor: BladeTreeItem | undefined = rootItem;
            let level = 1;
            while (chainCursor) {
                await this.buildDescendantTree(chainCursor, chainCursor.template, level);
                // チェーンの次要素（extends）へ
                chainCursor = chainCursor.children.find(c => c.type === 'extends');
                level += 1;
            }

            // 逆依存（このファイルを利用しているファイル）を収集し、末尾にsyntheticグループとして追加
            const dependents = await this.findDependents(selectedFilePath);
            if (dependents.length > 0) {
                const attachTo = this.findNodeByPath(rootItem, selectedFilePath) || rootItem;
                dependents.forEach(dep => {
                    attachTo.children.push({
                        template: dep,
                        parent: attachTo,
                        children: [],
                        type: 'usedBy',
                        level: level,
                        isSelected: false
                    });
                });
            }

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

        // 継承元テンプレートに対しても、インクルードとコンポーネントの子要素を再帰的に構築
        await this.buildDescendantTree(extendsItem, extendsTemplate, level + 1);

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
        const cleanName = templateName.replace(/\.blade\.php$/, '');
        const cacheKey = `${path.dirname(currentFilePath)}::${cleanName}`;
        const cached = this.resolveCache.get(cacheKey);
        if (cached !== undefined) { return cached; }

        // ワークスペースのルートディレクトリを取得
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.resolveCache.set(cacheKey, '');
            return '';
        }
        const workspaceRoot = workspaceFolders[0].uri.fsPath;

        // 試行パス一覧
        const possiblePaths = [
            path.join(workspaceRoot, 'resources', 'views', `${cleanName}.blade.php`),
            path.join(workspaceRoot, 'resources', 'views', cleanName.replace(/\./g, '/') + '.blade.php'),
            path.resolve(path.dirname(currentFilePath), `${cleanName}.blade.php`),
            path.resolve(path.dirname(currentFilePath), cleanName.replace(/\./g, '/') + '.blade.php'),
            path.resolve(path.dirname(currentFilePath), '..', `${cleanName}.blade.php`),
            path.resolve(path.dirname(currentFilePath), '..', cleanName.replace(/\./g, '/') + '.blade.php')
        ];

        for (const pth of possiblePaths) {
            try {
                if (fs.existsSync(pth)) {
                    this.resolveCache.set(cacheKey, pth);
                    return pth;
                }
            } catch {
                continue;
            }
        }
        this.resolveCache.set(cacheKey, '');
        return '';
    }

    /**
     * 指定ファイルを利用しているBladeファイル（@extends/@include/@component）を検索する
     * 
     * @param {string} targetFilePath - 依存関係を調査する対象ファイルのパス
     * @returns {Promise<BladeTemplate[]>} 対象ファイルを利用しているテンプレート一覧
     */
    async findDependents(targetFilePath: string): Promise<BladeTemplate[]> {
        await this.ensureIndex();
        const fromSet = this.reverseIndex.get(targetFilePath);
        if (!fromSet || fromSet.size === 0) { return []; }
        const out: BladeTemplate[] = [];
        for (const from of fromSet) {
            const tpl = await this.parseBladeFile(from);
            if (tpl) { out.push(tpl); }
        }
        return out;
    }

    private findNodeByPath(node: BladeTreeItem, targetPath: string): BladeTreeItem | undefined {
        if (node.template.filePath === targetPath) { return node; }
        for (const child of node.children) {
            const hit = this.findNodeByPath(child, targetPath);
            if (hit) { return hit; }
        }
        return undefined;
    }
} 

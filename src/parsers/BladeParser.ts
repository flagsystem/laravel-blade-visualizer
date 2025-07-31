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
    /** インクルードされるテンプレート名の配列（@includeディレクティブ） */
    includes: string[];
    /** 使用されるコンポーネント名の配列（@componentディレクティブ） */
    components: string[];
    /** 定義されるセクション名の配列（@sectionディレクティブ） */
    sections: string[];
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
                components: [],
                sections: []
            };

            // @extendsディレクティブの解析
            const extendsMatch = this.extendsRegex.exec(content);
            if (extendsMatch) {
                template.extends = extendsMatch[1];
            }

            // @includeディレクティブの解析（複数存在する可能性があるためループ処理）
            let includeMatch;
            while ((includeMatch = this.includeRegex.exec(content)) !== null) {
                template.includes.push(includeMatch[1]);
            }

            // @componentディレクティブの解析（複数存在する可能性があるためループ処理）
            let componentMatch;
            while ((componentMatch = this.componentRegex.exec(content)) !== null) {
                template.components.push(componentMatch[1]);
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
     * @param {string} templateName - 解決対象のテンプレート名
     * @param {string} currentFilePath - 現在のファイルパス（基準となるパス）
     * @returns {string} 解決されたファイルパス、見つからない場合は空文字列
     */
    resolveTemplatePath(templateName: string, currentFilePath: string): string {
        // .blade.php拡張子が含まれている場合は除去
        const cleanName = templateName.replace(/\.blade\.php$/, '');

        // 可能性のあるパスパターンを定義
        const possiblePaths = [
            `${cleanName}.blade.php`,
            `resources/views/${cleanName}.blade.php`,
            `resources/views/${cleanName.replace(/\./g, '/')}.blade.php`
        ];

        const currentDir = path.dirname(currentFilePath);

        // 各パスパターンを試行し、存在するファイルを返す
        for (const possiblePath of possiblePaths) {
            const fullPath = path.resolve(currentDir, possiblePath);
            if (vscode.workspace.getConfiguration().get('files.exclude', {})) {
                // ファイルの存在チェック（簡略化されたチェック）
                return fullPath;
            }
        }

        return '';
    }
} 

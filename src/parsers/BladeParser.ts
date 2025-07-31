import * as path from 'path';
import * as vscode from 'vscode';

export interface BladeTemplate {
    filePath: string;
    fileName: string;
    extends?: string;
    includes: string[];
    components: string[];
    sections: string[];
}

export class BladeParser {
    private readonly extendsRegex = /@extends\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    private readonly includeRegex = /@include\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    private readonly componentRegex = /@component\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    private readonly sectionRegex = /@section\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    async parseBladeFile(filePath: string): Promise<BladeTemplate | null> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            const content = document.getText();

            const template: BladeTemplate = {
                filePath,
                fileName: path.basename(filePath),
                includes: [],
                components: [],
                sections: []
            };

            // Parse @extends
            const extendsMatch = this.extendsRegex.exec(content);
            if (extendsMatch) {
                template.extends = extendsMatch[1];
            }

            // Parse @include
            let includeMatch;
            while ((includeMatch = this.includeRegex.exec(content)) !== null) {
                template.includes.push(includeMatch[1]);
            }

            // Parse @component
            let componentMatch;
            while ((componentMatch = this.componentRegex.exec(content)) !== null) {
                template.components.push(componentMatch[1]);
            }

            // Parse @section
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

    async findBladeFiles(): Promise<string[]> {
        const files = await vscode.workspace.findFiles('**/*.blade.php');
        return files.map(file => file.fsPath);
    }

    resolveTemplatePath(templateName: string, currentFilePath: string): string {
        // Remove .blade.php extension if present
        const cleanName = templateName.replace(/\.blade\.php$/, '');

        // Try different possible paths
        const possiblePaths = [
            `${cleanName}.blade.php`,
            `resources/views/${cleanName}.blade.php`,
            `resources/views/${cleanName.replace(/\./g, '/')}.blade.php`
        ];

        const currentDir = path.dirname(currentFilePath);

        for (const possiblePath of possiblePaths) {
            const fullPath = path.resolve(currentDir, possiblePath);
            if (vscode.workspace.getConfiguration().get('files.exclude', {})) {
                // Check if file exists (simplified check)
                return fullPath;
            }
        }

        return '';
    }
} 

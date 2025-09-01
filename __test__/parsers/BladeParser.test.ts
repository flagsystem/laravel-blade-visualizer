import * as assert from 'assert';
import * as vscode from 'vscode';
import { BladeParser } from '../../src/parsers/BladeParser';

/**
 * BladeParserクラスのテストスイート
 * Bladeテンプレートファイルの解析機能をテストする
 */
describe('BladeParser', () => {
    let bladeParser: BladeParser;

    /**
     * 各テストの前に実行されるセットアップ処理
     */
    beforeEach(() => {
        bladeParser = new BladeParser();
    });

    describe('正常系', () => {
        it('test基本的なBladeファイルの解析が正常に動作する', async () => {
            // テスト用のBladeファイル内容
            const mockContent = `
                @extends('layouts.app')
                @section('content')
                    <h1>Hello World</h1>
                @endsection
                @include('partials.header')
                @component('components.alert')
                    <p>Alert message</p>
                @endcomponent
            `;

            // VSCodeのワークスペースAPIをモック化
            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/test.blade.php');

                assert.ok(result);
                assert.strictEqual(result?.extends, 'layouts.app');
                assert.deepStrictEqual(result?.includes, ['partials.header']);
                assert.deepStrictEqual(result?.components, ['components.alert']);
                assert.deepStrictEqual(result?.sections, ['content']);
            } finally {
                // モックを元に戻す
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test複数のincludeディレクティブが正常に解析される', async () => {
            const mockContent = `
                @include('partials.header')
                @include('partials.footer')
                @include('partials.sidebar')
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/multiple-includes.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.includes, ['partials.header', 'partials.footer', 'partials.sidebar']);
                assert.deepStrictEqual(result?.includePaths, []);
                assert.deepStrictEqual(result?.components, []);
                assert.deepStrictEqual(result?.sections, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test複数のcomponentディレクティブが正常に解析される', async () => {
            const mockContent = `
                @component('components.alert')
                    <p>Alert message</p>
                @endcomponent
                @component('components.button')
                    <button>Click me</button>
                @endcomponent
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/multiple-components.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.components, ['components.alert', 'components.button']);
                assert.deepStrictEqual(result?.componentPaths, []);
                assert.deepStrictEqual(result?.includes, []);
                assert.deepStrictEqual(result?.sections, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test複数のsectionディレクティブが正常に解析される', async () => {
            const mockContent = `
                @section('title')
                    Page Title
                @endsection
                @section('content')
                    Page Content
                @endsection
                @section('scripts')
                    <script>console.log('test');</script>
                @endsection
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/multiple-sections.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.sections, ['title', 'content', 'scripts']);
                assert.deepStrictEqual(result?.includes, []);
                assert.deepStrictEqual(result?.components, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });
    });

    describe('異常系', () => {
        it('test不正なディレクティブ構文でエラーが発生しない', async () => {
            const mockContent = `
                @extends('layouts.app
                @include('partials.header
                @component('components.alert
                @section('content
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/invalid.blade.php');

                assert.ok(result);
                // 不正な構文は無視されるため、配列は空になる
                assert.strictEqual(result?.extends, undefined);
                assert.deepStrictEqual(result?.includes, []);
                assert.deepStrictEqual(result?.components, []);
                assert.deepStrictEqual(result?.sections, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('testファイルが存在しない場合にエラーが発生しない', async () => {
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => {
                throw new Error('File not found');
            };

            try {
                const result = await bladeParser.parseBladeFile('/test/path/nonexistent.blade.php');
                assert.strictEqual(result, null);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });
    });

    describe('境界値テスト', () => {
        it('test空のファイルが正常に処理される', async () => {
            const mockContent = '';

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/empty.blade.php');

                assert.ok(result);
                assert.strictEqual(result?.extends, undefined);
                assert.deepStrictEqual(result?.includes, []);
                assert.deepStrictEqual(result?.components, []);
                assert.deepStrictEqual(result?.sections, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('testディレクティブが存在しないファイルが正常に処理される', async () => {
            const mockContent = `
                <html>
                    <head>
                        <title>Simple HTML</title>
                    </head>
                    <body>
                        <h1>Hello World</h1>
                    </body>
                </html>
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/simple-html.blade.php');

                assert.ok(result);
                assert.strictEqual(result?.extends, undefined);
                assert.deepStrictEqual(result?.includes, []);
                assert.deepStrictEqual(result?.components, []);
                assert.deepStrictEqual(result?.sections, []);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });
    });

    describe('テンプレートパス解決機能', () => {
        it('testLaravelの標準的なビューパスが正しく解決される', () => {
            // ワークスペースのモック化
            const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
            (vscode.workspace as any).workspaceFolders = [{
                uri: { fsPath: '/workspace' }
            }];

            try {
                const result = bladeParser.resolveTemplatePath('common.layouts.blank', '/workspace/resources/views/event/custom/tm/lp.blade.php');

                // 実際のファイルシステムに依存しないため、パスの形式のみチェック
                assert.ok(result.includes('common/layouts/blank.blade.php') || result.includes('common.layouts.blank.blade.php'));
            } finally {
                (vscode.workspace as any).workspaceFolders = originalWorkspaceFolders;
            }
        });

        it('testドット区切りのパスがスラッシュ区切りに正しく変換される', () => {
            const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
            (vscode.workspace as any).workspaceFolders = [{
                uri: { fsPath: '/workspace' }
            }];

            try {
                const result = bladeParser.resolveTemplatePath('layouts.app', '/workspace/resources/views/welcome.blade.php');

                // パスの形式をチェック
                assert.ok(result.includes('layouts/app.blade.php') || result.includes('layouts.app.blade.php'));
            } finally {
                (vscode.workspace as any).workspaceFolders = originalWorkspaceFolders;
            }
        });

        it('test設定のlaravelRootが優先される', () => {
            const originalCfg = vscode.workspace.getConfiguration;
            (vscode.workspace as any).getConfiguration = () => ({
                get: (key: string) => key === 'laravelRoot' ? '/custom/laravel' : ''
            });
            const originalWorkspaceFolders = vscode.workspace.workspaceFolders;
            (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/workspace' } }];

            try {
                const result = bladeParser.resolveTemplatePath('layouts.app', '/workspace/sub/project/resources/views/event/custom/tm/lp.blade.php');
                assert.ok(result.startsWith('/custom/laravel/resources/views'));
            } finally {
                (vscode.workspace as any).getConfiguration = originalCfg;
                (vscode.workspace as any).workspaceFolders = originalWorkspaceFolders;
            }
        });

        it('test自動検出で最寄りのresources/viewsを使う', () => {
            const originalCfg = vscode.workspace.getConfiguration;
            (vscode.workspace as any).getConfiguration = () => ({ get: () => '' });
            const originalExists = require('fs').existsSync;
            // 疑似的に /program/laravel/resources/views が存在することにする
            (require('fs') as any).existsSync = (p: string) => {
                return p === '/program/laravel/resources/views' || originalExists(p);
            };

            try {
                const result = bladeParser.resolveTemplatePath('layouts.app', '/program/laravel/resources/views/event/custom/tm/lp.blade.php');
                assert.ok(result.startsWith('/program/laravel/resources/views'));
            } finally {
                (require('fs') as any).existsSync = originalExists;
                (vscode.workspace as any).getConfiguration = originalCfg;
            }
        });

        it('testextendsの正規表現が複数回の解析でも安定して動作する', async () => {
            const mockContent = `@extends('layouts.base')`;
            const mockDocument = { getText: () => mockContent };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const first = await bladeParser.parseBladeFile('/a.blade.php');
                const second = await bladeParser.parseBladeFile('/b.blade.php');
                assert.strictEqual(first?.extends, 'layouts.base');
                assert.strictEqual(second?.extends, 'layouts.base');
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });
    });
}); 

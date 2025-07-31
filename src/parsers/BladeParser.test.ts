import * as assert from 'assert';
import * as vscode from 'vscode';
import { BladeParser } from './BladeParser';

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
                const result = await bladeParser.parseBladeFile('/test/path/test.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.includes, [
                    'partials.header',
                    'partials.footer',
                    'partials.sidebar'
                ]);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test複数のcomponentディレクティブが正常に解析される', async () => {
            const mockContent = `
                @component('components.alert')
                @endcomponent
                @component('components.button')
                @endcomponent
                @component('components.card')
                @endcomponent
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/test.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.components, [
                    'components.alert',
                    'components.button',
                    'components.card'
                ]);
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
                    Main content
                @endsection
                @section('sidebar')
                    Sidebar content
                @endsection
            `;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/test.blade.php');

                assert.ok(result);
                assert.deepStrictEqual(result?.sections, [
                    'title',
                    'content',
                    'sidebar'
                ]);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('testテンプレート名のパス解決が正常に動作する', () => {
            const templateName = 'layouts.app';
            const currentFilePath = '/workspace/resources/views/test.blade.php';

            const result = bladeParser.resolveTemplatePath(templateName, currentFilePath);

            // パス解決の結果が空文字列でないことを確認
            assert.notStrictEqual(result, '');
        });
    });

    describe('異常系', () => {
        it('test存在しないファイルパスでエラーが発生する', async () => {
            // 存在しないファイルパスでテスト
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => {
                throw new Error('File not found');
            };

            try {
                const result = await bladeParser.parseBladeFile('/nonexistent/path/test.blade.php');
                assert.strictEqual(result, null);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test空のファイル内容で正常に処理される', async () => {
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
    });

    describe('境界値テスト', () => {
        it('test非常に長いテンプレート名が正常に処理される', async () => {
            const longTemplateName = 'a'.repeat(1000);
            const mockContent = `@extends('${longTemplateName}')`;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/long.blade.php');

                assert.ok(result);
                assert.strictEqual(result?.extends, longTemplateName);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });

        it('test特殊文字を含むテンプレート名が正常に処理される', async () => {
            const specialTemplateName = 'template-with-special-chars_123';
            const mockContent = `@extends('${specialTemplateName}')`;

            const mockDocument = {
                getText: () => mockContent
            };
            const originalOpenTextDocument = vscode.workspace.openTextDocument;
            vscode.workspace.openTextDocument = async () => mockDocument as any;

            try {
                const result = await bladeParser.parseBladeFile('/test/path/special.blade.php');

                assert.ok(result);
                assert.strictEqual(result?.extends, specialTemplateName);
            } finally {
                vscode.workspace.openTextDocument = originalOpenTextDocument;
            }
        });
    });
}); 

@extends('layouts.admin')

@section('admin-content')
<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">ダッシュボード</h1>
    <div class="btn-toolbar mb-2 mb-md-0">
        <div class="btn-group mr-2">
            <x-button type="outline-secondary" size="sm">
                <i class="fas fa-download"></i> エクスポート
            </x-button>
            <x-button type="outline-secondary" size="sm">
                <i class="fas fa-print"></i> 印刷
            </x-button>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-3">
        <x-card title="総ユーザー数" subtitle="今月">
            <h2 class="text-primary">1,234</h2>
            <p class="text-success mb-0">
                <i class="fas fa-arrow-up"></i> +12% 先月比
            </p>
        </x-card>
    </div>
    <div class="col-md-3">
        <x-card title="総投稿数" subtitle="今月">
            <h2 class="text-success">567</h2>
            <p class="text-success mb-0">
                <i class="fas fa-arrow-up"></i> +8% 先月比
            </p>
        </x-card>
    </div>
    <div class="col-md-3">
        <x-card title="アクティブユーザー" subtitle="今日">
            <h2 class="text-info">89</h2>
            <p class="text-danger mb-0">
                <i class="fas fa-arrow-down"></i> -3% 昨日比
            </p>
        </x-card>
    </div>
    <div class="col-md-3">
        <x-card title="ページビュー" subtitle="今日">
            <h2 class="text-warning">2,456</h2>
            <p class="text-success mb-0">
                <i class="fas fa-arrow-up"></i> +15% 昨日比
            </p>
        </x-card>
    </div>
</div>

<div class="row mt-4">
    <div class="col-md-8">
        <x-card title="最近の投稿" subtitle="最新10件">
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>タイトル</th>
                            <th>著者</th>
                            <th>投稿日</th>
                            <th>ステータス</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Laravel 10の新機能について</td>
                            <td>田中太郎</td>
                            <td>2024-01-15</td>
                            <td><span class="badge badge-success">公開</span></td>
                        </tr>
                        <tr>
                            <td>Vue.jsとLaravelの連携</td>
                            <td>佐藤花子</td>
                            <td>2024-01-14</td>
                            <td><span class="badge badge-warning">下書き</span></td>
                        </tr>
                        <tr>
                            <td>データベース設計のベストプラクティス</td>
                            <td>山田次郎</td>
                            <td>2024-01-13</td>
                            <td><span class="badge badge-success">公開</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </x-card>
    </div>
    <div class="col-md-4">
        <x-card title="クイックアクション" subtitle="よく使用する機能">
            <div class="d-grid gap-2">
                <x-button type="primary" icon="fas fa-plus">
                    新規投稿
                </x-button>
                <x-button type="success" icon="fas fa-user-plus">
                    ユーザー追加
                </x-button>
                <x-button type="info" icon="fas fa-cog">
                    設定
                </x-button>
                <x-button type="warning" icon="fas fa-download">
                    バックアップ
                </x-button>
            </div>
        </x-card>
    </div>
</div>
@endsection 

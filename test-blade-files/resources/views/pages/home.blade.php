@extends('layouts.app')

@section('title', 'ホーム')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Dashboard') }}</div>

                <div class="card-body">
                    @if (session('status'))
                        <x-alert type="success" dismissible>
                            {{ session('status') }}
                        </x-alert>
                    @endif

                    <h1>ようこそ！</h1>
                    <p>これはLaravel Blade Visualizerのテスト用ページです。</p>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <x-card title="機能1" subtitle="サブタイトル">
                                <p>このカードはコンポーネントを使用しています。</p>
                                <x-button type="primary" icon="fas fa-arrow-right">
                                    詳細を見る
                                </x-button>
                            </x-card>
                        </div>
                        <div class="col-md-6">
                            <x-card title="機能2" subtitle="サブタイトル">
                                <p>複数のコンポーネントを組み合わせて使用できます。</p>
                                <x-button type="success" icon="fas fa-check">
                                    確認
                                </x-button>
                            </x-card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 

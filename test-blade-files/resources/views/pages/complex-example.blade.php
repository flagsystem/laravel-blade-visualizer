@extends('layouts.app')

@section('title', '複雑な例')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>複雑なBladeテンプレートの例</h1>
            <p>このページは複数の継承、インクルード、コンポーネントを使用しています。</p>
            
            @include('partials.breadcrumbs')
            
            <div class="row">
                <div class="col-md-8">
                    <x-card title="メインコンテンツ" subtitle="複雑な構造の例">
                        <p>このセクションでは、複数のコンポーネントとパーシャルを使用しています。</p>
                        
                        @include('partials.feature-list')
                        
                        <div class="mt-4">
                            <h3>コンポーネントの例</h3>
                            <div class="row">
                                <div class="col-md-6">
                                    <x-alert type="info" dismissible>
                                        これは情報アラートです。複数のコンポーネントを組み合わせて使用できます。
                                    </x-alert>
                                </div>
                                <div class="col-md-6">
                                    <x-alert type="warning">
                                        これは警告アラートです。
                                    </x-alert>
                                </div>
                            </div>
                        </div>
                        
                        @include('partials.related-content')
                    </x-card>
                </div>
                
                <div class="col-md-4">
                    @include('partials.sidebar')
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
    .feature-item {
        padding: 1rem;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }
    
    .feature-item:hover {
        background-color: #f8f9fa;
        transition: background-color 0.2s ease;
    }
</style>
@endpush

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    console.log('複雑なページが読み込まれました');
    
    // アラートの自動非表示
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function(alert) {
            const closeButton = alert.querySelector('.close');
            if (closeButton) {
                closeButton.click();
            }
        });
    }, 5000);
});
</script>
@endpush 

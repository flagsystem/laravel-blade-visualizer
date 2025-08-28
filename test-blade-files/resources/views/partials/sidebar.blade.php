<div class="sidebar">
    <x-card title="検索" subtitle="コンテンツを探す">
        <form>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="キーワードを入力...">
                <div class="input-group-append">
                    <x-button type="primary" size="sm">
                        <i class="fas fa-search"></i>
                    </x-button>
                </div>
            </div>
        </form>
    </x-card>

    <x-card title="カテゴリー" subtitle="記事の分類" class="mt-3">
        <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Laravel
                <span class="badge badge-primary badge-pill">14</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                Vue.js
                <span class="badge badge-success badge-pill">8</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                データベース
                <span class="badge badge-info badge-pill">12</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                セキュリティ
                <span class="badge badge-warning badge-pill">6</span>
            </a>
        </div>
    </x-card>

    <x-card title="人気記事" subtitle="よく読まれている記事" class="mt-3">
        <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Laravel 10の新機能</h6>
                    <small class="text-muted">1.2k</small>
                </div>
                <small class="text-muted">3日前</small>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Vue.jsとLaravelの連携</h6>
                    <small class="text-muted">856</small>
                </div>
                <small class="text-muted">1週間前</small>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">データベース設計</h6>
                    <small class="text-muted">654</small>
                </div>
                <small class="text-muted">2週間前</small>
            </a>
        </div>
    </x-card>
</div> 

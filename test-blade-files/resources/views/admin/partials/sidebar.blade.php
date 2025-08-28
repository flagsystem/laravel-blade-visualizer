<div class="sidebar-sticky">
    <ul class="nav flex-column">
        <li class="nav-item">
            <a class="nav-link active" href="{{ route('admin.dashboard') }}">
                <i class="fas fa-tachometer-alt"></i>
                ダッシュボード
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.users.index') }}">
                <i class="fas fa-users"></i>
                ユーザー管理
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.posts.index') }}">
                <i class="fas fa-newspaper"></i>
                投稿管理
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.categories.index') }}">
                <i class="fas fa-tags"></i>
                カテゴリー管理
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.settings.index') }}">
                <i class="fas fa-cog"></i>
                設定
            </a>
        </li>
    </ul>

    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
        <span>レポート</span>
    </h6>
    <ul class="nav flex-column mb-2">
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.reports.users') }}">
                <i class="fas fa-chart-line"></i>
                ユーザー統計
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ route('admin.reports.posts') }}">
                <i class="fas fa-chart-bar"></i>
                投稿統計
            </a>
        </li>
    </ul>
</div> 

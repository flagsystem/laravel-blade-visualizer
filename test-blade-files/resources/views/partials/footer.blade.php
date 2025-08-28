<footer class="bg-dark text-light py-4 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <h5>{{ config('app.name', 'Laravel') }}</h5>
                <p class="text-muted">
                    Laravelで構築されたWebアプリケーションです。
                </p>
            </div>
            <div class="col-md-4">
                <h5>リンク</h5>
                <ul class="list-unstyled">
                    <li><a href="{{ route('home') }}" class="text-muted">ホーム</a></li>
                    <li><a href="{{ route('about') }}" class="text-muted">会社概要</a></li>
                    <li><a href="{{ route('contact') }}" class="text-muted">お問い合わせ</a></li>
                    <li><a href="{{ route('privacy') }}" class="text-muted">プライバシーポリシー</a></li>
                </ul>
            </div>
            <div class="col-md-4">
                <h5>お問い合わせ</h5>
                <p class="text-muted">
                    <i class="fas fa-envelope"></i> info@example.com<br>
                    <i class="fas fa-phone"></i> +81-3-1234-5678
                </p>
            </div>
        </div>
        <hr class="bg-secondary">
        <div class="row">
            <div class="col-md-6">
                <p class="text-muted mb-0">
                    &copy; {{ date('Y') }} {{ config('app.name', 'Laravel') }}. All rights reserved.
                </p>
            </div>
            <div class="col-md-6 text-md-right">
                <p class="text-muted mb-0">
                    Made with ❤️ using Laravel
                </p>
            </div>
        </div>
    </div>
</footer> 

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Blade Visualizer Test</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="/">ホーム</a></li>
                <li><a href="/about">概要</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        @yield('content')
    </main>
    
    <footer>
        <p>&copy; 2024 Laravel Blade Visualizer Test</p>
    </footer>
</body>
</html> 

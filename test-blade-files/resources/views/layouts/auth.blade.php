<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', '認証') - {{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="{{ asset('css/auth.css') }}" rel="stylesheet">
</head>
<body class="auth-body">
    <div class="auth-container">
        <div class="auth-box">
            <div class="auth-header">
                <h1 class="auth-title">
                    <a href="{{ url('/') }}">
                        {{ config('app.name', 'Laravel') }}
                    </a>
                </h1>
            </div>
            
            <div class="auth-content">
                @yield('auth-content')
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="{{ asset('js/auth.js') }}"></script>
</body>
</html> 

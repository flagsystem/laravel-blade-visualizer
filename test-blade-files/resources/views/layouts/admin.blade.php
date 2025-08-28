@extends('layouts.app')

@section('title', '管理画面 - ' . config('app.name'))

@push('styles')
    <link href="{{ asset('css/admin.css') }}" rel="stylesheet">
@endpush

@section('content')
    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-2 d-none d-md-block bg-light sidebar">
                @include('admin.partials.sidebar')
            </nav>
            
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
                @include('partials.breadcrumbs')
                @yield('admin-content')
            </main>
        </div>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('js/admin.js') }}"></script>
@endpush 

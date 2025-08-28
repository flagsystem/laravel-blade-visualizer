@extends('layouts.app')

@section('content')
<div class="container">
    <h1>テストページ</h1>
    
    @include('components.header')
    
    <div class="content">
        @component('components.card')
            @slot('title', 'カードタイトル')
            @slot('content')
                カードの内容がここに表示されます。
            @endslot
        @endcomponent
        
        @include('components.footer')
    </div>
</div>
@endsection 

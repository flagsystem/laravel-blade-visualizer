@if(isset($breadcrumbs) && count($breadcrumbs) > 0)
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item">
                <a href="{{ route('home') }}">
                    <i class="fas fa-home"></i> ホーム
                </a>
            </li>
            @foreach($breadcrumbs as $breadcrumb)
                @if($loop->last)〜
                    <li class="breadcrumb-item active" aria-current="page">
                        {{ $breadcrumb['title'] }}
                    </li>
                @else
                    <li class="breadcrumb-item">
                        <a href="{{ $breadcrumb['url'] }}">
                            {{ $breadcrumb['title'] }}
                        </a>
                    </li>
                @endif
            @endforeach
        </ol>
    </nav>
@endif 

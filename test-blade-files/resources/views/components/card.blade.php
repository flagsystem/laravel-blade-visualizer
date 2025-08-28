@props(['title' => '', 'subtitle' => '', 'footer' => ''])

<div {{ $attributes->merge(['class' => 'card']) }}>
    @if($title || $subtitle)
        <div class="card-header">
            @if($title)
                <h5 class="card-title mb-0">{{ $title }}</h5>
            @endif
            @if($subtitle)
                <h6 class="card-subtitle text-muted">{{ $subtitle }}</h6>
            @endif
        </div>
    @endif
    
    <div class="card-body">
        {{ $slot }}
    </div>
    
    @if($footer)
        <div class="card-footer text-muted">
            {{ $footer }}
        </div>
    @endif
</div> 

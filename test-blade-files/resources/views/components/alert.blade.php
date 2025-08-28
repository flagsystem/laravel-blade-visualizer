@props(['type' => 'info', 'dismissible' => false])

@php
$alertClass = 'alert alert-' . $type;
if ($dismissible) {
    $alertClass .= ' alert-dismissible fade show';
}
@endphp

<div {{ $attributes->merge(['class' => $alertClass]) }} role="alert">
    @if($type === 'success')
        <i class="fas fa-check-circle"></i>
    @elseif($type === 'danger')
        <i class="fas fa-exclamation-triangle"></i>
    @elseif($type === 'warning')
        <i class="fas fa-exclamation-circle"></i>
    @else
        <i class="fas fa-info-circle"></i>
    @endif
    
    {{ $slot }}
    
    @if($dismissible)
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    @endif
</div> 

@props(['type' => 'primary', 'size' => 'md', 'disabled' => false])

@php
$buttonClass = 'btn btn-' . $type;
if ($size !== 'md') {
    $buttonClass .= ' btn-' . $size;
}
@endphp

<button {{ $attributes->merge(['class' => $buttonClass, 'type' => 'button']) }} 
        {{ $disabled ? 'disabled' : '' }}>
    @if(isset($icon))
        <i class="{{ $icon }}"></i>
    @endif
    
    {{ $slot }}
</button> 

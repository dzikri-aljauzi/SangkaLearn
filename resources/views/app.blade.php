<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'LeadNEX') }}</title>

        <!-- Favicon and App Icons -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg">
        
        <!-- PWA Manifest -->
        <link rel="manifest" href="/manifest.json">
        
        <!-- Browser Config -->
        <meta name="msapplication-config" content="/browserconfig.xml">
        
        <!-- Meta Theme -->
        <meta name="theme-color" content="#1e40af">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="LeadNEX">
        
        <!-- Meta Description -->
        <meta name="description" content="LeadNEX Learning Platform - Platform pembelajaran online terdepan untuk digital transformation">
        <meta name="keywords" content="LMS, Learning Management System, LeadNEX, Online Learning, Education, Digital Transformation">
        <meta name="author" content="LeadNEX Learning Platform">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Midtrans Snap -->
        @if(config('midtrans.is_production'))
            <script src="https://app.midtrans.com/snap/snap.js" data-client-key="{{ config('midtrans.client_key') }}"></script>
        @else
            <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="{{ config('midtrans.client_key') }}"></script>
        @endif

        <!-- Scripts -->
        @routes
        @if(app()->environment('local'))
            @viteReactRefresh
        @endif
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

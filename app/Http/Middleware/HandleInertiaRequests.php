<?php

// app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currentLocale = App::getLocale();
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles') : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'locale' => $currentLocale,
            'translations' => $this->loadTranslations($currentLocale),
        ]);
    }
    
    /**
     * Load translations for the given locale
     */
    private function loadTranslations($locale)
    {
        $translations = [];
        $translationFiles = ['welcome', 'app', 'auth'];
        
        foreach ($translationFiles as $file) {
            $filePath = base_path("lang/{$locale}/{$file}.php");
            
            if (file_exists($filePath)) {
                $translations[$file] = include $filePath;
            } else {
                // Fallback to English if locale file doesn't exist
                $fallbackPath = base_path("lang/en/{$file}.php");
                if (file_exists($fallbackPath)) {
                    $translations[$file] = include $fallbackPath;
                } else {
                    $translations[$file] = [];
                }
            }
        }
        
        return $translations;
    }
}
<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Enrollment;
use App\Observers\UserObserver;
use App\Observers\UserEnrollmentObserver;
use App\Observers\EnrollmentObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Force HTTPS for assets and URLs when using ngrok or production
        if (config('app.env') !== 'local' || request()->getSchemeAndHttpHost() !== 'http://localhost:8000') {
            URL::forceScheme('https');
        }
        
        // Register model observers
        User::observe(UserObserver::class);
        User::observe(UserEnrollmentObserver::class);
        Enrollment::observe(EnrollmentObserver::class);
    }
}

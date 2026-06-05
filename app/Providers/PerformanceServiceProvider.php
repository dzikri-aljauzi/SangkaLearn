<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;

class PerformanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Prevent lazy loading in development
        if ($this->app->environment('local')) {
            Model::preventLazyLoading();
        }

        // Enable query log only when needed
        if (config('app.debug') && request()->has('debug_queries')) {
            DB::enableQueryLog();
            
            View::composer('*', function ($view) {
                $queries = DB::getQueryLog();
                $view->with('debug_queries', $queries);
            });
        }

        // Optimize Eloquent
        Model::shouldBeStrict(!$this->app->isProduction());
    }
}
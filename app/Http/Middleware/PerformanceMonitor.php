<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceMonitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        DB::enableQueryLog();

        $response = $next($request);

        $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
        $memoryUsed = (memory_get_usage() - $startMemory) / 1024 / 1024; // Convert to MB
        $queryCount = count(DB::getQueryLog());

        // Log slow requests (over 1 second)
        if ($executionTime > 1000) {
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time' => $executionTime . 'ms',
                'memory_used' => $memoryUsed . 'MB',
                'query_count' => $queryCount,
                'user_agent' => $request->userAgent(),
            ]);
        }

        // Add performance headers for debugging
        if (config('app.debug')) {
            $response->headers->add([
                'X-Debug-Time' => $executionTime . 'ms',
                'X-Debug-Memory' => round($memoryUsed, 2) . 'MB',
                'X-Debug-Queries' => $queryCount,
            ]);
        }

        DB::disableQueryLog();

        return $response;
    }
}
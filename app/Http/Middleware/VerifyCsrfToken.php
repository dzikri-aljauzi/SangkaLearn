<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Session\TokenMismatchException;
use Closure;
use Illuminate\Http\Request;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'csrf-token',
        'midtrans/notification',
        'midtrans/*',
        'api/chatbot',
        'payment/notification', // Midtrans webhook endpoint
        'api/midtrans/notification', // Alternative Midtrans webhook endpoint
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     *
     * @throws \Illuminate\Session\TokenMismatchException
     */
    public function handle($request, Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TokenMismatchException $exception) {
            // If it's an AJAX/Inertia request, return JSON response with new token
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh the page.',
                    'csrf_token' => csrf_token(),
                ], 419);
            }

            // For regular requests, redirect back with error and refresh session
            $request->session()->regenerateToken();
            
            return redirect()->back()
                ->withInput($request->except('_token'))
                ->with('error', 'Session expired. Please try again.');
        }
    }
}
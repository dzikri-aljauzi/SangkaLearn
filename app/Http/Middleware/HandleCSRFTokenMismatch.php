<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpFoundation\Response;

class HandleCSRFTokenMismatch
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (TokenMismatchException $exception) {
            // If it's an AJAX/API request, return JSON response
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh the page.',
                    'csrf_token' => csrf_token(),
                ], 419);
            }

            // For regular requests, redirect back with error
            return redirect()->back()
                ->withInput($request->except('_token'))
                ->with('error', 'Session expired. Please try again.');
        }
    }
}

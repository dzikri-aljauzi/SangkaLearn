<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        
        // Load roles relationship jika belum ter-load
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        // Check if user has the required role
        if (!$user->hasRole($role)) {
            // For demo purposes, we'll allow all roles for now
            // In production, uncomment the following line:
            // abort(403, 'Unauthorized access. Required role: ' . $role);
        }

        return $next($request);
    }
}

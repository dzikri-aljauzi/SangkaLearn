<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\UserLoginLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Log remember me parameter for debugging
        $rememberMe = $request->boolean('remember');
        \Log::info('Login attempt', [
            'email' => $request->email,
            'remember_me' => $rememberMe,
            'ip' => $request->ip()
        ]);

        $request->authenticate();

        $request->session()->regenerate();

        // Update last login timestamp
        $user = Auth::user();
        $user->updateLastLogin();

        // Track login streak
        $this->trackLoginStreak($user, $request);

        // Log successful login with remember token status
        \Log::info('Login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'remember_me' => $rememberMe,
            'remember_token_set' => !empty($user->remember_token)
        ]);

        // Redirect based on user role
        return $this->redirectBasedOnRole($user);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        try {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            // Clear any cached user data
            $request->session()->flush();

            return redirect('/login')->with('status', 'Anda telah berhasil keluar. Silakan login kembali.');
        } catch (\Exception $e) {
            // If any error occurs during logout, just redirect to login
            return redirect('/login')->with('error', 'Logout berhasil. Silakan login kembali.');
        }
    }

    /**
     * Redirect user based on their role
     */
    private function redirectBasedOnRole($user): RedirectResponse
    {
        // Check if user has multiple roles, prioritize admin > instructor > student
        if ($user->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard'));
        }

        if ($user->hasRole('instructor')) {
            return redirect()->intended(route('instructor.dashboard'));
        }

        if ($user->hasRole('student')) {
            return redirect()->intended(route('student.dashboard'));
        }

        // Default fallback to general dashboard
        return redirect()->intended(route('dashboard'));
    }

    /**
     * Track user login streak
     */
    private function trackLoginStreak($user, $request): void
    {
        $today = now()->toDateString();

        try {
            // Check if already logged today
            $loggedToday = UserLoginLog::where('user_id', $user->id)
                ->where('login_date', $today)
                ->exists();

            if (!$loggedToday) {
                // Log today's login
                UserLoginLog::create([
                    'user_id' => $user->id,
                    'login_date' => $today,
                    'login_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                // Update streak
                $this->updateStreak($user, $today);
            }
        } catch (\Exception $e) {
            \Log::error('Error tracking login streak: ' . $e->getMessage());
            // Don't block login if streak tracking fails
        }
    }

    /**
     * Update user's login streak
     */
    private function updateStreak($user, $today): void
    {
        $lastLoginDate = $user->last_login_date;

        if (!$lastLoginDate) {
            // First login ever
            $user->update([
                'current_streak' => 1,
                'longest_streak' => 1,
                'last_login_date' => $today,
            ]);
            return;
        }

        $daysDiff = now()->parse($today)->diffInDays($lastLoginDate);

        if ($daysDiff === 1) {
            // Consecutive day - increment streak
            $newStreak = $user->current_streak + 1;
            $user->update([
                'current_streak' => $newStreak,
                'longest_streak' => max($newStreak, $user->longest_streak),
                'last_login_date' => $today,
            ]);
        } elseif ($daysDiff === 0) {
            // Same day (should not happen due to check above, but just in case)
            return;
        } else {
            // Streak broken - reset to 1
            $user->update([
                'current_streak' => 1,
                'last_login_date' => $today,
            ]);
        }
    }
}
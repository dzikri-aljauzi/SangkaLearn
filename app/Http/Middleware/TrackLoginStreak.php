<?php

namespace App\Http\Middleware;

use App\Models\UserLoginLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TrackLoginStreak
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
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
                Log::error('Error tracking login streak: ' . $e->getMessage());
                // Don't block the request if streak tracking fails
            }
        }

        return $next($request);
    }

    /**
     * Update user's login streak
     */
    private function updateStreak($user, $today)
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

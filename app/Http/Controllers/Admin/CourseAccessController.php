<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\CourseUserAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CourseAccessController extends Controller
{
    public function show(Course $course)
    {
        // Only allow access to private courses
        if ($course->access_type !== 'private') {
            return redirect()->route('admin.courses.index')
                           ->with('error', 'Access management is only available for private courses.');
        }

        $course->load(['userAccess.user', 'userAccess.grantedBy']);
        
        // Get all students for potential access granting
        $students = User::whereHas('roles', function($query) {
            $query->where('name', 'student');
        })->where('is_active', true)
        ->select('id', 'first_name', 'last_name', 'email')
        ->orderBy('first_name')
        ->get();

        // Get current access list
        $currentAccess = $course->userAccess()
            ->with(['user', 'grantedBy'])
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->orderBy('granted_at', 'desc')
            ->get();

        return Inertia::render('Admin/Courses/Access/Index', [
            'course' => $course,
            'students' => $students,
            'currentAccess' => $currentAccess,
            'stats' => [
                'total_users_with_access' => $currentAccess->count(),
                'expired_access' => $course->userAccess()
                    ->where('expires_at', '<=', now())
                    ->count(),
                'recent_grants' => $course->userAccess()
                    ->where('granted_at', '>', now()->subDays(7))
                    ->count(),
            ]
        ]);
    }

    public function grantAccess(Course $course, Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'access_reason' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if user already has access
        $existingAccess = $course->userAccess()
            ->where('user_id', $user->id)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($existingAccess) {
            return back()->with('error', 'User already has access to this course.');
        }

        $course->grantAccessToUser(
            $user,
            Auth::user(),
            $request->access_reason,
            $request->expires_at
        );

        return back()->with('success', "Access granted to {$user->first_name} {$user->last_name}");
    }

    public function revokeAccess(Course $course, CourseUserAccess $access)
    {
        $userName = $access->user->first_name . ' ' . $access->user->last_name;
        $access->delete();

        return back()->with('success', "Access revoked for {$userName}");
    }

    public function updateAccess(Course $course, CourseUserAccess $access, Request $request)
    {
        $request->validate([
            'access_reason' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $access->update([
            'access_reason' => $request->access_reason,
            'expires_at' => $request->expires_at ? now()->parse($request->expires_at) : null,
        ]);

        return back()->with('success', 'Access updated successfully');
    }

    public function bulkGrant(Course $course, Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'access_reason' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $grantedCount = 0;
        $alreadyHaveAccess = [];

        foreach ($request->user_ids as $userId) {
            $user = User::find($userId);
            
            // Check if user already has access
            $existingAccess = $course->userAccess()
                ->where('user_id', $userId)
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->first();

            if ($existingAccess) {
                $alreadyHaveAccess[] = $user->first_name . ' ' . $user->last_name;
                continue;
            }

            $course->grantAccessToUser(
                $user,
                Auth::user(),
                $request->access_reason,
                $request->expires_at
            );

            $grantedCount++;
        }

        $message = "Access granted to {$grantedCount} users.";
        if (!empty($alreadyHaveAccess)) {
            $message .= " Note: " . implode(', ', $alreadyHaveAccess) . " already had access.";
        }

        return back()->with('success', $message);
    }
}
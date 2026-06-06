<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the enhanced profile settings page with role-specific data.
     */
    public function settings(Request $request): Response
    {
        $user = $request->user();
        $user->load('roles');
        
        $userRole = $user->roles->first()?->name ?? 'student';
        
        // Get role-specific statistics
        $stats = $this->getRoleSpecificStats($user, $userRole);
        
        // Get achievements/recent activities
        $achievements = $this->getAchievements($user, $userRole);
        
        // Get user preferences
        $preferences = [
            'email_notifications' => true,
            'push_notifications' => false,
            'profile_visibility' => true,
        ];

        return Inertia::render('Profile/ProfileSettings', [
            'user' => $user,
            'stats' => $stats,
            'achievements' => $achievements,
            'preferences' => $preferences,
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Get role-specific statistics for the user.
     */
    private function getRoleSpecificStats(User $user, string $role): array
    {
        try {
            switch ($role) {
                case 'admin':
                    return [
                        'total_users' => User::count(),
                        'total_courses' => Course::count(),
                        'total_revenue' => Order::where('status', 'completed')->sum('total_amount') ?? 0,
                        'growth_rate' => $this->calculateGrowthRate(),
                    ];
                    
                case 'instructor':
                    $myCourses = Course::where('instructor_id', $user->id)->count();
                    $myStudents = Enrollment::join('courses', 'enrollments.course_id', '=', 'courses.id')
                                           ->where('courses.instructor_id', $user->id)
                                           ->distinct('enrollments.user_id')
                                           ->count();
                    $myEarnings = $myStudents * 150000; // Estimated earnings
                    $avgRating = 4.5; // Sample rating
                    
                    return [
                        'my_courses' => $myCourses,
                        'my_students' => $myStudents,
                        'my_earnings' => $myEarnings,
                        'avg_rating' => $avgRating,
                    ];
                    
                case 'student':
                default:
                    $enrolledCourses = Enrollment::where('user_id', $user->id)->count();
                    $completedCourses = Enrollment::where('user_id', $user->id)
                                                 ->where('status', 'completed')
                                                 ->count();
                    $learningHours = Enrollment::where('user_id', $user->id)
                                              ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                                              ->sum('courses.duration_hours') ?? 0;
                    $certificates = $completedCourses; // Assume 1 certificate per completed course
                    
                    return [
                        'enrolled_courses' => $enrolledCourses,
                        'completed_courses' => $completedCourses,
                        'learning_hours' => round($learningHours),
                        'certificates' => $certificates,
                    ];
            }
        } catch (\Exception $e) {
            // Fallback stats if database queries fail
            return [
                'enrolled_courses' => 0,
                'completed_courses' => 0,
                'learning_hours' => 0,
                'certificates' => 0,
            ];
        }
    }

    /**
     * Get achievements/recent activities for the user.
     */
    private function getAchievements(User $user, string $role): array
    {
        $achievements = [];
        
        try {
            switch ($role) {
                case 'admin':
                    $achievements = [
                        [
                            'title' => 'Platform Growth',
                            'description' => 'Successfully managed platform expansion to 60+ users',
                        ],
                        [
                            'title' => 'System Administrator',
                            'description' => 'Maintaining stable platform operations',
                        ],
                    ];
                    break;
                    
                case 'instructor':
                    $courseCount = Course::where('instructor_id', $user->id)->count();
                    if ($courseCount > 0) {
                        $achievements[] = [
                            'title' => 'Course Creator',
                            'description' => "Created {$courseCount} course(s) on the platform",
                        ];
                    }
                    
                    $studentCount = Enrollment::join('courses', 'enrollments.course_id', '=', 'courses.id')
                                             ->where('courses.instructor_id', $user->id)
                                             ->distinct('enrollments.user_id')
                                             ->count();
                    if ($studentCount > 10) {
                        $achievements[] = [
                            'title' => 'Popular Instructor',
                            'description' => "Teaching {$studentCount} students across your courses",
                        ];
                    }
                    break;
                    
                case 'student':
                default:
                    $completedCourses = Enrollment::where('user_id', $user->id)
                                                 ->where('status', 'completed')
                                                 ->count();
                    if ($completedCourses > 0) {
                        $achievements[] = [
                            'title' => 'Course Completion',
                            'description' => "Completed {$completedCourses} course(s) successfully",
                        ];
                    }
                    
                    $enrolledCourses = Enrollment::where('user_id', $user->id)->count();
                    if ($enrolledCourses >= 3) {
                        $achievements[] = [
                            'title' => 'Active Learner',
                            'description' => "Enrolled in {$enrolledCourses} courses on the platform",
                        ];
                    }
                    break;
            }
        } catch (\Exception $e) {
            // Return empty array if queries fail
            $achievements = [];
        }
        
        return $achievements;
    }

    /**
     * Calculate platform growth rate for admin stats.
     */
    private function calculateGrowthRate(): float
    {
        try {
            $currentMonth = User::whereMonth('created_at', now()->month)
                               ->whereYear('created_at', now()->year)
                               ->count();
            $previousMonth = User::whereMonth('created_at', now()->subMonth()->month)
                                ->whereYear('created_at', now()->subMonth()->year)
                                ->count();
            
            if ($previousMonth > 0) {
                return round((($currentMonth - $previousMonth) / $previousMonth) * 100, 1);
            }
            
            return $currentMonth > 0 ? 100.0 : 0.0;
        } catch (\Exception $e) {
            return 0.0;
        }
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.settings')->with('success', 'Profile updated successfully!');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => bcrypt($validated['password']),
        ]);

        return Redirect::route('profile.settings')->with('success', 'Password updated successfully!');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // 2MB Max
        ]);

        $user = $request->user();
        
        try {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            
            // Update user avatar
            $user->update([
                'avatar' => $avatarPath,
            ]);
            
            return Redirect::route('profile.settings')->with('success', 'Profile photo updated successfully!');
        } catch (\Exception $e) {
            return Redirect::route('profile.settings')->with('error', 'Failed to update profile photo.');
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

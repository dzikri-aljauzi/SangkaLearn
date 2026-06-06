<?php

namespace App\Observers;

use App\Models\User;
use App\Services\CourseAssignmentService;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    protected $courseAssignmentService;

    public function __construct(CourseAssignmentService $courseAssignmentService)
    {
        $this->courseAssignmentService = $courseAssignmentService;
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Auto-enroll special students to their group's courses
        // Check user_type directly since roles might not be assigned yet
        if ($user->user_type === 'special' && $user->user_group_id) {
            try {
                $this->courseAssignmentService->autoEnrollStudentToGroupCourses($user);
            } catch (\Exception $e) {
                Log::error("Failed to auto-enroll new special student {$user->email}: " . $e->getMessage());
            }
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Check if user type, group, or accessible_courses changed
        if ($user->isDirty(['user_type', 'user_group_id', 'accessible_courses'])) {
            // If became special student or changed group, auto-enroll to courses
            if ($user->user_type === 'special') {
                try {
                    $this->courseAssignmentService->autoEnrollStudentToGroupCourses($user);
                    
                    // Handle direct course access changes
                    if ($user->isDirty('accessible_courses')) {
                        $accessibleCourses = $user->accessible_courses ?? [];
                        $this->courseAssignmentService->updateDirectCourseAccess($user, $accessibleCourses);
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to update special student enrollment {$user->email}: " . $e->getMessage());
                }
            }
        }
    }
}
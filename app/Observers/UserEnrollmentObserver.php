<?php

namespace App\Observers;

use App\Models\User;
use App\Services\SpecialStudentCourseAccessService;
use Illuminate\Support\Facades\Log;

class UserEnrollmentObserver
{
    public function __construct(
        private SpecialStudentCourseAccessService $courseAccessService
    ) {}

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user)
    {
        // Only process special students
        if ($user->user_type !== 'special') {
            return;
        }

        // Check if accessible_courses was changed
        $original = $user->getOriginal('accessible_courses');
        $new = $user->accessible_courses;

        // Normalize both values for comparison
        $originalNormalized = $this->normalizeAccessibleCourses($original);
        $newNormalized = $this->normalizeAccessibleCourses($new);

        // Sort for proper comparison
        sort($originalNormalized);
        sort($newNormalized);

        if ($originalNormalized !== $newNormalized) {
            Log::info("UserEnrollmentObserver: accessible_courses changed for user {$user->id}", [
                'original' => $originalNormalized,
                'new' => $newNormalized,
                'user_email' => $user->email
            ]);

            try {
                // Update course access using our robust service
                $this->courseAccessService->updateCourseAccess($user, $newNormalized);
                
                Log::info("UserEnrollmentObserver: Successfully updated course access for user {$user->id}");
            } catch (\Exception $e) {
                Log::error("UserEnrollmentObserver: Failed to update course access for user {$user->id}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
    }

    /**
     * Normalize accessible_courses value to array
     */
    private function normalizeAccessibleCourses($value): array
    {
        if (is_null($value)) {
            return [];
        }
        
        if (is_array($value)) {
            return array_map('intval', array_filter($value));
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return array_map('intval', array_filter($decoded));
            }
        }
        
        return [];
    }
}
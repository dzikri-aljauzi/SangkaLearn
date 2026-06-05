<?php

namespace App\Observers;

use App\Models\Enrollment;
use Illuminate\Support\Facades\Log;

class EnrollmentObserver
{
    /**
     * Handle the Enrollment "creating" event.
     * Calculate expires_at before saving if not already set.
     */
    public function creating(Enrollment $enrollment): void
    {
        // Only calculate if expires_at is not already set and course has duration limit
        if ($enrollment->expires_at === null && $enrollment->course_id) {
            $course = $enrollment->course;

            if ($course && $course->access_duration_days && $course->access_duration_days > 0) {
                $enrolledAt = $enrollment->enrolled_at ?? now();
                $enrollment->expires_at = $enrolledAt->copy()->addDays($course->access_duration_days);

                Log::info("Set expires_at for enrollment", [
                    'user_id' => $enrollment->user_id,
                    'course_id' => $enrollment->course_id,
                    'access_duration_days' => $course->access_duration_days,
                    'enrolled_at' => $enrolledAt,
                    'expires_at' => $enrollment->expires_at,
                ]);
            }
        }
    }

    /**
     * Handle the Enrollment "created" event.
     */
    public function created(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "updated" event.
     */
    public function updated(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "deleted" event.
     */
    public function deleted(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "restored" event.
     */
    public function restored(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "force deleted" event.
     */
    public function forceDeleted(Enrollment $enrollment): void
    {
        //
    }
}

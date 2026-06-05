<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SpecialStudentCourseAccessService
{
    /**
     * Update course access for special student
     * This is the main method that handles all course access updates
     */
    public function updateCourseAccess(User $student, array $newCourseIds = [])
    {
        if ($student->user_type !== 'special') {
            Log::warning("Attempted to update course access for non-special student: {$student->email}");
            return false;
        }

        try {
            DB::beginTransaction();

            Log::info("=== STARTING COURSE ACCESS UPDATE ===", [
                'student_id' => $student->id,
                'student_email' => $student->email,
                'new_course_ids' => $newCourseIds,
                'timestamp' => now()->toDateTimeString()
            ]);

            // Step 1: Get current manual enrollments (these are from direct access)
            $currentEnrollments = Enrollment::where('user_id', $student->id)
                ->where('enrollment_type', 'manual')
                ->get();

            $currentCourseIds = $currentEnrollments->pluck('course_id')->toArray();

            Log::info("Current manual enrollments:", [
                'current_course_ids' => $currentCourseIds,
                'current_count' => count($currentCourseIds)
            ]);

            // Step 2: Determine changes
            $coursesToRemove = array_diff($currentCourseIds, $newCourseIds);
            $coursesToAdd = array_diff($newCourseIds, $currentCourseIds);

            Log::info("Changes to apply:", [
                'courses_to_remove' => $coursesToRemove,
                'courses_to_add' => $coursesToAdd,
                'remove_count' => count($coursesToRemove),
                'add_count' => count($coursesToAdd)
            ]);

            // Step 3: Remove access to courses no longer in the list
            if (!empty($coursesToRemove)) {
                $removedCount = Enrollment::where('user_id', $student->id)
                    ->where('enrollment_type', 'manual')
                    ->whereIn('course_id', $coursesToRemove)
                    ->delete(); // Actually delete instead of suspend for cleaner data

                Log::info("Removed enrollments:", [
                    'removed_course_ids' => $coursesToRemove,
                    'removed_count' => $removedCount
                ]);
            }

            // Step 4: Add access to new courses
            if (!empty($coursesToAdd)) {
                $validCourses = Course::whereIn('id', $coursesToAdd)
                    ->where('status', 'published')
                    ->get();

                foreach ($validCourses as $course) {
                    // Check if any enrollment exists (including suspended ones)
                    $existingEnrollment = Enrollment::where('user_id', $student->id)
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingEnrollment) {
                        // Update existing enrollment to manual type and active status
                        $existingEnrollment->update([
                            'enrollment_type' => 'manual',
                            'status' => 'active',
                            'enrolled_at' => now(),
                            'last_accessed_at' => now()
                        ]);

                        Log::info("Updated existing enrollment:", [
                            'enrollment_id' => $existingEnrollment->id,
                            'course_id' => $course->id,
                            'course_title' => $course->title
                        ]);
                    } else {
                        // Create new enrollment
                        $newEnrollment = Enrollment::create([
                            'user_id' => $student->id,
                            'course_id' => $course->id,
                            'enrollment_type' => 'manual',
                            'status' => 'active',
                            'progress_percentage' => 0,
                            'enrolled_at' => now(),
                            'last_accessed_at' => now()
                        ]);

                        Log::info("Created new enrollment:", [
                            'enrollment_id' => $newEnrollment->id,
                            'course_id' => $course->id,
                            'course_title' => $course->title
                        ]);
                    }
                }
            }

            // Step 5: Update user's accessible_courses field
            $student->update([
                'accessible_courses' => $newCourseIds
            ]);

            Log::info("Updated user accessible_courses field:", [
                'new_accessible_courses' => $newCourseIds
            ]);

            // Step 6: Verify final state
            $finalEnrollments = Enrollment::where('user_id', $student->id)
                ->where('enrollment_type', 'manual')
                ->where('status', 'active')
                ->with('course:id,title')
                ->get();

            $finalCourseIds = $finalEnrollments->pluck('course_id')->toArray();

            Log::info("=== COURSE ACCESS UPDATE COMPLETED ===", [
                'expected_course_ids' => $newCourseIds,
                'final_course_ids' => $finalCourseIds,
                'final_enrollments' => $finalEnrollments->map(function($e) {
                    return [
                        'id' => $e->id,
                        'course_id' => $e->course_id,
                        'course_title' => $e->course->title ?? 'Unknown',
                        'status' => $e->status,
                        'enrollment_type' => $e->enrollment_type
                    ];
                })->toArray(),
                'success' => sort($newCourseIds) === sort($finalCourseIds)
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("=== COURSE ACCESS UPDATE FAILED ===", [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get current active course access for student
     */
    public function getCurrentCourseAccess(User $student)
    {
        if ($student->user_type !== 'special') {
            return [];
        }

        $enrollments = Enrollment::where('user_id', $student->id)
            ->where('enrollment_type', 'manual')
            ->where('status', 'active')
            ->with('course:id,title,slug,thumbnail')
            ->get();

        return [
            'course_ids' => $enrollments->pluck('course_id')->toArray(),
            'courses' => $enrollments->map(function($enrollment) {
                return [
                    'id' => $enrollment->course_id,
                    'title' => $enrollment->course->title ?? 'Unknown',
                    'slug' => $enrollment->course->slug ?? '',
                    'thumbnail' => $enrollment->course->thumbnail ?? '',
                    'enrollment_id' => $enrollment->id,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'progress_percentage' => $enrollment->progress_percentage
                ];
            })->toArray()
        ];
    }

    /**
     * Force refresh student enrollment data
     */
    public function refreshStudentEnrollments(User $student)
    {
        if ($student->user_type !== 'special') {
            return false;
        }

        // Get fresh accessible_courses from database
        $freshStudent = User::find($student->id);
        $accessibleCourses = $freshStudent->accessible_courses ?: [];

        // Update course access based on current accessible_courses
        return $this->updateCourseAccess($freshStudent, $accessibleCourses);
    }
}
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\UserGroup;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CourseAssignmentService
{
    /**
     * Auto-enroll special students based on their access type
     */
    public function autoEnrollStudentToGroupCourses(User $student)
    {
        if ($student->user_type !== 'special') {
            return;
        }

        try {
            DB::beginTransaction();

            $coursesToEnroll = collect();

            // Get accessible courses - handle both cast and raw data
            $accessibleCourseIds = [];
            if ($student->accessible_courses) {
                $accessibleCourseIds = is_array($student->accessible_courses) 
                    ? $student->accessible_courses 
                    : (is_string($student->accessible_courses) ? json_decode($student->accessible_courses, true) : []);
            }
            
            // For special students: prioritize direct course access over group assignment
            // If they have direct course access selected, only use those courses
            if (!empty($accessibleCourseIds) && is_array($accessibleCourseIds)) {
                // Only enroll to directly selected courses
                $directCourses = Course::whereIn('id', $accessibleCourseIds)
                    ->where('status', 'published')
                    ->get();
                $coursesToEnroll = $directCourses;
                $enrollmentType = 'manual';
                
                Log::info("Using direct course access for student {$student->email}: " . implode(', ', $accessibleCourseIds));
            } else if ($student->user_group_id) {
                // Only use group courses if no direct access is specified
                $userGroup = UserGroup::find($student->user_group_id);
                if ($userGroup) {
                    $groupCourses = $userGroup->assignedCourses()
                        ->where(function($query) {
                            $query->whereNull('expires_at')
                                  ->orWhere('expires_at', '>', now());
                        })
                        ->get();
                    $coursesToEnroll = $groupCourses;
                    $enrollmentType = 'group_assignment';
                    
                    Log::info("Using group assignment for student {$student->email}");
                }
            }

            // Enroll to selected courses
            foreach ($coursesToEnroll as $course) {
                // Check if already enrolled
                $existingEnrollment = Enrollment::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->first();

                if (!$existingEnrollment) {
                    Enrollment::create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                        'enrolled_at' => now(),
                        'status' => 'active',
                        'progress_percentage' => 0,
                        'enrollment_type' => $enrollmentType
                    ]);

                    Log::info("Auto-enrolled student {$student->email} to course {$course->title} via {$enrollmentType}");
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error auto-enrolling student: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Auto-enroll all group students when course is assigned to group
     */
    public function autoEnrollGroupStudentsToCourse(UserGroup $userGroup, Course $course)
    {
        try {
            DB::beginTransaction();

            $specialStudents = $userGroup->specialStudents()
                ->where('is_active', true)
                ->get();

            foreach ($specialStudents as $student) {
                // Check if already enrolled
                $existingEnrollment = Enrollment::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->first();

                if (!$existingEnrollment) {
                    Enrollment::create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                        'enrolled_at' => now(),
                        'status' => 'active',
                        'progress_percentage' => 0,
                        'enrollment_type' => 'group_assignment'
                    ]);

                    Log::info("Auto-enrolled group student {$student->email} to course {$course->title}");
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error auto-enrolling group students: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Assign course to user group
     */
    public function assignCourseToGroup(UserGroup $userGroup, Course $course, $expiresAt = null)
    {
        try {
            DB::beginTransaction();

            // Check if already assigned
            $existingAssignment = $userGroup->assignedCourses()
                ->where('course_id', $course->id)
                ->first();

            if (!$existingAssignment) {
                $userGroup->assignedCourses()->attach($course->id, [
                    'assigned_at' => now(),
                    'expires_at' => $expiresAt
                ]);
            } else {
                // Update expiry if needed
                $userGroup->assignedCourses()->updateExistingPivot($course->id, [
                    'expires_at' => $expiresAt
                ]);
            }

            // Auto-enroll all group students
            $this->autoEnrollGroupStudentsToCourse($userGroup, $course);

            DB::commit();
            
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error assigning course to group: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove course assignment from group
     */
    public function removeCourseFromGroup(UserGroup $userGroup, Course $course)
    {
        try {
            DB::beginTransaction();

            // Remove assignment
            $userGroup->assignedCourses()->detach($course->id);

            // Optionally suspend enrollments (don't delete to preserve progress)
            $specialStudents = $userGroup->specialStudents()->pluck('id');
            
            Enrollment::whereIn('user_id', $specialStudents)
                ->where('course_id', $course->id)
                ->where('enrollment_type', 'group_assignment')
                ->update(['status' => 'suspended']);

            DB::commit();
            
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error removing course from group: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update direct course access for a special student
     */
    public function updateDirectCourseAccess(User $student, array $courseIds = [])
    {
        if ($student->user_type !== 'special') {
            Log::info("Skipping course access update - user {$student->email} is not special type");
            return;
        }

        try {
            DB::beginTransaction();

            Log::info("Starting course access update for student {$student->email}", [
                'new_course_ids' => $courseIds,
                'user_id' => $student->id
            ]);

            // Get ALL current enrollments for this student (not just manual ones)
            $allCurrentEnrollments = Enrollment::where('user_id', $student->id)->get();
            
            // Get current direct access enrollments (using 'manual' type for direct access)
            $currentDirectEnrollments = $allCurrentEnrollments->where('enrollment_type', 'manual');
            $currentDirectCourseIds = $currentDirectEnrollments->pluck('course_id')->toArray();

            Log::info("Current direct enrollments for student {$student->email}", [
                'current_direct_course_ids' => $currentDirectCourseIds,
                'total_enrollments' => $allCurrentEnrollments->count(),
                'manual_enrollments' => $currentDirectEnrollments->count()
            ]);

            // Remove enrollments for courses no longer in accessible_courses
            $coursesToRemove = array_diff($currentDirectCourseIds, $courseIds);

            if (!empty($coursesToRemove)) {
                $removedCount = Enrollment::where('user_id', $student->id)
                    ->whereIn('course_id', $coursesToRemove)
                    ->where('enrollment_type', 'manual')
                    ->update(['status' => 'suspended']);

                Log::info("Removed direct access for student {$student->email}", [
                    'removed_course_ids' => $coursesToRemove,
                    'removed_count' => $removedCount
                ]);
            }

            // Add enrollments for new courses
            $coursesToAdd = array_diff($courseIds, $currentDirectCourseIds);

            if (!empty($coursesToAdd)) {
                $newCourses = Course::whereIn('id', $coursesToAdd)
                    ->where('status', 'published')
                    ->get();

                Log::info("Found courses to add for student {$student->email}", [
                    'courses_to_add' => $coursesToAdd,
                    'found_courses' => $newCourses->count()
                ]);

                foreach ($newCourses as $course) {
                    // Check if ANY enrollment exists for this course (not just manual)
                    $existingEnrollment = Enrollment::where('user_id', $student->id)
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingEnrollment) {
                        // If exists and is manual type, reactivate it
                        if ($existingEnrollment->enrollment_type === 'manual') {
                            $existingEnrollment->update(['status' => 'active']);
                            Log::info("Reactivated existing manual enrollment for student {$student->email} to course {$course->title}");
                        } else {
                            // If exists but different type (group_assignment, purchase), create new manual enrollment
                            Enrollment::create([
                                'user_id' => $student->id,
                                'course_id' => $course->id,
                                'enrolled_at' => now(),
                                'status' => 'active',
                                'progress_percentage' => 0,
                                'enrollment_type' => 'manual',
                                'last_accessed_at' => now()
                            ]);
                            Log::info("Created new manual enrollment (existing {$existingEnrollment->enrollment_type} enrollment) for student {$student->email} to course {$course->title}");
                        }
                    } else {
                        // Create new enrollment
                        $newEnrollment = Enrollment::create([
                            'user_id' => $student->id,
                            'course_id' => $course->id,
                            'enrolled_at' => now(),
                            'status' => 'active',
                            'progress_percentage' => 0,
                            'enrollment_type' => 'manual',
                            'last_accessed_at' => now()
                        ]);
                        Log::info("Created new manual enrollment for student {$student->email} to course {$course->title}", [
                            'enrollment_id' => $newEnrollment->id
                        ]);
                    }
                }
            }

            DB::commit();
            
            // Log final state
            $finalEnrollments = Enrollment::where('user_id', $student->id)
                ->where('enrollment_type', 'manual')
                ->where('status', 'active')
                ->pluck('course_id')
                ->toArray();
                
            Log::info("Completed course access update for student {$student->email}", [
                'final_active_manual_course_ids' => $finalEnrollments
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error updating direct course access for student {$student->email}: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Reset and re-enroll special student with clean course access
     */
    public function resetAndReenrollSpecialStudent(User $student)
    {
        if ($student->user_type !== 'special') {
            return;
        }

        try {
            DB::beginTransaction();

            // Remove all existing enrollments for this student
            Enrollment::where('user_id', $student->id)->delete();
            
            // Re-enroll with current settings
            $this->autoEnrollStudentToGroupCourses($student);

            DB::commit();
            
            Log::info("Reset and re-enrolled special student {$student->email}");
            
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Error resetting special student enrollment: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get available courses for assignment
     */
    public function getAvailableCoursesForGroup(UserGroup $userGroup)
    {
        $assignedCourseIds = $userGroup->assignedCourses()->pluck('course_id');
        
        return Course::where('status', 'published')
            ->whereNotIn('id', $assignedCourseIds)
            ->orderBy('title')
            ->get();
    }
}
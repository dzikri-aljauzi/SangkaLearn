<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\UserGroup;
use App\Services\CourseAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GroupCourseController extends Controller
{
    protected $courseAssignmentService;

    public function __construct(CourseAssignmentService $courseAssignmentService)
    {
        $this->courseAssignmentService = $courseAssignmentService;
    }

    /**
     * Show group course assignment page
     */
    public function index(UserGroup $group)
    {
        try {
            $group->load('assignedCourses');
            
            $assignedCourses = $group->assignedCourses()
                ->withPivot(['assigned_at', 'expires_at'])
                ->orderBy('title')
                ->get();

            $availableCourses = $this->courseAssignmentService->getAvailableCoursesForGroup($group);

            // Get special students count
            $specialStudentsCount = $group->specialStudents()->count();

            return Inertia::render('Admin/Groups/Courses', [
                'group' => $group,
                'assignedCourses' => $assignedCourses,
                'availableCourses' => $availableCourses,
                'specialStudentsCount' => $specialStudentsCount
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading group courses: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load group courses');
        }
    }

    /**
     * Assign course to group
     */
    public function assignCourse(Request $request, UserGroup $group)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'expires_at' => 'nullable|date|after:now'
        ]);

        try {
            $course = Course::findOrFail($validated['course_id']);
            
            $this->courseAssignmentService->assignCourseToGroup(
                $group, 
                $course, 
                $validated['expires_at'] ?? null
            );

            $studentsCount = $group->specialStudents()->count();
            
            return response()->json([
                'success' => true,
                'message' => "Course '{$course->title}' assigned to group '{$group->name}' and {$studentsCount} students auto-enrolled."
            ]);

        } catch (\Exception $e) {
            Log::error('Error assigning course to group: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign course to group. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove course assignment from group
     */
    public function removeCourse(UserGroup $group, Course $course)
    {
        try {
            $this->courseAssignmentService->removeCourseFromGroup($group, $course);

            return response()->json([
                'success' => true,
                'message' => "Course '{$course->title}' removed from group '{$group->name}'."
            ]);

        } catch (\Exception $e) {
            Log::error('Error removing course from group: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove course from group. Please try again.'
            ], 500);
        }
    }

    /**
     * Update course assignment (e.g., expiry date)
     */
    public function updateCourse(Request $request, UserGroup $group, Course $course)
    {
        $validated = $request->validate([
            'expires_at' => 'nullable|date|after:now'
        ]);

        try {
            DB::beginTransaction();

            $group->assignedCourses()->updateExistingPivot($course->id, [
                'expires_at' => $validated['expires_at']
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Course assignment updated successfully."
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error updating course assignment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course assignment. Please try again.'
            ], 500);
        }
    }

    /**
     * Get courses available for assignment
     */
    public function getAvailableCourses(UserGroup $group)
    {
        try {
            $availableCourses = $this->courseAssignmentService->getAvailableCoursesForGroup($group);

            return response()->json([
                'success' => true,
                'courses' => $availableCourses
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching available courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available courses'
            ], 500);
        }
    }

    /**
     * Bulk assign courses
     */
    public function bulkAssignCourses(Request $request, UserGroup $group)
    {
        $validated = $request->validate([
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'required|exists:courses,id',
            'expires_at' => 'nullable|date|after:now'
        ]);

        try {
            DB::beginTransaction();

            $successCount = 0;
            $errors = [];

            foreach ($validated['course_ids'] as $courseId) {
                try {
                    $course = Course::findOrFail($courseId);
                    $this->courseAssignmentService->assignCourseToGroup(
                        $group, 
                        $course, 
                        $validated['expires_at'] ?? null
                    );
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = "Failed to assign course ID {$courseId}: " . $e->getMessage();
                }
            }

            DB::commit();

            $studentsCount = $group->specialStudents()->count();
            $message = "{$successCount} courses assigned to group '{$group->name}' and students auto-enrolled.";
            
            if (!empty($errors)) {
                $message .= " Some errors occurred: " . implode(', ', $errors);
            }

            return response()->json([
                'success' => $successCount > 0,
                'message' => $message,
                'assigned_count' => $successCount,
                'error_count' => count($errors)
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error bulk assigning courses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign courses. Please try again.'
            ], 500);
        }
    }
}
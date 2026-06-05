<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Models\LessonView;
use App\Models\Course;
use App\Notifications\LessonCompleted;
use App\Services\ProgressTrackingService;

class LessonController extends Controller
{
    /**
     * Show a lesson for student access
     */
    public function show(Lesson $lesson)
    {
        $user = Auth::user();
        
        // Load lesson with course and section
        $lesson->load([
            'course',
            'section'
        ]);
        
        // Check if user is enrolled in the course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->where('status', 'active')
            ->first();
            
        if (!$enrollment) {
            abort(403, 'You need to be enrolled in this course to access this lesson.');
        }
        
        // Check if lesson is published
        if (!$lesson->is_published) {
            abort(404, 'Lesson not found or not available.');
        }
        
        // Record lesson view
        $this->recordLessonView($lesson->id, $user->id);
        
        // Check if lesson is completed (check both tables for consistency)
        $isCompleted = DB::table('lesson_access')
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->exists() || DB::table('lesson_completions')
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->whereNotNull('completed_at')
            ->exists();
        
        // Get next and previous lessons in the same course
        $nextLesson = Lesson::where('course_id', $lesson->course_id)
            ->where('is_published', true)
            ->where('sort_order', '>', $lesson->sort_order)
            ->orderBy('sort_order')
            ->first();
            
        $previousLesson = Lesson::where('course_id', $lesson->course_id)
            ->where('is_published', true)
            ->where('sort_order', '<', $lesson->sort_order)
            ->orderBy('sort_order', 'desc')
            ->first();
        
        return Inertia::render('Student/LessonView', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'content' => $lesson->content,
                'content_blocks' => $lesson->content_blocks,
                'content_images' => $lesson->content_images,
                'type' => $lesson->type,
                'video_url' => $lesson->video_url,
                'video_file' => $lesson->video_file,
                'video_provider' => $lesson->video_provider,
                'video_duration' => $lesson->video_duration,
                'document_file' => $lesson->document_file,
                'document_filename' => $lesson->document_filename,
                'document_size' => $lesson->document_size,
                'attachments' => $lesson->attachments,
                'is_preview' => $lesson->is_preview,
                'sort_order' => $lesson->sort_order,
                'course' => [
                    'id' => $lesson->course->id,
                    'title' => $lesson->course->title,
                    'slug' => $lesson->course->slug
                ],
                'section' => [
                    'id' => $lesson->section->id,
                    'title' => $lesson->section->title
                ]
            ],
            'isCompleted' => $isCompleted,
            'nextLesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title
            ] : null,
            'previousLesson' => $previousLesson ? [
                'id' => $previousLesson->id,
                'title' => $previousLesson->title
            ] : null,
            'enrollment' => [
                'id' => $enrollment->id,
                'progress_percentage' => $enrollment->progress_percentage
            ]
        ]);
    }
    
    /**
     * Mark lesson as completed
     */
    public function markComplete(Request $request, Lesson $lesson)
    {
        $user = Auth::user();

        // Check if user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Not enrolled in this course'], 403);
        }

        // Check sequential access - lesson must be unlocked
        $progressService = new ProgressTrackingService();
        if (!$progressService->isContentAccessible($user->id, $lesson->course_id, 'lesson', $lesson->id)) {
            return response()->json(['error' => 'Anda harus menyelesaikan materi sebelumnya terlebih dahulu.'], 403);
        }

        // Mark lesson as completed using lesson_completions table
        DB::table('lesson_completions')->updateOrInsert(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id
            ],
            [
                'completed_at' => now(),
                'course_id' => $lesson->course_id,
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // Also insert into lesson_access for backward compatibility
        // This ensures consistent behavior across the system
        DB::table('lesson_access')->updateOrInsert(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id
            ],
            [
                'first_accessed_at' => now(),
                'last_accessed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // Update course progress using ProgressTrackingService
        // Use calculateCourseProgress for consistent progress calculation across the system
        $progressService = new ProgressTrackingService();
        $newProgress = $progressService->calculateCourseProgress($user->id, $lesson->course_id);

        // Update enrollment with the calculated progress
        $progressService->updateEnrollmentProgress($user->id, $lesson->course_id, [
            'progress_percentage' => $newProgress
        ]);

        // Get course for notification
        $course = Course::find($lesson->course_id);

        // Reload enrollment to get updated progress
        $enrollment->refresh();

        // Send notification
        if ($course) {
            $user->notify(new LessonCompleted($lesson, $course, $enrollment->progress_percentage ?? 0));
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson marked as completed'
        ]);
    }
    
    /**
     * Record lesson view for analytics
     */
    private function recordLessonView($lessonId, $userId)
    {
        try {
            LessonView::create([
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'viewed_at' => now()
            ]);
        } catch (\Exception $e) {
            // If lesson_views table doesn't exist, silently continue
        }
    }
}

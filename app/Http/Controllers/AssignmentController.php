<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use App\Notifications\Admin\NewAssignmentSubmission;
use Illuminate\Support\Facades\Notification;
use App\Services\ProgressTrackingService;

class AssignmentController extends Controller
{
    /**
     * Show an assignment for student access
     */
    public function show(Assignment $assignment)
    {
        $user = Auth::user();
        
        // Load assignment with course and section
        $assignment->load([
            'course',
            'section'
        ]);
        
        // Check if user is enrolled in the course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            abort(403, 'You need to be enrolled in this course to access this assignment.');
        }

        // Check if assignment is published
        if (!$assignment->is_published) {
            abort(404, 'Assignment not found or not available.');
        }

        // Check sequential access
        $progressService = new ProgressTrackingService();
        if (!$progressService->isContentAccessible($user->id, $assignment->course_id, 'assignment', $assignment->id)) {
            return redirect()->route('courses.learn', $assignment->course->slug)
                ->with('error', 'Anda harus menyelesaikan materi sebelumnya terlebih dahulu sebelum mengakses tugas ini.');
        }

        // Get user's submission if exists
        $submission = AssignmentSubmission::where('user_id', $user->id)
            ->where('assignment_id', $assignment->id)
            ->first();
        
        // Check if submission is still allowed
        $canSubmit = true;
        $isLate = false;
        if ($assignment->due_date) {
            $isLate = now() > $assignment->due_date;
            $canSubmit = $assignment->allow_late_submission || !$isLate;
        }
        
        return Inertia::render('Student/AssignmentView', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'instructions' => $assignment->instructions,
                'max_points' => $assignment->max_points,
                'due_date' => $assignment->due_date,
                'allow_late_submission' => $assignment->allow_late_submission,
                'late_penalty_percent' => $assignment->late_penalty_percent,
                'submission_types' => $assignment->submission_types,
                'sort_order' => $assignment->sort_order,
                'course' => [
                    'id' => $assignment->course->id,
                    'title' => $assignment->course->title,
                    'slug' => $assignment->course->slug
                ],
                'section' => [
                    'id' => $assignment->section->id,
                    'title' => $assignment->section->title
                ]
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'content' => $submission->content,
                'attachments' => $submission->attachments,
                'status' => $submission->status,
                'grade' => $submission->grade,
                'grade_percentage' => $submission->grade_percentage,
                'grade_points' => $submission->grade_points,
                'formatted_grade' => $submission->formatted_grade,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at
            ] : null,
            'canSubmit' => $canSubmit,
            'isLate' => $isLate,
            'enrollment' => [
                'id' => $enrollment->id,
                'progress_percentage' => $enrollment->progress_percentage
            ]
        ]);
    }
    
    /**
     * Submit an assignment
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $user = Auth::user();
        
        // Check if user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Not enrolled in this course'], 403);
        }
        
        // Check if assignment is published
        if (!$assignment->is_published) {
            return response()->json(['error' => 'Assignment not available'], 404);
        }

        // Check sequential access - assignment must be unlocked
        $progressService = new ProgressTrackingService();
        if (!$progressService->isContentAccessible($user->id, $assignment->course_id, 'assignment', $assignment->id)) {
            return response()->json(['error' => 'Anda harus menyelesaikan materi sebelumnya terlebih dahulu sebelum mengerjakan tugas ini.'], 403);
        }

        // Check if submission is allowed
        $isLate = false;
        if ($assignment->due_date) {
            $isLate = now() > $assignment->due_date;
            if ($isLate && !$assignment->allow_late_submission) {
                return response()->json(['error' => 'Assignment submission deadline has passed'], 400);
            }
        }
        
        // Validate request
        $request->validate([
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240' // 10MB max per file
        ]);
        
        // Handle file uploads
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('assignments/' . $assignment->id, 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType()
                ];
            }
        }
        
        // Create or update submission
        $submission = AssignmentSubmission::updateOrCreate(
            [
                'user_id' => $user->id,
                'assignment_id' => $assignment->id
            ],
            [
                'content' => $request->content,
                'attachments' => $attachments,
                'status' => 'submitted',
                'submitted_at' => now()
            ]
        );

        // Update enrollment progress using ProgressTrackingService
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->first();

        if ($enrollment) {
            try {
                // Update enrollment progress using ProgressTrackingService
                // Use calculateCourseProgress for consistent progress calculation across the system
                $progressService = new ProgressTrackingService();
                $newProgress = $progressService->calculateCourseProgress($user->id, $assignment->course_id);

                // Update enrollment progress (will auto-add to certificate queue if reaches 100%)
                $progressService->updateEnrollmentProgress($user->id, $assignment->course_id, [
                    'progress_percentage' => $newProgress
                ]);
            } catch (\Exception $e) {
                Log::error('Error updating enrollment progress after assignment submission: ' . $e->getMessage());
            }
        }

        // Send notification to all admins
        $admins = User::whereHas('roles', function($q) {
            $q->where('name', 'admin');
        })->get();
        Notification::send($admins, new NewAssignmentSubmission($assignment, $submission, $user));

        return response()->json([
            'success' => true,
            'message' => 'Assignment submitted successfully',
            'submission' => $submission
        ]);
    }
    
    /**
     * View user's submission
     */
    public function viewSubmission(Assignment $assignment)
    {
        $user = Auth::user();
        
        // Check if user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            abort(403, 'You need to be enrolled in this course to view this submission.');
        }
        
        // Get user's submission with assignment relation
        $submission = AssignmentSubmission::with('assignment')
            ->where('user_id', $user->id)
            ->where('assignment_id', $assignment->id)
            ->first();

        if (!$submission) {
            abort(404, 'No submission found for this assignment.');
        }

        // Load assignment with course
        $assignment->load(['course', 'section']);
        
        return Inertia::render('Student/AssignmentSubmission', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'max_points' => $assignment->max_points,
                'due_date' => $assignment->due_date,
                'course' => [
                    'id' => $assignment->course->id,
                    'title' => $assignment->course->title,
                    'slug' => $assignment->course->slug
                ],
                'section' => [
                    'id' => $assignment->section->id,
                    'title' => $assignment->section->title
                ]
            ],
            'submission' => [
                'id' => $submission->id,
                'content' => $submission->content,
                'attachments' => $submission->attachments,
                'status' => $submission->status,
                'grade' => $submission->grade,
                'grade_percentage' => $submission->grade_percentage,
                'grade_points' => $submission->grade_points,
                'formatted_grade' => $submission->formatted_grade,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at
            ]
        ]);
    }
}

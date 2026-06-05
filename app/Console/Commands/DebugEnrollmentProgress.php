<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use App\Models\CertificateQueue;
use App\Services\ProgressTrackingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DebugEnrollmentProgress extends Command
{
    protected $signature = 'enrollment:debug
                            {--email= : Check specific user by email}
                            {--user= : Check specific user by ID}
                            {--course= : Check specific course by ID}
                            {--fix : Recalculate and fix progress for found enrollments}';

    protected $description = 'Debug enrollment progress - check actual vs stored progress';

    public function handle()
    {
        $email = $this->option('email');
        $userId = $this->option('user');
        $courseId = $this->option('course');
        $shouldFix = $this->option('fix');

        $this->info('=== Enrollment Progress Debugger ===');
        $this->newLine();

        // Build query
        $query = Enrollment::with(['user', 'course']);

        if ($email) {
            $user = User::where('email', $email)->first();
            if (!$user) {
                $this->error("User with email '{$email}' not found.");
                return 1;
            }
            $query->where('user_id', $user->id);
            $this->info("Checking enrollments for: {$user->name} ({$email})");
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        $enrollments = $query->get();

        if ($enrollments->isEmpty()) {
            $this->warn('No enrollments found.');
            return 0;
        }

        $this->info("Found {$enrollments->count()} enrollments.");
        $this->newLine();

        $progressService = new ProgressTrackingService();
        $needsFix = [];

        foreach ($enrollments as $enrollment) {
            $this->info("--- Course: {$enrollment->course->title} ---");

            // Get stored progress
            $storedProgress = $enrollment->progress_percentage;

            // Calculate actual progress
            $actualProgress = $progressService->calculateCourseProgress(
                $enrollment->user_id,
                $enrollment->course_id
            );

            // Get detailed breakdown
            $details = $this->getProgressDetails($enrollment);

            $this->table(
                ['Metric', 'Value'],
                [
                    ['User ID', $enrollment->user_id],
                    ['User Name', $enrollment->user->name ?? 'Unknown'],
                    ['Course ID', $enrollment->course_id],
                    ['Stored Progress', $storedProgress . '%'],
                    ['Calculated Progress', $actualProgress . '%'],
                    ['Status', $enrollment->status],
                    ['Completed At', $enrollment->completed_at ?? 'NULL'],
                    ['---', '---'],
                    ['Total Lessons', $details['total_lessons']],
                    ['Completed Lessons', $details['completed_lessons']],
                    ['Total Quizzes', $details['total_quizzes']],
                    ['Passed Quizzes', $details['passed_quizzes']],
                    ['Total Assignments', $details['total_assignments']],
                    ['Submitted Assignments', $details['submitted_assignments']],
                    ['---', '---'],
                    ['Has Certificate', $enrollment->course->has_certificate ? 'Yes' : 'No'],
                    ['Certificate in Queue', $details['has_certificate'] ? 'Yes' : 'No'],
                ]
            );

            // Check if progress mismatch
            if (abs($storedProgress - $actualProgress) > 0.01) {
                $this->warn("MISMATCH: Stored={$storedProgress}%, Actual={$actualProgress}%");
                $needsFix[] = [
                    'enrollment' => $enrollment,
                    'stored' => $storedProgress,
                    'actual' => $actualProgress,
                ];
            }

            // Check if 100% but no certificate
            if ($actualProgress >= 100 && !$details['has_certificate'] && $enrollment->course->has_certificate) {
                $this->error("ISSUE: Progress is 100% but no certificate generated!");
                $needsFix[] = [
                    'enrollment' => $enrollment,
                    'stored' => $storedProgress,
                    'actual' => $actualProgress,
                    'needs_certificate' => true,
                ];
            }

            $this->newLine();
        }

        // Fix if requested
        if ($shouldFix && !empty($needsFix)) {
            $this->warn("Found " . count($needsFix) . " enrollments that need fixing.");

            if ($this->confirm('Do you want to fix these enrollments?')) {
                foreach ($needsFix as $item) {
                    $enrollment = $item['enrollment'];
                    $actualProgress = $item['actual'];

                    // Update progress
                    $enrollment->update([
                        'progress_percentage' => $actualProgress,
                        'status' => $actualProgress >= 100 ? 'completed' : 'active',
                        'completed_at' => $actualProgress >= 100 ? ($enrollment->completed_at ?? now()) : null,
                    ]);

                    $this->info("Updated enrollment {$enrollment->id}: progress = {$actualProgress}%");

                    // Generate certificate if needed
                    if (isset($item['needs_certificate']) && $item['needs_certificate']) {
                        $progressService->addToCertificateQueue($enrollment);
                        $this->info("Generated certificate for enrollment {$enrollment->id}");
                    }
                }

                $this->info('Fix completed!');
            }
        } elseif (!empty($needsFix)) {
            $this->warn("Found " . count($needsFix) . " enrollments with issues. Run with --fix to repair.");
        }

        return 0;
    }

    private function getProgressDetails($enrollment)
    {
        $course = $enrollment->course;
        $userId = $enrollment->user_id;
        $courseId = $enrollment->course_id;

        // Get lesson counts
        $totalLessons = DB::table('lessons')
            ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->count();

        $completedLessons = DB::table('lesson_completions')
            ->join('lessons', 'lesson_completions.lesson_id', '=', 'lessons.id')
            ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->where('lesson_completions.user_id', $userId)
            ->whereNotNull('lesson_completions.completed_at')
            ->count();

        // Also check lesson_access table
        $accessedLessons = DB::table('lesson_access')
            ->join('lessons', 'lesson_access.lesson_id', '=', 'lessons.id')
            ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->where('lesson_access.user_id', $userId)
            ->count();

        $completedLessons = max($completedLessons, $accessedLessons);

        // Get quiz counts
        $totalQuizzes = DB::table('quizzes')
            ->join('course_sections', 'quizzes.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->count();

        $passedQuizzes = DB::table('quiz_attempts')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->join('course_sections', 'quizzes.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->where('quiz_attempts.user_id', $userId)
            ->where('quiz_attempts.status', 'completed')
            ->where('quiz_attempts.is_passed', true)
            ->distinct('quiz_attempts.quiz_id')
            ->count('quiz_attempts.quiz_id');

        // Get assignment counts
        $totalAssignments = DB::table('assignments')
            ->join('course_sections', 'assignments.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->count();

        $submittedAssignments = DB::table('assignment_submissions')
            ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
            ->join('course_sections', 'assignments.section_id', '=', 'course_sections.id')
            ->where('course_sections.course_id', $courseId)
            ->where('assignment_submissions.user_id', $userId)
            ->whereIn('assignment_submissions.status', ['submitted', 'graded'])
            ->distinct('assignment_submissions.assignment_id')
            ->count('assignment_submissions.assignment_id');

        // Check certificate
        $hasCertificate = CertificateQueue::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('is_primary', true)
            ->exists();

        return [
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'total_quizzes' => $totalQuizzes,
            'passed_quizzes' => $passedQuizzes,
            'total_assignments' => $totalAssignments,
            'submitted_assignments' => $submittedAssignments,
            'has_certificate' => $hasCertificate,
        ];
    }
}

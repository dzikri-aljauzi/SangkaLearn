<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\LessonCompletion;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use Illuminate\Console\Command;

class DebugCourseProgress extends Command
{
    protected $signature = 'debug:course {email} {course_title}';
    protected $description = 'Debug course progress calculation';

    public function handle()
    {
        $email = $this->argument('email');
        $courseTitle = $this->argument('course_title');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User not found");
            return 1;
        }

        $course = Course::where('title', 'like', "%{$courseTitle}%")->first();
        if (!$course) {
            $this->error("Course not found");
            return 1;
        }

        $this->info("=== Course Structure ===");
        $this->info("Course: {$course->title}");

        // Count through sections
        $totalLessons = 0;
        $totalQuizzes = 0;
        $totalAssignments = 0;

        foreach ($course->sections as $section) {
            $totalLessons += $section->lessons->count();
            $totalQuizzes += $section->quizzes->count();
            $totalAssignments += $section->assignments->count();
        }

        $this->info("Total Lessons: {$totalLessons}");
        $this->info("Total Quizzes: {$totalQuizzes}");
        $this->info("Total Assignments: {$totalAssignments}");
        $this->info("Total Items: " . ($totalLessons + $totalQuizzes + $totalAssignments));

        $this->newLine();
        $this->info("=== User Completions ===");

        // Check completed lessons
        $completedLessons = LessonCompletion::where('user_id', $user->id)
            ->whereHas('lesson', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->whereNotNull('completed_at')
            ->count();

        $this->info("Completed Lessons: {$completedLessons}");

        // Check completed quizzes
        $completedQuizzes = QuizAttempt::where('user_id', $user->id)
            ->whereHas('quiz', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->where('status', 'completed')
            ->distinct('quiz_id')
            ->count('quiz_id');

        $this->info("Completed Quizzes: {$completedQuizzes}");

        // Check completed assignments
        $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
            ->whereHas('assignment', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->whereIn('status', ['submitted', 'graded'])
            ->distinct('assignment_id')
            ->count('assignment_id');

        $this->info("Completed Assignments: {$completedAssignments}");

        $totalCompleted = $completedLessons + $completedQuizzes + $completedAssignments;
        $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;
        $progress = $totalItems > 0 ? round(($totalCompleted / $totalItems) * 100, 2) : 0;

        $this->newLine();
        $this->info("=== Progress Calculation ===");
        $this->info("Total Completed: {$totalCompleted} / {$totalItems}");
        $this->info("Progress: {$progress}%");

        return 0;
    }
}

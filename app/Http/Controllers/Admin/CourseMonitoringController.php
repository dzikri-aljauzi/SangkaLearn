<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseMonitoringController extends Controller
{
    public function index()
    {
        try {
            $courses = Course::with([
                'instructor:id,first_name,last_name,email',
                'enrollments'
            ])
            ->withCount([
                'enrollments'
            ])
            ->get()
            ->map(function ($course) {
                // Safely count sections and content
                $sectionsCount = 0;
                $totalLessons = 0;
                $totalAssignments = 0;
                $totalQuizzes = 0;

                try {
                    $sectionsCount = $course->sections()->count();
                    $totalLessons = $course->lessons()->count();
                    $totalAssignments = $course->assignments()->count();
                    $totalQuizzes = $course->quizzes()->count();
                } catch (\Exception $e) {
                    // If relationships don't exist, use defaults
                    \Log::warning("Error counting course content for course {$course->id}: " . $e->getMessage());
                }

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'description' => $course->description,
                    'thumbnail' => $course->thumbnail,
                    'status' => $course->status,
                    'price' => $course->price,
                    'created_at' => $course->created_at,
                    'instructor' => $course->instructor,
                    'enrollments_count' => $course->enrollments_count,
                    'sections_count' => $sectionsCount,
                    'total_lessons' => $totalLessons,
                    'total_assignments' => $totalAssignments,
                    'total_quizzes' => $totalQuizzes,
                    'total_content' => $totalLessons + $totalAssignments + $totalQuizzes,
                ];
            });

            return Inertia::render('Admin/CourseMonitoring/Index', [
                'courses' => $courses
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in CourseMonitoring index: ' . $e->getMessage());

            // Return fallback data
            return Inertia::render('Admin/CourseMonitoring/Index', [
                'courses' => [],
                'error' => 'Error loading course data. Please check the logs.'
            ]);
        }
    }

    public function show(Course $course)
    {
        try {
            // Load basic relationships safely
            $course->load([
                'instructor:id,first_name,last_name,email',
                'enrollments' => function ($query) {
                    $query->with('user:id,first_name,last_name,email');
                }
            ]);

            // Load lessons with their progress data
            $lessons = $course->lessons()
                ->with(['section'])
                ->get()
                ->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'section' => $lesson->section ? $lesson->section->title : null,
                        'type' => $lesson->type ?? 'lesson',
                        'views' => 0, // TODO: Implement lesson views tracking
                    ];
                });

            // Load assignments with submission counts
            $assignments = \App\Models\Assignment::where('course_id', $course->id)
                ->with(['section', 'submissions'])
                ->get()
                ->map(function ($assignment) {
                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'section' => $assignment->section ? $assignment->section->title : null,
                        'total_submissions' => $assignment->submissions->count(),
                        'graded_submissions' => $assignment->submissions->whereNotNull('grade')->count(),
                        'ungraded_submissions' => $assignment->submissions->whereNull('grade')->count(),
                        'average_score' => round($assignment->submissions->whereNotNull('grade')->avg('grade') ?? 0, 2),
                    ];
                });

            // Load quizzes with attempt counts
            $quizzes = \App\Models\Quiz::where('course_id', $course->id)
                ->with(['section', 'attempts'])
                ->get()
                ->map(function ($quiz) {
                    $completedAttempts = $quiz->attempts->where('status', 'completed');
                    return [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                        'section' => $quiz->section ? $quiz->section->title : null,
                        'total_attempts' => $quiz->attempts->count(),
                        'completed_attempts' => $completedAttempts->count(),
                        'in_progress_attempts' => $quiz->attempts->where('status', 'in_progress')->count(),
                        'average_score' => round($completedAttempts->avg('score') ?? 0, 2),
                        'pass_rate' => $completedAttempts->count() > 0
                            ? round(($completedAttempts->where('score', '>=', $quiz->passing_score ?? 70)->count() / $completedAttempts->count()) * 100, 1)
                            : 0,
                    ];
                });

            // Calculate course statistics
            $stats = [
                'total_enrollments' => $course->enrollments->count(),
                'total_lessons' => $lessons->count(),
                'total_assignments' => $assignments->count(),
                'total_quizzes' => $quizzes->count(),
                'total_lesson_views' => 0, // TODO: Implement
                'total_assignment_submissions' => $assignments->sum('total_submissions'),
                'total_quiz_attempts' => $quizzes->sum('total_attempts'),
            ];

            return Inertia::render('Admin/CourseMonitoring/Show', [
                'course' => $course,
                'stats' => $stats,
                'lessons' => $lessons,
                'assignments' => $assignments,
                'quizzes' => $quizzes,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in CourseMonitoring show: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            // Return fallback response
            return Inertia::render('Admin/CourseMonitoring/Show', [
                'course' => $course,
                'stats' => [
                    'total_enrollments' => 0,
                    'total_lessons' => 0,
                    'total_assignments' => 0,
                    'total_quizzes' => 0,
                    'total_lesson_views' => 0,
                    'total_assignment_submissions' => 0,
                    'total_quiz_attempts' => 0,
                ],
                'lessons' => [],
                'assignments' => [],
                'quizzes' => [],
                'error' => 'Error loading course details. Please check the logs.'
            ]);
        }
    }
}
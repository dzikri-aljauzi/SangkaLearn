<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonView;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $query = Lesson::with([
            'course',
            'section',
            'views' => function($q) {
                $q->with('user')->latest();
            },
            'completions' => function($q) {
                $q->with('user')->whereNotNull('completed_at');
            }
        ]);

        // Filter by course
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        // Search by title
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $lessons = $query->latest()->paginate(10)->withQueryString();

        // Get statistics for each lesson
        $lessons->getCollection()->transform(function ($lesson) {
            $lesson->stats = [
                'total_views' => $lesson->views->count(),
                'unique_viewers' => $lesson->views->unique('user_id')->count(),
                'completion_rate' => $this->getCompletionRate($lesson),
                'average_duration' => round($lesson->views->avg('duration'), 2),
                'last_viewed' => $lesson->views->first()?->created_at,
            ];
            return $lesson;
        });

        $courses = Course::select('id', 'title')->get();

        return Inertia::render('Admin/LessonMonitoring/Index', [
            'lessons' => $lessons,
            'courses' => $courses,
            'filters' => [
                'search' => $request->search,
                'course_id' => $request->course_id,
            ]
        ]);
    }

    public function show($id)
    {
        $lesson = Lesson::with([
            'course',
            'section',
            'views' => function($q) {
                $q->with('user')
                  ->orderBy('created_at', 'desc');
            },
            'completions' => function($q) {
                $q->with('user')->whereNotNull('completed_at');
            }
        ])->findOrFail($id);

        // Get detailed statistics
        $stats = [
            'total_views' => $lesson->views->count(),
            'unique_viewers' => $lesson->views->unique('user_id')->count(),
            'completion_rate' => $this->getCompletionRate($lesson),
            'average_duration' => round($lesson->views->avg('duration'), 2),
            'total_duration' => $lesson->views->sum('duration'),
            'bounce_rate' => $this->getBounceRate($lesson),
        ];

        // Group views by date for chart
        $viewsByDate = $lesson->views->groupBy(function($view) {
            return $view->created_at->format('Y-m-d');
        })->map(function($views) {
            return $views->count();
        });

        // User engagement data
        $userEngagement = $lesson->views->groupBy('user_id')->map(function($userViews) use ($lesson) {
            $user = $userViews->first()->user;
            $hasCompletion = $lesson->completions->where('user_id', $user->id)->where('completed_at', '!=', null)->count() > 0;

            return [
                'user' => $user,
                'total_views' => $userViews->count(),
                'total_duration' => $userViews->sum('duration'),
                'first_view' => $userViews->min('created_at'),
                'last_view' => $userViews->max('created_at'),
                'completed' => $hasCompletion,
            ];
        })->values();

        return Inertia::render('Admin/LessonMonitoring/Show', [
            'lesson' => $lesson,
            'stats' => $stats,
            'viewsByDate' => $viewsByDate,
            'userEngagement' => $userEngagement
        ]);
    }

    public function exportData($id)
    {
        $lesson = Lesson::with([
            'course',
            'section',
            'views' => function($q) {
                $q->with('user')
                  ->orderBy('created_at');
            }
        ])->findOrFail($id);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $lesson->title . '_views.csv"',
        ];

        $callback = function() use ($lesson) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Student Name',
                'Email',
                'View Date',
                'Duration (minutes)',
                'Completed',
                'Progress %',
                'Device/Browser'
            ]);

            foreach ($lesson->views as $view) {
                $duration = $view->duration ? round($view->duration / 60, 2) : 0;
                
                fputcsv($file, [
                    $view->user->name,
                    $view->user->email,
                    $view->created_at ? $view->created_at->format('Y-m-d H:i:s') : '',
                    $duration,
                    $view->completed ? 'Yes' : 'No',
                    $view->progress ?? 0 . '%',
                    $view->user_agent ?? 'Unknown'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getCompletionRate($lesson)
    {
        // Count unique viewers
        $totalViewers = $lesson->views->unique('user_id')->count();
        if ($totalViewers === 0) return 0;

        // Count users who have completed this lesson (from lesson_completions table)
        $completedUsers = $lesson->completions->whereNotNull('completed_at')->unique('user_id')->count();

        return round(($completedUsers / $totalViewers) * 100, 1);
    }

    private function getBounceRate($lesson)
    {
        $totalViews = $lesson->views->count();
        if ($totalViews === 0) return 0;
        
        // Views with less than 30 seconds duration are considered bounces
        $bounces = $lesson->views->where('duration', '<', 30)->count();
        return round(($bounces / $totalViews) * 100, 1);
    }
}
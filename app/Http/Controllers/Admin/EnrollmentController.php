<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\EnrollmentExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class EnrollmentController extends Controller
{
    /**
     * Display enrollment history
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search', '');
            $status = $request->get('status', '');
            $course = $request->get('course', '');
            $dateRange = $request->get('date_range', '');

            // Build query with relationships
            $query = Enrollment::with(['user', 'course'])
                              ->latest('enrolled_at');

            // Search functionality
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->whereHas('user', function($userQuery) use ($search) {
                        $userQuery->where('first_name', 'like', "%{$search}%")
                                  ->orWhere('last_name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('course', function($courseQuery) use ($search) {
                        $courseQuery->where('title', 'like', "%{$search}%");
                    });
                });
            }

            // Filter by status
            if ($status) {
                $query->where('status', $status);
            }

            // Filter by course
            if ($course) {
                $query->where('course_id', $course);
            }

            // Filter by date range
            if ($dateRange) {
                switch ($dateRange) {
                    case 'today':
                        $query->whereDate('enrolled_at', today());
                        break;
                    case 'week':
                        $query->whereBetween('enrolled_at', [now()->startOfWeek(), now()->endOfWeek()]);
                        break;
                    case 'month':
                        $query->whereMonth('enrolled_at', now()->month)
                              ->whereYear('enrolled_at', now()->year);
                        break;
                    case 'year':
                        $query->whereYear('enrolled_at', now()->year);
                        break;
                }
            }

            $enrollments = $query->paginate($perPage);

            // Get statistics
            $stats = $this->getEnrollmentStats();

            // Get courses for filter dropdown - fix to get all courses
            $courses = Course::select('id', 'title')->get();

            return Inertia::render('Admin/Enrollments/Index', [
                'enrollments' => $enrollments,
                'stats' => $stats,
                'courses' => $courses,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'course' => $course,
                    'date_range' => $dateRange,
                    'per_page' => $perPage,
                ]
            ]);
        } catch (\Exception $e) {
            // Log error for debugging
            \Log::error('Enrollment index error: ' . $e->getMessage());
            
            // Return with empty data
            return Inertia::render('Admin/Enrollments/Index', [
                'enrollments' => [
                    'data' => [],
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                    'last_page' => 1,
                    'links' => []
                ],
                'stats' => [
                    'total' => 0,
                    'active' => 0,
                    'completed' => 0,
                    'this_month' => 0,
                    'growth_percentage' => 0,
                    'completion_rate' => 0,
                ],
                'courses' => [],
                'filters' => [
                    'search' => '',
                    'status' => '',
                    'course' => '',
                    'date_range' => '',
                    'per_page' => 15,
                ],
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Show specific enrollment details
     */
    public function show(Enrollment $enrollment)
    {
        // Load relationships with lesson count
        $enrollment->load([
            'user',
            'user.roles',
            'course' => function($query) {
                $query->withCount([
                    'lessons as lesson_count',
                    'quizzes as quiz_count',
                    'assignments as assignment_count'
                ]);
            }
        ]);

        // Get enrollment progress history
        $progressHistory = $this->getProgressHistory($enrollment);

        // Get related enrollments from same user
        $userEnrollments = Enrollment::with('course')
                                   ->where('user_id', $enrollment->user_id)
                                   ->where('id', '!=', $enrollment->id)
                                   ->latest('enrolled_at')
                                   ->take(5)
                                   ->get();

        return Inertia::render('Admin/Enrollments/Show', [
            'enrollment' => $enrollment,
            'progressHistory' => $progressHistory,
            'userEnrollments' => $userEnrollments,
        ]);
    }

    /**
     * Export enrollments to Excel
     */
    public function export(Request $request)
    {
        try {
            // Log the export attempt
            \Log::info('Export enrollment started', [
                'user_id' => auth()->id(),
                'filters' => $request->all()
            ]);

            // Check if we have data to export
            $totalEnrollments = Enrollment::count();
            if ($totalEnrollments === 0) {
                return redirect()->back()->with('error', 'Tidak ada data pendaftaran untuk di-export.');
            }

            // Get filters from request
            $filters = [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'course' => $request->get('course', ''),
                'date_range' => $request->get('date_range', ''),
            ];

            // Create export instance
            $export = new EnrollmentExport($filters);
            
            // Generate filename with timestamp
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "riwayat-pendaftaran_{$timestamp}.xlsx";

            \Log::info('Starting Excel download', ['filename' => $filename]);

            // Generate Excel content manually and return as response
            $content = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
            
            \Log::info('Excel content generated', ['size' => strlen($content)]);
            
            return response($content)
                ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'max-age=0')
                ->header('Content-Length', strlen($content));

        } catch (\Exception $e) {
            \Log::error('Enrollment export error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return JSON response for AJAX requests
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Gagal mengexport data: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Gagal mengexport data: ' . $e->getMessage());
        }
    }

    /**
     * Update enrollment status
     */
    public function updateStatus(Request $request, Enrollment $enrollment)
    {
        $request->validate([
            'status' => 'required|in:active,completed'
        ]);

        $enrollment->update([
            'status' => $request->status,
            'completed_at' => $request->status === 'completed' ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Status pendaftaran berhasil diperbarui.');
    }

    /**
     * Get enrollment statistics
     */
    private function getEnrollmentStats()
    {
        try {
            $total = Enrollment::count();
            $active = Enrollment::where('status', 'active')->count();
            $completed = Enrollment::where('status', 'completed')->count();
            
            $thisMonth = Enrollment::whereMonth('enrolled_at', now()->month)
                                  ->whereYear('enrolled_at', now()->year)
                                  ->count();
                                  
            // Fix the subMonth issue by creating a new Carbon instance
            $lastMonthDate = now()->copy()->subMonth();
            $lastMonth = Enrollment::whereMonth('enrolled_at', $lastMonthDate->month)
                                  ->whereYear('enrolled_at', $lastMonthDate->year)
                                  ->count();
                                  
            $growthPercentage = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : 0;

            return [
                'total' => $total,
                'active' => $active,
                'completed' => $completed,
                'this_month' => $thisMonth,
                'growth_percentage' => $growthPercentage,
                'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            ];
        } catch (\Exception $e) {
            // Return default values if there's an error
            return [
                'total' => 0,
                'active' => 0,
                'completed' => 0,
                'this_month' => 0,
                'growth_percentage' => 0,
                'completion_rate' => 0,
            ];
        }
    }

    /**
     * Get progress history for enrollment - using real data
     */
    private function getProgressHistory($enrollment)
    {
        $history = [];

        try {
            // Get completed lessons
            $completedLessons = \App\Models\LessonCompletion::where('user_id', $enrollment->user_id)
                ->whereHas('lesson', function($q) use ($enrollment) {
                    $q->where('course_id', $enrollment->course_id);
                })
                ->with('lesson:id,title')
                ->whereNotNull('completed_at')
                ->orderBy('completed_at', 'asc')
                ->get();

            foreach ($completedLessons as $completion) {
                $history[] = [
                    'date' => $completion->completed_at,
                    'type' => 'lesson',
                    'activity' => 'Menyelesaikan pelajaran: ' . ($completion->lesson->title ?? 'Untitled'),
                ];
            }

            // Get quiz attempts
            $quizAttempts = \App\Models\QuizAttempt::where('user_id', $enrollment->user_id)
                ->whereHas('quiz', function($q) use ($enrollment) {
                    $q->where('course_id', $enrollment->course_id);
                })
                ->with('quiz:id,title')
                ->where('status', 'completed')
                ->orderBy('completed_at', 'asc')
                ->get();

            foreach ($quizAttempts as $attempt) {
                $score = $attempt->score ?? 0;
                $history[] = [
                    'date' => $attempt->completed_at ?? $attempt->created_at,
                    'type' => 'quiz',
                    'activity' => 'Mengerjakan quiz: ' . ($attempt->quiz->title ?? 'Untitled') . ' (Skor: ' . round($score) . '%)',
                ];
            }

            // Get assignment submissions
            $submissions = \App\Models\AssignmentSubmission::where('user_id', $enrollment->user_id)
                ->whereHas('assignment', function($q) use ($enrollment) {
                    $q->where('course_id', $enrollment->course_id);
                })
                ->with('assignment:id,title')
                ->whereIn('status', ['submitted', 'graded'])
                ->orderBy('submitted_at', 'asc')
                ->get();

            foreach ($submissions as $submission) {
                $status = $submission->status === 'graded' ? ' (Dinilai)' : '';
                $history[] = [
                    'date' => $submission->submitted_at ?? $submission->created_at,
                    'type' => 'assignment',
                    'activity' => 'Mengumpulkan tugas: ' . ($submission->assignment->title ?? 'Untitled') . $status,
                ];
            }

            // Sort all activities by date (ascending - oldest first)
            usort($history, function($a, $b) {
                return strtotime($a['date']) - strtotime($b['date']);
            });

            // Add progress percentage to each item (incremental)
            if (count($history) > 0) {
                $totalItems = count($history);
                foreach ($history as $index => &$item) {
                    $item['progress'] = round((($index + 1) / $totalItems) * $enrollment->progress_percentage);
                }
            }

            // Limit to last 20 activities for performance
            $history = array_slice($history, -20);

        } catch (\Exception $e) {
            \Log::error('Error getting progress history: ' . $e->getMessage());
            // Return empty if error
            $history = [];
        }

        return collect($history);
    }

    /**
     * Get activity description based on progress
     */
    private function getActivityDescription($progress)
    {
        $activities = [
            20 => 'Menyelesaikan modul pengenalan',
            40 => 'Mengerjakan quiz pertama',
            60 => 'Menyelesaikan latihan praktik',
            80 => 'Mengerjakan proyek akhir',
            100 => 'Menyelesaikan seluruh pelatihan'
        ];

        return $activities[$progress] ?? "Progress {$progress}% tercapai";
    }

}
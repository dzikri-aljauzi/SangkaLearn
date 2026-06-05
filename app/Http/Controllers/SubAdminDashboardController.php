<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class SubAdminDashboardController extends Controller
{
    /**
     * Display the sub admin dashboard
     */
    public function index()
    {
        try {
            $subAdmin = Auth::user();
            
            // Load sub admin with user group relationship
            $subAdmin->load('userGroup');
            
            // Get assigned students
            $assignedStudents = User::where('assigned_sub_admin_id', $subAdmin->id)
                ->where('user_type', 'special')
                ->with(['enrollments.course', 'certificates', 'userGroup'])
                ->get();

            // Calculate overview stats
            $totalStudents = $assignedStudents->count();
            $activeStudents = $assignedStudents->where('is_active', true)->count();
            $totalEnrollments = $assignedStudents->sum(function($student) {
                return $student->enrollments->count();
            });
            $completedCourses = $assignedStudents->sum(function($student) {
                return $student->enrollments->filter(function($enrollment) {
                    return $enrollment->status === 'completed' || $enrollment->progress_percentage >= 100;
                })->count();
            });
            $totalCertificates = $assignedStudents->sum(function($student) {
                return $student->certificates->count();
            });

            // Calculate completion rate
            $completionRate = $totalEnrollments > 0 ? round(($completedCourses / $totalEnrollments) * 100, 1) : 0;

            // Get progress data for each student
            $studentsProgress = $assignedStudents->map(function($student) {
                $enrollments = $student->enrollments;
                $totalProgress = 0;
                $courseCount = $enrollments->count();
                
                foreach ($enrollments as $enrollment) {
                    $totalProgress += $enrollment->progress_percentage ?? 0;
                }
                
                $averageProgress = $courseCount > 0 ? round($totalProgress / $courseCount, 1) : 0;
                
                return [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'email' => $student->email,
                    'avatar' => $student->avatar,
                    'user_group' => $student->userGroup,
                    'enrolled_courses' => $courseCount,
                    'completed_courses' => $enrollments->filter(function($enrollment) {
                        return $enrollment->status === 'completed' || $enrollment->progress_percentage >= 100;
                    })->count(),
                    'certificates' => $student->certificates->count(),
                    'average_progress' => $averageProgress,
                    'last_activity' => $student->updated_at,
                    'status' => $student->is_active ? 'active' : 'inactive'
                ];
            })->sortByDesc('average_progress')->take(10);

            // Get recent activities (enrollments and completions)
            $recentActivities = collect();

            // Recent enrollments
            $recentEnrollments = Enrollment::whereIn('user_id', $assignedStudents->pluck('id'))
                ->with(['user', 'course'])
                ->where('created_at', '>=', now()->subDays(30))
                ->latest()
                ->limit(10)
                ->get()
                ->map(function($enrollment) {
                    return [
                        'type' => 'enrollment',
                        'description' => $enrollment->user->first_name . ' ' . $enrollment->user->last_name . ' enrolled in ' . $enrollment->course->title,
                        'user' => $enrollment->user,
                        'course' => $enrollment->course,
                        'date' => $enrollment->created_at,
                        'icon' => 'user-plus'
                    ];
                });

            // Recent completions (status = completed OR progress >= 100%)
            $recentCompletions = Enrollment::whereIn('user_id', $assignedStudents->pluck('id'))
                ->with(['user', 'course'])
                ->where(function($query) {
                    $query->where('status', 'completed')
                          ->orWhere('progress_percentage', '>=', 100);
                })
                ->where(function($query) {
                    $query->where('completed_at', '>=', now()->subDays(30))
                          ->orWhere('updated_at', '>=', now()->subDays(30));
                })
                ->latest('updated_at')
                ->limit(10)
                ->get()
                ->map(function($enrollment) {
                    $completedDate = $enrollment->completed_at ?? $enrollment->updated_at;
                    return [
                        'type' => 'completion',
                        'description' => $enrollment->user->first_name . ' ' . $enrollment->user->last_name . ' completed ' . $enrollment->course->title,
                        'user' => $enrollment->user,
                        'course' => $enrollment->course,
                        'date' => $completedDate,
                        'icon' => 'check-circle'
                    ];
                });

            // Recent certificates
            $recentCertificates = Certificate::whereIn('user_id', $assignedStudents->pluck('id'))
                ->with(['user', 'course'])
                ->where('issued_at', '>=', now()->subDays(30))
                ->latest('issued_at')
                ->limit(10)
                ->get()
                ->map(function($certificate) {
                    return [
                        'type' => 'certificate',
                        'description' => $certificate->user->first_name . ' ' . $certificate->user->last_name . ' earned certificate for ' . $certificate->course->title,
                        'user' => $certificate->user,
                        'course' => $certificate->course,
                        'date' => $certificate->issued_at,
                        'icon' => 'award'
                    ];
                });

            $recentActivities = $recentEnrollments
                ->merge($recentCompletions)
                ->merge($recentCertificates)
                ->sortByDesc('date')
                ->take(15)
                ->values();

            // Progress trends (last 7 days)
            $progressTrends = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);

                // Count completions: status = completed OR progress >= 100% on this date
                $completionsOnDay = Enrollment::whereIn('user_id', $assignedStudents->pluck('id'))
                    ->where(function($query) {
                        $query->where('status', 'completed')
                              ->orWhere('progress_percentage', '>=', 100);
                    })
                    ->where(function($query) use ($date) {
                        $query->whereDate('completed_at', $date)
                              ->orWhereDate('updated_at', $date);
                    })
                    ->count();

                $enrollmentsOnDay = Enrollment::whereIn('user_id', $assignedStudents->pluck('id'))
                    ->whereDate('created_at', $date)
                    ->count();

                $progressTrends[] = [
                    'date' => $date->format('M d'),
                    'completions' => $completionsOnDay,
                    'enrollments' => $enrollmentsOnDay
                ];
            }

            // Course performance (top performing courses)
            $coursePerformance = Course::whereHas('enrollments', function($query) use ($assignedStudents) {
                $query->whereIn('user_id', $assignedStudents->pluck('id'));
            })
            ->withCount(['enrollments as student_enrollments' => function($query) use ($assignedStudents) {
                $query->whereIn('user_id', $assignedStudents->pluck('id'));
            }])
            ->withCount(['enrollments as completed_enrollments' => function($query) use ($assignedStudents) {
                $query->whereIn('user_id', $assignedStudents->pluck('id'))
                      ->where(function($q) {
                          $q->where('status', 'completed')
                            ->orWhere('progress_percentage', '>=', 100);
                      });
            }])
            ->get()
            ->map(function($course) {
                $completionRate = $course->student_enrollments > 0 
                    ? round(($course->completed_enrollments / $course->student_enrollments) * 100, 1) 
                    : 0;
                
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'enrollments' => $course->student_enrollments,
                    'completions' => $course->completed_enrollments,
                    'completion_rate' => $completionRate
                ];
            })
            ->sortByDesc('completion_rate')
            ->take(5)
            ->values();

            $stats = [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_enrollments' => $totalEnrollments,
                'completed_courses' => $completedCourses,
                'total_certificates' => $totalCertificates,
                'completion_rate' => $completionRate
            ];

            return Inertia::render('SubAdmin/Dashboard', [
                'stats' => $stats,
                'studentsProgress' => $studentsProgress,
                'recentActivities' => $recentActivities,
                'progressTrends' => $progressTrends,
                'coursePerformance' => $coursePerformance,
                'subAdmin' => [
                    'id' => $subAdmin->id,
                    'name' => $subAdmin->first_name . ' ' . $subAdmin->last_name,
                    'email' => $subAdmin->email,
                    'user_group' => $subAdmin->userGroup ? [
                        'id' => $subAdmin->userGroup->id,
                        'name' => $subAdmin->userGroup->name,
                        'code' => $subAdmin->userGroup->code
                    ] : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading sub admin dashboard: ' . $e->getMessage());
            
            // Return empty dashboard with error handling
            return Inertia::render('SubAdmin/Dashboard', [
                'stats' => [
                    'total_students' => 0,
                    'active_students' => 0,
                    'total_enrollments' => 0,
                    'completed_courses' => 0,
                    'total_certificates' => 0,
                    'completion_rate' => 0
                ],
                'studentsProgress' => [],
                'recentActivities' => [],
                'progressTrends' => [],
                'coursePerformance' => [],
                'subAdmin' => [
                    'id' => Auth::id(),
                    'name' => Auth::user()->first_name . ' ' . Auth::user()->last_name,
                    'email' => Auth::user()->email,
                    'user_group' => Auth::user()->userGroup ? [
                        'id' => Auth::user()->userGroup->id,
                        'name' => Auth::user()->userGroup->name,
                        'code' => Auth::user()->userGroup->code
                    ] : null
                ],
                'error' => 'Failed to load dashboard data'
            ]);
        }
    }

    /**
     * Get detailed student progress
     */
    public function studentProgress($studentId)
    {
        try {
            $subAdmin = Auth::user();
            
            $student = User::where('id', $studentId)
                ->where('assigned_sub_admin_id', $subAdmin->id)
                ->where('user_type', 'special')
                ->with(['enrollments.course.sections.lessons', 'certificates', 'userGroup'])
                ->firstOrFail();

            $progressDetail = [];
            foreach ($student->enrollments as $enrollment) {
                $course = $enrollment->course;
                $totalLessons = $course->sections->sum(function($section) {
                    return $section->lessons->count();
                });
                
                // Combine both tables for backward compatibility
                $lessonIds = $course->sections->flatMap->lessons->pluck('id');
                $fromCompletions = DB::table('lesson_completions')
                    ->where('user_id', $student->id)
                    ->whereIn('lesson_id', $lessonIds)
                    ->whereNotNull('completed_at')
                    ->pluck('lesson_id')
                    ->toArray();

                $fromAccess = DB::table('lesson_access')
                    ->where('user_id', $student->id)
                    ->whereIn('lesson_id', $lessonIds)
                    ->pluck('lesson_id')
                    ->toArray();

                $completedLessons = count(array_unique(array_merge($fromCompletions, $fromAccess)));

                $progressDetail[] = [
                    'course' => $course,
                    'enrollment' => $enrollment,
                    'total_lessons' => $totalLessons,
                    'completed_lessons' => $completedLessons,
                    'progress_percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 1) : 0
                ];
            }

            return response()->json([
                'student' => $student,
                'progress_detail' => $progressDetail
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching student progress: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch student progress'], 500);
        }
    }

    /**
     * Show assigned students list
     */
    public function students(Request $request)
    {
        try {
            $subAdmin = Auth::user();
            $subAdmin->load('userGroup');
            $search = $request->get('search', '');
            $status = $request->get('status', '');

            $query = User::where('assigned_sub_admin_id', $subAdmin->id)
                ->where('user_type', 'special')
                ->with(['enrollments.course', 'certificates', 'userGroup']);

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('is_active', $status === 'active');
            }

            $students = $query->paginate(15)->withQueryString();

            // Transform data for frontend
            $students->getCollection()->transform(function($student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'avatar' => $student->avatar,
                    'phone' => $student->phone,
                    'is_active' => $student->is_active,
                    'user_group' => $student->userGroup,
                    'enrolled_courses_count' => $student->enrollments->count(),
                    'completed_courses_count' => $student->enrollments->filter(function($enrollment) {
                        return $enrollment->status === 'completed' || $enrollment->progress_percentage >= 100;
                    })->count(),
                    'certificates_count' => $student->certificates->count(),
                    'average_progress' => $student->enrollments->avg('progress_percentage') ?? 0,
                    'last_login' => $student->updated_at, // Use updated_at as last activity indicator
                    'created_at' => $student->created_at
                ];
            });

            return Inertia::render('SubAdmin/Students', [
                'students' => $students,
                'filters' => $request->only(['search', 'status']),
                'subAdmin' => [
                    'id' => $subAdmin->id,
                    'name' => $subAdmin->first_name . ' ' . $subAdmin->last_name,
                    'user_group' => $subAdmin->userGroup ? [
                        'id' => $subAdmin->userGroup->id,
                        'name' => $subAdmin->userGroup->name,
                        'code' => $subAdmin->userGroup->code
                    ] : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading sub admin students: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load students');
        }
    }

    /**
     * Show progress tracking page
     */
    public function progressTracking(Request $request)
    {
        try {
            $subAdmin = Auth::user();
            $subAdmin->load('userGroup');
            
            // Get assigned students with progress data
            $students = User::where('assigned_sub_admin_id', $subAdmin->id)
                ->where('user_type', 'special')
                ->with(['enrollments.course', 'certificates', 'userGroup'])
                ->get();

            // Calculate comprehensive progress data
            $progressData = $students->map(function($student) {
                $enrollments = $student->enrollments;
                $totalEnrollments = $enrollments->count();
                $completedEnrollments = $enrollments->filter(function($enrollment) {
                    return $enrollment->status === 'completed' || $enrollment->progress_percentage >= 100;
                })->count();
                $inProgressEnrollments = $enrollments->where('status', 'active')->count();
                
                $totalProgress = $enrollments->sum('progress_percentage');
                $averageProgress = $totalEnrollments > 0 ? round($totalProgress / $totalEnrollments, 1) : 0;
                
                // Calculate time spent (estimate)
                $estimatedTimeSpent = $enrollments->sum(function($enrollment) {
                    return ($enrollment->progress_percentage / 100) * ($enrollment->course->duration_hours ?? 1);
                });

                return [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'email' => $student->email,
                    'avatar' => $student->avatar,
                    'user_group' => $student->userGroup,
                    'total_enrollments' => $totalEnrollments,
                    'completed_enrollments' => $completedEnrollments,
                    'in_progress_enrollments' => $inProgressEnrollments,
                    'average_progress' => $averageProgress,
                    'certificates_count' => $student->certificates->count(),
                    'estimated_time_spent' => round($estimatedTimeSpent, 1),
                    'last_activity' => $student->updated_at,
                    'is_active' => $student->is_active,
                    'enrollments' => $enrollments->map(function($enrollment) {
                        return [
                            'course_title' => $enrollment->course->title,
                            'progress' => $enrollment->progress_percentage ?? 0,
                            'status' => $enrollment->status,
                            'last_accessed' => $enrollment->last_accessed_at
                        ];
                    })
                ];
            })->sortByDesc('average_progress');

            // Calculate overall stats
            $overallStats = [
                'total_students' => $students->count(),
                'active_students' => $students->where('is_active', true)->count(),
                'students_with_progress' => $progressData->where('average_progress', '>', 0)->count(),
                'average_completion_rate' => $progressData->avg('average_progress') ?? 0,
                'total_courses_assigned' => $progressData->sum('total_enrollments'),
                'total_courses_completed' => $progressData->sum('completed_enrollments')
            ];

            // Get course-wise progress summary
            $courseProgress = Course::whereHas('enrollments', function($query) use ($students) {
                $query->whereIn('user_id', $students->pluck('id'));
            })
            ->withCount(['enrollments as student_enrollments' => function($query) use ($students) {
                $query->whereIn('user_id', $students->pluck('id'));
            }])
            ->withCount(['enrollments as completed_enrollments' => function($query) use ($students) {
                $query->whereIn('user_id', $students->pluck('id'))
                      ->where('status', 'completed');
            }])
            ->with(['enrollments' => function($query) use ($students) {
                $query->whereIn('user_id', $students->pluck('id'))
                      ->select('course_id', 'progress_percentage');
            }])
            ->get()
            ->map(function($course) {
                $avgProgress = $course->enrollments->avg('progress_percentage') ?? 0;
                $completionRate = $course->student_enrollments > 0 
                    ? round(($course->completed_enrollments / $course->student_enrollments) * 100, 1) 
                    : 0;
                
                return [
                    'course_title' => $course->title,
                    'enrolled_students' => $course->student_enrollments,
                    'completed_students' => $course->completed_enrollments,
                    'completion_rate' => $completionRate,
                    'average_progress' => round($avgProgress, 1)
                ];
            })
            ->sortByDesc('completion_rate');

            return Inertia::render('SubAdmin/ProgressTracking', [
                'progressData' => $progressData->values(),
                'overallStats' => $overallStats,
                'courseProgress' => $courseProgress->values(),
                'subAdmin' => [
                    'id' => $subAdmin->id,
                    'name' => $subAdmin->first_name . ' ' . $subAdmin->last_name,
                    'user_group' => $subAdmin->userGroup ? [
                        'id' => $subAdmin->userGroup->id,
                        'name' => $subAdmin->userGroup->name,
                        'code' => $subAdmin->userGroup->code
                    ] : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading progress tracking: ' . $e->getMessage());
            return redirect()->route('subadmin.dashboard')->with('error', 'Failed to load progress tracking');
        }
    }

    /**
     * Show individual student details
     */
    public function studentDetail(User $student)
    {
        try {
            $subAdmin = Auth::user();

            // Verify this student is assigned to the sub admin
            if ($student->assigned_sub_admin_id !== $subAdmin->id) {
                return redirect()->route('subadmin.students')->with('error', 'You can only view students assigned to you');
            }

            $student->load(['enrollments.course', 'certificates.course', 'userGroup']);

            // Calculate detailed stats
            $totalEnrollments = $student->enrollments->count();
            $completedEnrollments = $student->enrollments->filter(function($enrollment) {
                return $enrollment->status === 'completed' || $enrollment->progress_percentage >= 100;
            })->count();
            $inProgressEnrollments = $student->enrollments->where('status', 'active')->count();
            $totalCertificates = $student->certificates->count();
            $averageProgress = $student->enrollments->avg('progress_percentage') ?? 0;

            // Get recent activity
            $recentActivity = [
                'enrollments' => $student->enrollments()
                    ->with('course')
                    ->latest('created_at')
                    ->limit(5)
                    ->get()
                    ->map(function($enrollment) {
                        return [
                            'type' => 'enrollment',
                            'course' => $enrollment->course->title,
                            'date' => $enrollment->created_at,
                            'status' => $enrollment->status,
                            'progress' => $enrollment->progress_percentage
                        ];
                    }),
                'certificates' => $student->certificates()
                    ->with('course')
                    ->latest('issued_at')
                    ->limit(5)
                    ->get()
                    ->map(function($certificate) {
                        return [
                            'type' => 'certificate',
                            'course' => $certificate->course->title,
                            'date' => $certificate->issued_at,
                            'certificate_url' => $certificate->certificate_url
                        ];
                    })
            ];

            return Inertia::render('SubAdmin/StudentDetail', [
                'student' => [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'avatar' => $student->avatar,
                    'phone' => $student->phone,
                    'is_active' => $student->is_active,
                    'user_group' => $student->userGroup,
                    'bio' => $student->bio,
                    'city' => $student->city,
                    'country' => $student->country,
                    'date_of_birth' => $student->date_of_birth,
                    'created_at' => $student->created_at,
                    'last_login' => $student->updated_at // Use updated_at as last activity indicator
                ],
                'stats' => [
                    'total_enrollments' => $totalEnrollments,
                    'completed_enrollments' => $completedEnrollments,
                    'in_progress_enrollments' => $inProgressEnrollments,
                    'total_certificates' => $totalCertificates,
                    'average_progress' => round($averageProgress, 1)
                ],
                'enrollments' => $student->enrollments->map(function($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'course' => $enrollment->course,
                        'status' => $enrollment->status,
                        'progress_percentage' => $enrollment->progress_percentage,
                        'enrolled_at' => $enrollment->enrolled_at,
                        'completed_at' => $enrollment->completed_at,
                        'last_accessed_at' => $enrollment->last_accessed_at
                    ];
                }),
                'certificates' => $student->certificates->map(function($certificate) {
                    return [
                        'id' => $certificate->id,
                        'course' => $certificate->course,
                        'issued_at' => $certificate->issued_at,
                        'certificate_url' => $certificate->certificate_url,
                        'grade' => $certificate->grade
                    ];
                }),
                'recentActivity' => $recentActivity,
                'subAdmin' => [
                    'id' => $subAdmin->id,
                    'name' => $subAdmin->first_name . ' ' . $subAdmin->last_name
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading student details: ' . $e->getMessage());
            return redirect()->route('subadmin.students')->with('error', 'Failed to load student details');
        }
    }
}

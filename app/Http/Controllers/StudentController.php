<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Certificate;
use App\Models\CertificateQueue;
use App\Models\LearningSession;
use App\Models\ActivityLog;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\QuizAttempt;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Category;
use App\Models\UserGroup;
use App\Models\CourseUserAccess;
use App\Models\CourseTargetCategory;

class StudentController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Load roles relationship if not already loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        try {
            // Get student's active enrollments only
            $enrollments = Enrollment::where('user_id', $user->id)
                ->where('status', 'active')
                ->with([
                    'course' => function($query) {
                        $query->select('id', 'title', 'slug', 'thumbnail', 'instructor_id', 'duration_hours', 'description', 'level', 'price')
                            ->with([
                                'instructor' => function($q) {
                                    $q->select('id', 'first_name', 'last_name', 'avatar');
                                },
                                'lessons' => function($q) {
                                    $q->select('id', 'course_id', 'title', 'duration_minutes');
                                },
                                'quizzes' => function($q) {
                                    $q->select('id', 'course_id', 'title');
                                },
                                'assignments' => function($q) {
                                    $q->select('id', 'course_id', 'title');
                                }
                            ]);
                    }
                ])
                ->latest('last_accessed_at')
                ->take(6)
                ->get()
                ->map(function ($enrollment) use ($user) {
                    // Calculate actual progress based on completed lessons, quizzes, and assignments
                    $course = $enrollment->course;

                    // Count total items
                    $totalLessons = $course->lessons ? $course->lessons->count() : 0;
                    $totalQuizzes = $course->quizzes ? $course->quizzes->count() : 0;
                    $totalAssignments = $course->assignments ? $course->assignments->count() : 0;
                    $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;

                    try {
                        // Count completed lessons
                        $completedLessons = LessonCompletion::where('user_id', $user->id)
                            ->whereHas('lesson', function($q) use ($enrollment) {
                                $q->where('course_id', $enrollment->course_id);
                            })
                            ->whereNotNull('completed_at')
                            ->count();

                        // Count completed quizzes (distinct)
                        $completedQuizzes = QuizAttempt::where('user_id', $user->id)
                            ->whereHas('quiz', function($q) use ($enrollment) {
                                $q->where('course_id', $enrollment->course_id);
                            })
                            ->where('status', 'completed')
                            ->distinct('quiz_id')
                            ->count('quiz_id');

                        // Count completed assignments (distinct)
                        $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
                            ->whereHas('assignment', function($q) use ($enrollment) {
                                $q->where('course_id', $enrollment->course_id);
                            })
                            ->whereIn('status', ['submitted', 'graded'])
                            ->distinct('assignment_id')
                            ->count('assignment_id');

                        $completedItems = $completedLessons + $completedQuizzes + $completedAssignments;

                        // Calculate progress
                        $enrollment->progress_percentage = $totalItems > 0
                            ? round(($completedItems / $totalItems) * 100)
                            : 0;
                        $enrollment->completed_lessons = $completedLessons;
                        $enrollment->total_lessons = $totalLessons;

                    } catch (\Exception $e) {
                        // Fallback to stored progress_percentage
                        $enrollment->completed_lessons = round(($enrollment->progress_percentage / 100) * $totalLessons);
                        $enrollment->total_lessons = $totalLessons;
                    }

                    return $enrollment;
                });

            // Get certificates with detailed information
            $certificates = Certificate::where('user_id', $user->id)
                ->with([
                    'course' => function($q) {
                        $q->select('id', 'title', 'thumbnail', 'instructor_id')
                          ->with('instructor:id,first_name,last_name');
                    }
                ])
                ->latest('issued_at')
                ->take(5)
                ->get();

            // Calculate comprehensive stats
            $enrollmentsCount = Enrollment::where('user_id', $user->id)->count();

            // Count completed courses (with fallback check for progress >= 100%)
            $completedCount = Enrollment::where('user_id', $user->id)
                ->where(function($query) {
                    $query->where('status', 'completed')
                          ->orWhere('progress_percentage', '>=', 100);
                })
                ->count();

            $certificatesCount = Certificate::where('user_id', $user->id)->count();
            
            // Calculate total learning time from multiple sources
            $totalLearningTime = 0;
            try {
                // Try to get from learning_sessions table first (more accurate)
                $totalLearningTime = LearningSession::where('user_id', $user->id)
                    ->sum('duration') / 60; // Convert seconds to minutes
                    
                // If no learning sessions, fallback to enrollments
                if ($totalLearningTime == 0) {
                    $totalLearningTime = Enrollment::where('user_id', $user->id)
                        ->sum('total_time_spent') / 60; // Convert seconds to minutes
                }
            } catch (\Exception $e) {
                // Final fallback - estimate from enrollments
                $totalLearningTime = $enrollments->sum(function($enrollment) {
                    return $enrollment->course->duration_hours * 60; // Convert hours to minutes
                }) * 0.3; // Assume 30% completion on average
            }

            // Get learning streak data from user fields
            $learningStreak = [
                'current' => $user->current_streak ?? 0,
                'longest' => $user->longest_streak ?? 0,
            ];

            // Get quiz attempts and assignments
            $quizAttempts = 0;
            $assignmentSubmissions = 0;
            try {
                $quizAttempts = QuizAttempt::where('user_id', $user->id)->count();
                $assignmentSubmissions = AssignmentSubmission::where('user_id', $user->id)->count();
            } catch (\Exception $e) {
                // Fallback to estimated values
                $quizAttempts = $enrollmentsCount * 2; // Estimate 2 quizzes per course
                $assignmentSubmissions = $enrollmentsCount * 1; // Estimate 1 assignment per course
            }

            $stats = [
                'courses_enrolled' => $enrollmentsCount,
                'courses_completed' => $completedCount,
                'certificates_earned' => $certificatesCount,
                'total_learning_time' => $totalLearningTime, // in minutes
                'learning_streak_current' => $learningStreak['current'],
                'learning_streak_longest' => $learningStreak['longest'],
                'quiz_attempts' => $quizAttempts,
                'assignment_submissions' => $assignmentSubmissions,
            ];

            // Get recommended courses (more intelligent recommendations)
            $enrolledCourseIds = $enrollments->pluck('course_id')->toArray();
            $recommendedCourses = Course::where('status', 'published')
                ->whereNotIn('id', $enrolledCourseIds) // Exclude already enrolled courses
                ->where(function($query) {
                    $query->where('is_featured', true)
                          ->orWhereHas('enrollments', function($q) {
                              $q->select('course_id')
                                ->groupBy('course_id')
                                ->havingRaw('COUNT(*) > 10'); // Popular courses
                          });
                })
                ->with([
                    'instructor' => function($q) {
                        $q->select('id', 'first_name', 'last_name', 'avatar');
                    },
                    'category' => function($q) {
                        $q->select('id', 'name');
                    }
                ])
                ->withCount(['enrollments', 'reviews'])
                ->withAvg('reviews', 'rating')
                ->orderByDesc('is_featured')
                ->orderByDesc('enrollments_count')
                ->take(4)
                ->get();

            // Get recent activity for better user experience
            $recentActivity = $this->getRecentActivity($user->id);
            
            // Get learning analytics chart data
            $chartData = $this->getLearningChartData($user->id);
            
        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error('StudentController dashboard error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Fallback data if there are database issues
            $enrollments = collect([]);
            $certificates = collect([]);
            $recommendedCourses = collect([]);
            $stats = [
                'courses_enrolled' => 0,
                'courses_completed' => 0,
                'certificates_earned' => 0,
                'total_learning_time' => 0,
                'learning_streak_current' => 0,
                'learning_streak_longest' => 0,
                'quiz_attempts' => 0,
                'assignment_submissions' => 0,
            ];
            $recentActivity = [];
            $chartData = [];
        }

        return Inertia::render('Student/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'enrollments' => $enrollments,
            'certificates' => $certificates,
            'recommendedCourses' => $recommendedCourses,
            'recentActivity' => $recentActivity ?? [],
            'chartData' => $chartData ?? [],
        ]);
    }

    public function progress()
    {
        $user = Auth::user();
        
        try {
            // Get active enrollments with enhanced progress calculation
            $enrollments = Enrollment::where('user_id', $user->id)
                ->whereIn('status', ['active', 'completed'])
                ->with([
                    'course' => function($query) {
                        $query->with([
                            'instructor' => function($q) {
                                $q->select('id', 'first_name', 'last_name', 'avatar');
                            },
                            'lessons' => function($q) {
                                $q->select('id', 'course_id', 'title', 'duration_minutes');
                            },
                            'quizzes' => function($q) {
                                $q->select('id', 'course_id', 'title');
                            },
                            'assignments' => function($q) {
                                $q->select('id', 'course_id', 'title');
                            }
                        ]);
                    }
                ])
                ->orderBy('last_accessed_at', 'desc')
                ->get()
                ->map(function ($enrollment) use ($user) {
                    // Calculate detailed progress using sections-based counting (consistent with Learn page)
                    $courseId = $enrollment->course_id;

                    // Load course with sections for accurate counting
                    $course = Course::with([
                        'sections' => function($query) {
                            $query->orderBy('sort_order')->with([
                                'lessons' => function($q) { $q->orderBy('sort_order'); },
                                'quizzes' => function($q) { $q->orderBy('sort_order'); },
                                'assignments' => function($q) { $q->orderBy('sort_order'); },
                            ]);
                        }
                    ])->find($courseId);

                    // Count totals from sections
                    $totalLessons = 0;
                    $totalQuizzes = 0;
                    $totalAssignments = 0;
                    $allLessonIds = collect();
                    $allQuizIds = collect();
                    $allAssignmentIds = collect();

                    if ($course && $course->sections) {
                        foreach ($course->sections as $section) {
                            $totalLessons += $section->lessons->count();
                            $totalQuizzes += $section->quizzes->count();
                            $totalAssignments += $section->assignments->count();
                            $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
                            $allQuizIds = $allQuizIds->merge($section->quizzes->pluck('id'));
                            $allAssignmentIds = $allAssignmentIds->merge($section->assignments->pluck('id'));
                        }
                    }

                    $completedLessons = 0;
                    $completedQuizzes = 0;
                    $completedAssignments = 0;

                    try {
                        // Count completed lessons (combine both tables for backward compatibility)
                        if ($allLessonIds->isNotEmpty()) {
                            $fromCompletions = DB::table('lesson_completions')
                                ->where('user_id', $user->id)
                                ->whereIn('lesson_id', $allLessonIds)
                                ->whereNotNull('completed_at')
                                ->pluck('lesson_id')
                                ->toArray();

                            $fromAccess = DB::table('lesson_access')
                                ->where('user_id', $user->id)
                                ->whereIn('lesson_id', $allLessonIds)
                                ->pluck('lesson_id')
                                ->toArray();

                            $completedLessons = count(array_unique(array_merge($fromCompletions, $fromAccess)));
                        }

                        // Count completed quizzes (must be PASSED)
                        if ($allQuizIds->isNotEmpty()) {
                            $completedQuizzes = QuizAttempt::where('user_id', $user->id)
                                ->whereIn('quiz_id', $allQuizIds)
                                ->where('status', 'completed')
                                ->where('is_passed', true)
                                ->distinct('quiz_id')
                                ->count('quiz_id');
                        }

                        // Count completed assignments
                        if ($allAssignmentIds->isNotEmpty()) {
                            $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
                                ->whereIn('assignment_id', $allAssignmentIds)
                                ->whereIn('status', ['submitted', 'graded'])
                                ->distinct('assignment_id')
                                ->count('assignment_id');
                        }
                    } catch (\Exception $e) {
                        Log::warning('Progress calculation failed: ' . $e->getMessage());
                    }

                    // Calculate progress based on ALL content items
                    $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;
                    $completedItems = $completedLessons + $completedQuizzes + $completedAssignments;

                    // Include zoom screenshot requirement if enabled
                    if ($course && $course->require_zoom_screenshot) {
                        $totalItems += 1;
                        if ($enrollment->zoom_screenshot_path) {
                            $completedItems += 1;
                        }
                    }

                    $enrollment->calculated_progress = $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;
                    $enrollment->completed_lessons = $completedLessons;
                    $enrollment->total_lessons = $totalLessons;
                    $enrollment->completed_quizzes = $completedQuizzes;
                    $enrollment->total_quizzes = $totalQuizzes;
                    $enrollment->completed_assignments = $completedAssignments;
                    $enrollment->total_assignments = $totalAssignments;
                    $enrollment->total_content_items = $totalItems;
                    $enrollment->completed_content_items = $completedItems;
                    $enrollment->status = $enrollment->status ?: 'active';

                    return $enrollment;
                });

            // Calculate comprehensive statistics
            // IMPORTANT: For completion rate, use ALL enrollments (not just active/completed)
            // to match dashboard calculation
            $allEnrollmentsCount = Enrollment::where('user_id', $user->id)->count();

            // Count completed courses from ALL enrollments (matching dashboard logic)
            $completedCourses = Enrollment::where('user_id', $user->id)
                ->where(function($query) {
                    $query->where('status', 'completed')
                          ->orWhere('progress_percentage', '>=', 100);
                })
                ->count();

            $inProgressCourses = $enrollments->where('status', 'active')->count();
            $averageProgress = $enrollments->avg('calculated_progress') ?: 0;

            // Calculate total hours spent (estimate)
            $totalHoursSpent = 0;
            try {
                $totalHoursSpent = LearningSession::where('user_id', $user->id)
                    ->sum('duration_minutes') / 60; // Convert to hours

                if ($totalHoursSpent == 0) {
                    // Fallback estimate based on completed lessons
                    $totalCompletedLessons = $enrollments->sum('completed_lessons');
                    $totalHoursSpent = $totalCompletedLessons * 0.5; // Estimate 30 minutes per lesson
                }
            } catch (\Exception $e) {
                $totalHoursSpent = $enrollments->sum('completed_lessons') * 0.5;
            }

            // Get learning streak from user fields
            $learningStreak = [
                'current' => $user->current_streak ?? 0,
                'longest' => $user->longest_streak ?? 0,
            ];

            // Get certificates count
            $certificatesEarned = Certificate::where('user_id', $user->id)->count();

            // Calculate completion rate using ALL enrollments (matching dashboard)
            $completionRate = $allEnrollmentsCount > 0 ? round(($completedCourses / $allEnrollmentsCount) * 100) : 0;
            
            // Calculate skills mastered (estimate based on completed courses and certificates)
            $skillsMastered = $completedCourses * 2 + $certificatesEarned;
            
            // Calculate learning points (gamification)
            $learningPoints = $this->calculateSkillPoints($user->id);
            
            $stats = [
                'total_enrolled' => $allEnrollmentsCount, // Use all enrollments count (matching dashboard)
                'completed_courses' => $completedCourses,
                'in_progress_courses' => $inProgressCourses,
                'total_hours_spent' => round($totalHoursSpent, 1),
                'average_progress' => round($averageProgress, 1),
                'completion_rate' => $completionRate,
                'current_streak' => $learningStreak['current'],
                'longest_streak' => $learningStreak['longest'],
                'skills_mastered' => $skillsMastered,
                'certificates_earned' => $certificatesEarned,
                'learning_points' => $learningPoints,
                'weekly_goal_completion' => rand(65, 85), // Mock data for now
            ];

            // Get progress chart data (last 30 days)
            $progressChart = $this->getLearningChartData($user->id);
            
            // Skills progress data (mock for now, would come from a skills tracking system)
            $skillsProgress = [
                ['name' => 'Web Development', 'progress' => 85, 'level' => 'Advanced'],
                ['name' => 'JavaScript', 'progress' => 92, 'level' => 'Expert'],
                ['name' => 'Database Design', 'progress' => 68, 'level' => 'Intermediate'],
                ['name' => 'UI/UX Design', 'progress' => 74, 'level' => 'Intermediate'],
                ['name' => 'Project Management', 'progress' => 56, 'level' => 'Beginner'],
            ];
            
            // Weekly goals (mock data - would come from user goals system)
            $weeklyGoals = [
                ['task' => 'Complete 3 lessons', 'completed' => 2, 'total' => 3],
                ['task' => 'Study 5 hours', 'completed' => 3.5, 'total' => 5],
                ['task' => 'Finish 1 quiz', 'completed' => 1, 'total' => 1],
                ['task' => 'Join 2 discussions', 'completed' => 0, 'total' => 2],
            ];
            
            // Recent achievements (from certificates and badges)
            $achievements = Certificate::where('user_id', $user->id)
                ->with('course:id,title')
                ->latest('issued_at')
                ->take(5)
                ->get()
                ->map(function($cert) {
                    return [
                        'title' => 'Course Completed',
                        'description' => 'Completed ' . $cert->course->title,
                        'icon' => '🏆',
                        'date' => $cert->issued_at->diffForHumans(),
                    ];
                })
                ->toArray();
            
            // Add some mock achievements if no certificates
            if (empty($achievements)) {
                $achievements = [
                    ['title' => 'Welcome!', 'description' => 'Started your learning journey', 'icon' => '🎉', 'date' => '1 week ago'],
                    ['title' => 'First Course', 'description' => 'Enrolled in your first course', 'icon' => '📚', 'date' => '3 days ago'],
                ];
            }
            
            // Learning path (mock data - would come from curriculum system)
            $learningPath = [];
            
        } catch (\Exception $e) {
            // Fallback data
            $enrollments = collect([]);
            $stats = [
                'total_enrolled' => 0,
                'completed_courses' => 0,
                'in_progress_courses' => 0,
                'total_hours_spent' => 0,
                'average_progress' => 0,
                'completion_rate' => 0,
                'current_streak' => 0,
                'longest_streak' => 0,
                'skills_mastered' => 0,
                'certificates_earned' => 0,
                'learning_points' => 0,
                'weekly_goal_completion' => 0,
            ];
            $progressChart = [];
            $skillsProgress = [];
            $weeklyGoals = [];
            $achievements = [];
            $learningPath = [];
        }

        return Inertia::render('Student/Progress', [
            'user' => $user,
            'enrollments' => $enrollments,
            'stats' => $stats,
            'progressChart' => $progressChart,
            'skillsProgress' => $skillsProgress,
            'weeklyGoals' => $weeklyGoals,
            'achievements' => $achievements,
            'learningPath' => $learningPath,
        ]);
    }

    public function achievements()
    {
        $user = Auth::user();
        
        try {
            $certificates = Certificate::where('user_id', $user->id)
                ->with([
                    'course' => function($q) {
                        $q->select('id', 'title', 'thumbnail', 'instructor_id', 'level')
                          ->with('instructor:id,first_name,last_name,avatar');
                    },
                    'learning_path' => function($q) {
                        $q->select('id', 'title', 'description');
                    }
                ])
                ->latest('issued_at')
                ->paginate(12);

            // Generate achievement badges based on user activity
            $badges = $this->generateUserBadges($user->id);
            
            // Get achievement statistics
            $achievementStats = [
                'total_certificates' => Certificate::where('user_id', $user->id)->count(),
                'total_badges' => $badges->count(),
                'completion_rate' => $this->getUserCompletionRate($user->id),
                'learning_streak' => [
                    'current' => $user->current_streak ?? 0,
                    'longest' => $user->longest_streak ?? 0,
                ],
                'skill_points' => $this->calculateSkillPoints($user->id),
            ];
            
        } catch (\Exception $e) {
            $certificates = collect([]);
            $badges = collect();
            $achievementStats = [
                'total_certificates' => 0,
                'total_badges' => 0,
                'completion_rate' => 0,
                'learning_streak' => ['current' => 0, 'longest' => 0],
                'skill_points' => 0,
            ];
        }

        return Inertia::render('Student/Achievements', [
            'certificates' => $certificates,
            'badges' => $badges,
            'achievementStats' => $achievementStats,
        ]);
    }
    
    /**
     * Show My Learning page with comprehensive learning data
     */
    public function myLearning()
    {
        $user = Auth::user();
        
        try {
            // Get active enrollments with progress calculation
            $enrollments = Enrollment::where('user_id', $user->id)
                ->whereIn('status', ['active', 'completed'])
                ->with([
                    'course' => function($query) {
                        $query->select('id', 'title', 'slug', 'thumbnail', 'instructor_id', 'duration_hours', 'category_id', 'require_zoom_screenshot', 'access_duration_days')
                            ->with([
                                'instructor' => function($q) {
                                    $q->select('id', 'first_name', 'last_name');
                                },
                                'category' => function($q) {
                                    $q->select('id', 'name');
                                },
                                'sections.lessons' => function($q) {
                                    $q->select('id', 'section_id', 'video_url', 'video_file');
                                }
                            ]);
                    }
                ])
                ->orderBy('enrolled_at', 'desc')
                ->get();

            // For special students, check for accessible courses and auto-enroll if needed
            if ($user->user_type === 'special' && $user->accessible_courses && is_array($user->accessible_courses)) {
                $accessibleCourseIds = $user->accessible_courses;
                $enrolledCourseIds = $enrollments->pluck('course_id')->toArray();
                $missingCourseIds = array_diff($accessibleCourseIds, $enrolledCourseIds);

                // Auto-enroll to missing courses
                if (!empty($missingCourseIds)) {
                    try {
                        $courseAssignmentService = app(\App\Services\CourseAssignmentService::class);
                        $courseAssignmentService->autoEnrollStudentToGroupCourses($user);

                        // Reload enrollments to include newly enrolled courses
                        $enrollments = Enrollment::where('user_id', $user->id)
                            ->with([
                                'course' => function($query) {
                                    $query->select('id', 'title', 'slug', 'thumbnail', 'instructor_id', 'duration_hours', 'category_id', 'access_duration_days')
                                        ->with([
                                            'instructor' => function($q) {
                                                $q->select('id', 'first_name', 'last_name');
                                            },
                                            'category' => function($q) {
                                                $q->select('id', 'name');
                                            },
                                            'sections.lessons' => function($q) {
                                                $q->select('id', 'section_id', 'video_url', 'video_file');
                                            }
                                        ]);
                                }
                            ])
                            ->orderBy('enrolled_at', 'desc')
                            ->get();
                    } catch (\Exception $e) {
                        Log::error('Failed to auto-enroll special student: ' . $e->getMessage());
                    }
                }
            }
                
            $enrollments = $enrollments->map(function($enrollment) use ($user) {
                    try {
                        // Calculate real-time progress using sections-based counting (consistent with Learn page)
                        $courseId = $enrollment->course_id;

                        // Load course with sections for accurate counting (same as Learn page)
                        $course = Course::with([
                            'sections' => function($query) {
                                $query->orderBy('sort_order')->with([
                                    'lessons' => function($q) { $q->orderBy('sort_order'); },
                                    'quizzes' => function($q) { $q->orderBy('sort_order'); },
                                    'assignments' => function($q) { $q->orderBy('sort_order'); },
                                ]);
                            }
                        ])->find($courseId);

                        // Count totals from sections (consistent with Learn page)
                        $totalLessons = 0;
                        $totalQuizzes = 0;
                        $totalAssignments = 0;
                        $allLessonIds = collect();
                        $allQuizIds = collect();
                        $allAssignmentIds = collect();

                        if ($course && $course->sections) {
                            foreach ($course->sections as $section) {
                                $totalLessons += $section->lessons->count();
                                $totalQuizzes += $section->quizzes->count();
                                $totalAssignments += $section->assignments->count();
                                $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
                                $allQuizIds = $allQuizIds->merge($section->quizzes->pluck('id'));
                                $allAssignmentIds = $allAssignmentIds->merge($section->assignments->pluck('id'));
                            }
                        }

                        // Get completed lessons (combine both tables for backward compatibility)
                        $completedLessons = 0;
                        if ($allLessonIds->isNotEmpty()) {
                            try {
                                $fromCompletions = DB::table('lesson_completions')
                                    ->where('user_id', $user->id)
                                    ->whereIn('lesson_id', $allLessonIds)
                                    ->whereNotNull('completed_at')
                                    ->pluck('lesson_id')
                                    ->toArray();

                                $fromAccess = DB::table('lesson_access')
                                    ->where('user_id', $user->id)
                                    ->whereIn('lesson_id', $allLessonIds)
                                    ->pluck('lesson_id')
                                    ->toArray();

                                $completedLessons = count(array_unique(array_merge($fromCompletions, $fromAccess)));
                            } catch (\Exception $e) {
                                Log::warning('Lesson completions query failed: ' . $e->getMessage());
                            }
                        }

                        // Get completed quizzes (must be passed)
                        $completedQuizzes = 0;
                        if ($allQuizIds->isNotEmpty()) {
                            try {
                                $completedQuizzes = QuizAttempt::where('user_id', $user->id)
                                    ->whereIn('quiz_id', $allQuizIds)
                                    ->where('status', 'completed')
                                    ->where('is_passed', true)
                                    ->distinct('quiz_id')
                                    ->count('quiz_id');
                            } catch (\Exception $e) {
                                Log::warning('Quiz completions query failed: ' . $e->getMessage());
                            }
                        }

                        // Get completed assignments (submitted or graded)
                        $completedAssignments = 0;
                        if ($allAssignmentIds->isNotEmpty()) {
                            try {
                                $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
                                    ->whereIn('assignment_id', $allAssignmentIds)
                                    ->whereIn('status', ['submitted', 'graded'])
                                    ->distinct('assignment_id')
                                    ->count('assignment_id');
                            } catch (\Exception $e) {
                                Log::warning('Assignment completions query failed: ' . $e->getMessage());
                            }
                        }

                        $totalContentItems = $totalLessons + $totalQuizzes + $totalAssignments;
                        $completedContentItems = $completedLessons + $completedQuizzes + $completedAssignments;

                        // Include zoom screenshot requirement if enabled
                        if ($course && $course->require_zoom_screenshot) {
                            $totalContentItems += 1;
                            if ($enrollment->zoom_screenshot_path) {
                                $completedContentItems += 1;
                            }
                        }

                        $calculatedProgress = $totalContentItems > 0
                            ? round(($completedContentItems / $totalContentItems) * 100, 2)
                            : 0;
                        
                        // Get next lesson
                        $nextLesson = null;
                        try {
                            $nextLesson = DB::table('lessons')
                                ->join('course_sections', 'lessons.section_id', '=', 'course_sections.id')
                                ->leftJoin('lesson_access', function($join) use ($user) {
                                    $join->on('lessons.id', '=', 'lesson_access.lesson_id')
                                         ->where('lesson_access.user_id', '=', $user->id);
                                })
                                ->where('course_sections.course_id', $courseId)
                                ->whereNull('lesson_access.lesson_id')
                                ->orderBy('course_sections.sort_order')
                                ->orderBy('lessons.sort_order')
                                ->select([
                                    'lessons.id', 
                                    'lessons.title',
                                    'lessons.video_duration as duration_minutes',
                                    'course_sections.title as section_title'
                                ])
                                ->first();
                        } catch (\Exception $e) {
                            // Skip if there's an error getting next lesson
                        }
                        
                        // Check if course has video content (use loaded $course with sections)
                        $hasVideoContent = false;
                        if ($course && $course->sections) {
                            foreach ($course->sections as $section) {
                                if ($section->lessons) {
                                    foreach ($section->lessons as $lesson) {
                                        if (!empty($lesson->video_url) || !empty($lesson->video_file)) {
                                            $hasVideoContent = true;
                                            break 2;
                                        }
                                    }
                                }
                            }
                        }

                        // Add calculated fields to enrollment
                        $enrollment->calculated_progress = $calculatedProgress;
                        $enrollment->total_lessons = $totalLessons;
                        $enrollment->total_quizzes = $totalQuizzes;
                        $enrollment->total_assignments = $totalAssignments;
                        $enrollment->total_content_items = $totalContentItems;
                        $enrollment->completed_content_items = $completedContentItems;
                        $enrollment->completed_lessons = $completedLessons;
                        $enrollment->completed_quizzes = $completedQuizzes;
                        $enrollment->completed_assignments = $completedAssignments;
                        if ($enrollment->course) {
                            $enrollment->course->has_video_content = $hasVideoContent;
                        }
                        $enrollment->next_lesson = $nextLesson ? (object) [
                            'id' => $nextLesson->id,
                            'title' => $nextLesson->title,
                            'duration_minutes' => $nextLesson->duration_minutes,
                            'section' => (object) ['title' => $nextLesson->section_title]
                        ] : null;

                        // Add study URL for course access
                        $enrollment->study_url = route('courses.learn', $enrollment->course->slug);

                        // Add access duration info (using effective expiry that considers course settings)
                        $enrollment->remaining_days = $enrollment->getRemainingDays();
                        $enrollment->expires_at = $enrollment->getExpiresAtForDisplay();

                    } catch (\Exception $e) {
                        // Log the error for debugging
                        Log::error('Error calculating course progress for enrollment ' . $enrollment->id . ': ' . $e->getMessage());
                        
                        // Fallback if calculation fails
                        $enrollment->calculated_progress = $enrollment->progress_percentage ?? 0;
                        $enrollment->total_lessons = 0;
                        $enrollment->total_quizzes = 0;
                        $enrollment->total_assignments = 0;
                        $enrollment->total_content_items = 0;
                        $enrollment->completed_content_items = 0;
                        $enrollment->completed_lessons = 0;
                        $enrollment->completed_quizzes = 0;
                        $enrollment->completed_assignments = 0;
                        $enrollment->course->has_video_content = false; // Default to false in fallback
                        $enrollment->next_lesson = null;

                        // Add study URL for course access in fallback
                        $enrollment->study_url = route('courses.learn', $enrollment->course->slug);

                        // Add access duration info in fallback (using effective expiry)
                        $enrollment->remaining_days = $enrollment->getRemainingDays();
                        $enrollment->expires_at = $enrollment->getExpiresAtForDisplay();
                    }
                    
                    return $enrollment;
                });

            // Calculate comprehensive stats
            $stats = [
                'total_enrolled' => $enrollments->count(),

                // Count active courses (status active/paused AND progress < 100%)
                'active_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->calculated_progress ?? $enrollment->progress_percentage ?? 0;
                    return ($enrollment->status === 'active' || $enrollment->status === 'paused') && $progress < 100;
                })->count(),

                // Count completed courses (status = completed OR progress >= 100%)
                'completed_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->calculated_progress ?? $enrollment->progress_percentage ?? 0;
                    return $enrollment->status === 'completed' || $progress >= 100;
                })->count(),

                'paused_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->calculated_progress ?? $enrollment->progress_percentage ?? 0;
                    return $enrollment->status === 'paused' && $progress < 100;
                })->count(),
                'total_hours_spent' => $enrollments->sum('total_time_spent') / 60, // Convert minutes to hours
                'average_progress' => $enrollments->avg('calculated_progress'),
                'certificates_earned' => 0, // We'll implement this later
            ];
            
            // Get upcoming deadlines (assignments with due dates)
            $upcomingDeadlines = [];
            try {
                $upcomingDeadlines = Assignment::whereHas('section.course.enrollments', function($q) use ($user) {
                        $q->where('user_id', $user->id)
                          ->where('status', 'active');
                    })
                    ->where('due_date', '>', now())
                    ->whereDoesntHave('submissions', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->with(['section.course'])
                    ->orderBy('due_date')
                    ->limit(5)
                    ->get();
            } catch (\Exception $e) {
                $upcomingDeadlines = collect([]);
            }
            
            // Get recent certificates
            $recentCertificates = [];
            try {
                $recentCertificates = Certificate::where('user_id', $user->id)
                    ->with(['course' => function($q) {
                        $q->select('id', 'title', 'thumbnail');
                    }])
                    ->latest('issued_at')
                    ->limit(3)
                    ->get();
            } catch (\Exception $e) {
                $recentCertificates = collect([]);
            }
                
        } catch (\Exception $e) {
            Log::error('Error in myLearning: ' . $e->getMessage());
            
            // Fallback: simple enrollment query
            $enrollments = Enrollment::where('user_id', $user->id)
                ->with([
                    'course' => function($query) {
                        $query->select('id', 'title', 'slug', 'thumbnail', 'instructor_id')
                            ->with([
                                'instructor' => function($q) {
                                    $q->select('id', 'first_name', 'last_name');
                                }
                            ]);
                    }
                ])
                ->orderBy('enrolled_at', 'desc')
                ->get();
                
            // For special students, try to auto-enroll to accessible courses even in fallback
            if ($user->user_type === 'special' && $user->accessible_courses && is_array($user->accessible_courses)) {
                try {
                    $courseAssignmentService = app(\App\Services\CourseAssignmentService::class);
                    $courseAssignmentService->autoEnrollStudentToGroupCourses($user);
                    
                    // Reload enrollments
                    $enrollments = Enrollment::where('user_id', $user->id)
                        ->with([
                            'course' => function($query) {
                                $query->select('id', 'title', 'slug', 'thumbnail', 'instructor_id')
                                    ->with([
                                        'instructor' => function($q) {
                                            $q->select('id', 'first_name', 'last_name');
                                        }
                                    ]);
                            }
                        ])
                        ->orderBy('enrolled_at', 'desc')
                        ->get();
                } catch (\Exception $e) {
                    Log::error('Failed to auto-enroll special student in fallback: ' . $e->getMessage());
                }
            }
                
            $enrollments = $enrollments->map(function($enrollment) {
                    // Set default has_video_content to false for fallback
                    if ($enrollment->course) {
                        $enrollment->course->has_video_content = false;
                        // Add study URL for course access in fallback
                        $enrollment->study_url = route('courses.learn', $enrollment->course->slug);
                    }
                    return $enrollment;
                });
                
            $stats = [
                'total_enrolled' => $enrollments->count(),

                // Count active courses (status active/paused AND progress < 100%)
                'active_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->progress_percentage ?? 0;
                    return ($enrollment->status === 'active' || $enrollment->status === 'paused') && $progress < 100;
                })->count(),

                // Count completed courses (status = completed OR progress >= 100%)
                'completed_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->progress_percentage ?? 0;
                    return $enrollment->status === 'completed' || $progress >= 100;
                })->count(),

                'paused_courses' => $enrollments->filter(function($enrollment) {
                    $progress = $enrollment->progress_percentage ?? 0;
                    return $enrollment->status === 'paused' && $progress < 100;
                })->count(),
                'total_hours_spent' => 0,
                'average_progress' => $enrollments->avg('progress_percentage') ?? 0,
                'certificates_earned' => 0,
            ];
            $upcomingDeadlines = collect([]);
            $recentCertificates = collect([]);
        }

        return Inertia::render('Student/MyLearning', [
            'user' => $user,
            'enrollments' => $enrollments,
            'stats' => $stats,
            'upcomingDeadlines' => $upcomingDeadlines,
            'recentCertificates' => $recentCertificates
        ]);
    }


    /**
     * Student-specific browse courses functionality
     */
    public function browseCourses(Request $request)
    {
        $user = Auth::user();
        
        try {
            // Get query parameters
            $search = $request->get('search', '');
            $category = $request->get('category', '');
            $sort = $request->get('sort', 'recommended');
            $access = $request->get('access', '');
            $price = $request->get('price', '');
            $certificateType = $request->get('certificate_type', '');
            $targetCategory = $request->get('target_category', '');
            $perPage = $request->get('per_page', 12);
            
            // Get enrolled course IDs for this student
            $enrolledCourseIds = Enrollment::where('user_id', $user->id)
                ->pluck('course_id')
                ->toArray();
            
            // Build the query for student-accessible courses
            // NOTE: Show ALL published courses, but frontend will restrict purchase based on:
            // - General students can't buy private courses
            // - Special students can only access courses granted to them
            $query = Course::where('status', 'published');
                
            // Add relationships and aggregates
            $query = $query->with([
                'instructor' => function($q) {
                    $q->select('id', 'first_name', 'last_name', 'avatar');
                },
                'instructors' => function($q) {
                    $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar');
                },
                'category' => function($q) {
                    $q->select('id', 'name', 'slug');
                },
                'courseType' => function($q) {
                    $q->select('id', 'name', 'slug', 'color', 'icon', 'parent_id');
                }
            ])
            ->withCount(['enrollments', 'reviews', 'lessons'])
            ->withAvg('reviews', 'rating');
            
            // Search functionality
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('subtitle', 'LIKE', "%{$search}%")
                      ->orWhereHas('instructor', function($iq) use ($search) {
                          $iq->where('first_name', 'LIKE', "%{$search}%")
                             ->orWhere('last_name', 'LIKE', "%{$search}%");
                      })
                      ->orWhereHas('category', function($cq) use ($search) {
                          $cq->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }
            
            // Category filter
            if (!empty($category)) {
                $query->whereHas('category', function($q) use ($category) {
                    $q->where('slug', $category);
                });
            }

            // Access filter - Simplified to public/enrolled only
            if (!empty($access)) {
                switch($access) {
                    case 'public':
                        $query->where('access_type', 'public');
                        break;
                    case 'enrolled':
                        $query->whereIn('id', $enrolledCourseIds);
                        break;
                }
            }

            // Price filter
            if (!empty($price)) {
                switch($price) {
                    case '500k_1jt':
                        $query->whereBetween('price', [500000, 1000000]);
                        break;
                    case 'above_1jt':
                        $query->where('price', '>', 1000000);
                        break;
                }
            }

            // Certificate Type filter
            if (!empty($certificateType)) {
                $query->whereHas('courseType', function($ct) use ($certificateType) {
                    $ct->where(function($q) use ($certificateType) {
                        $q->whereHas('parent', function($parent) use ($certificateType) {
                            $parent->where('slug', $certificateType);
                        })->orWhere('slug', $certificateType);
                    });
                });
            }

            // Target Category filter (Mahasiswa, Pemerintah, Perusahaan)
            if (!empty($targetCategory)) {
                $query->whereHas('targetCategories', function($tc) use ($targetCategory) {
                    $tc->where('slug', $targetCategory);
                });
            }

            // Sorting
            switch($sort) {
                case 'popular':
                    $query->orderByDesc('enrollments_count');
                    break;
                case 'rating':
                    $query->orderByDesc('reviews_avg_rating');
                    break;
                case 'price_low':
                    $query->orderBy('price');
                    break;
                case 'price_high':
                    $query->orderByDesc('price');
                    break;
                case 'alphabetical':
                    $query->orderBy('title');
                    break;
                case 'latest':
                    $query->latest();
                    break;
                case 'recommended':
                default:
                    // Smart recommendations: featured first, then by popularity and rating
                    $query->orderByDesc('is_featured')
                          ->orderByDesc('reviews_avg_rating')
                          ->orderByDesc('enrollments_count');
                    break;
            }
            
            // Execute query with pagination
            $courses = $query->paginate($perPage)->withQueryString();
            
            // Check if user has direct access to private courses
            $userAccessibleCourseIds = [];
            if ($user->user_type === 'special') {
                // Check group-assigned courses
                if ($user->user_group_id) {
                    $userGroup = UserGroup::find($user->user_group_id);
                    if ($userGroup) {
                        $userAccessibleCourseIds = array_merge(
                            $userAccessibleCourseIds,
                            $userGroup->assignedCourses()->pluck('courses.id')->toArray()
                        );
                    }
                }
                // Check direct course access
                $directAccessIds = CourseUserAccess::where('user_id', $user->id)
                    ->where(function($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    })
                    ->pluck('course_id')
                    ->toArray();
                $userAccessibleCourseIds = array_merge($userAccessibleCourseIds, $directAccessIds);
                $userAccessibleCourseIds = array_unique($userAccessibleCourseIds);
            } else {
                // General students: only get direct access grants
                $userAccessibleCourseIds = CourseUserAccess::where('user_id', $user->id)
                    ->where(function($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                    })
                    ->pluck('course_id')
                    ->toArray();
            }

            // Transform courses data with student-specific information - simplified
            $courses->getCollection()->transform(function ($course) use ($enrolledCourseIds, $userAccessibleCourseIds, $user) {
                $isPrivate = ($course->access_type ?? 'public') === 'private';
                $hasAccess = in_array($course->id, $userAccessibleCourseIds);
                $isEnrolled = in_array($course->id, $enrolledCourseIds);

                // Determine if this course can be purchased by this user
                // General student: can buy public courses, cannot buy private courses
                // Special student: cannot buy any course (only access granted courses)
                $canPurchase = false;
                if ($user->user_type === 'general') {
                    $canPurchase = !$isPrivate; // General students can buy public courses only
                }
                // Special students cannot purchase any course

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'subtitle' => $course->subtitle,
                    'description' => $course->description,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price ?? 0,
                    'discount_price' => $course->discount_price,
                    'is_free' => ($course->price ?? 0) == 0,
                    'is_featured' => $course->is_featured ?? false,
                    'access_type' => $course->access_type ?? 'public',
                    'is_public' => !$isPrivate,
                    'is_private' => $isPrivate,
                    'level' => $course->level ?? 'beginner',
                    'duration_hours' => $course->duration_hours ?? 0,
                    'enrollments_count' => $course->enrollments_count ?? 0,
                    'lessons_count' => $course->lessons_count ?? 0,
                    'reviews_count' => $course->reviews_count ?? 0,
                    'reviews_avg_rating' => $course->reviews_avg_rating ? round($course->reviews_avg_rating, 1) : 0,
                    'instructor' => $course->instructor ? [
                        'id' => $course->instructor->id ?? 0,
                        'first_name' => $course->instructor->first_name ?? 'SangkaLearn',
                        'last_name' => $course->instructor->last_name ?? 'Instructor',
                        'name' => trim(($course->instructor->first_name ?? '') . ' ' . ($course->instructor->last_name ?? '')) ?: 'SangkaLearn Instructor',
                        'avatar' => $course->instructor->avatar ?? null,
                    ] : [
                        'id' => 0,
                        'first_name' => 'SangkaLearn',
                        'last_name' => 'Instructor',
                        'name' => 'SangkaLearn Instructor',
                        'avatar' => null,
                    ],
                    'instructors' => $course->instructors->map(function($instructor) {
                        return [
                            'id' => $instructor->id,
                            'name' => trim(($instructor->first_name ?? '') . ' ' . ($instructor->last_name ?? '')) ?: 'Instructor',
                            'first_name' => $instructor->first_name ?? 'Instructor',
                            'last_name' => $instructor->last_name ?? '',
                            'avatar' => $instructor->avatar ?? null,
                        ];
                    })->values()->all(),
                    'category' => $course->category ? [
                        'id' => $course->category->id,
                        'name' => $course->category->name,
                        'slug' => $course->category->slug,
                    ] : [
                        'id' => 1,
                        'name' => 'General',
                        'slug' => 'general',
                    ],
                    'is_enrolled' => $isEnrolled,
                    'has_access' => $hasAccess, // For special students who have been granted access
                    'can_purchase' => $canPurchase, // Whether this user can purchase this course
                    'access_duration_days' => $course->access_duration_days,
                    'created_at' => $course->created_at,
                ];
            });
            
            // Get categories dengan jumlah pelatihan yang sebenarnya
            $categories = Category::orderBy('name')
            ->withCount(['courses' => function($query) {
                $query->where('status', 'published')
                      ->where('access_type', 'public');
            }])
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'courses_count' => $category->courses_count,
                ];
            });
            
            // Get featured courses with instructor and category
            $featuredCourses = Course::where('status', 'published')
            ->where('is_featured', true)
            ->where('access_type', 'public')
            ->with(['instructor:id,first_name,last_name', 'category:id,name'])
            ->withCount('enrollments')
            ->take(6)
            ->get()
            ->map(function ($course) use ($enrolledCourseIds) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'subtitle' => $course->subtitle,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price ?? 0,
                    'discount_price' => $course->discount_price,
                    'is_featured' => $course->is_featured,
                    'instructor' => $course->instructor ? [
                        'first_name' => $course->instructor->first_name,
                        'last_name' => $course->instructor->last_name,
                    ] : null,
                    'category' => $course->category ? [
                        'name' => $course->category->name,
                    ] : null,
                    'enrollments_count' => $course->enrollments_count ?? 0,
                    'reviews_avg_rating' => 4.8,
                    'is_enrolled' => in_array($course->id, $enrolledCourseIds),
                    'access_duration_days' => $course->access_duration_days,
                ];
            });

            // Get parent course types for filter dropdown
            $parentCourseTypes = \App\Models\CourseType::active()
                                                       ->parents()
                                                       ->ordered()
                                                       ->select('id', 'name', 'slug', 'color', 'icon')
                                                       ->get();

            // Get target categories for filter dropdown
            $targetCategories = CourseTargetCategory::active()
                                                   ->ordered()
                                                   ->get(['id', 'name', 'slug', 'icon', 'color']);

            // Get student-specific statistics - simplified
            $stats = [
                'available_courses' => Course::where('status', 'published')->where('access_type', 'public')->count(),
                'enrolled_courses' => count($enrolledCourseIds),
                'completed_courses' => 0,
                'certificates_earned' => 0,
            ];

        } catch (\Exception $e) {
            // Debug the error and provide fallback data
            \Log::error('Student Browse Courses Error: ' . $e->getMessage());
            
            // Try to get basic course data as fallback
            try {
                $basicCourses = Course::where('status', 'published')
                    ->where('access_type', 'public')
                    ->get()
                    ->map(function ($course) {
                        return [
                            'id' => $course->id,
                            'title' => $course->title,
                            'slug' => $course->slug,
                            'subtitle' => $course->subtitle ?? '',
                            'description' => $course->description ?? '',
                            'thumbnail' => $course->thumbnail,
                            'price' => $course->price ?? 0,
                            'discount_price' => $course->discount_price,
                            'is_free' => ($course->price ?? 0) == 0,
                            'is_featured' => $course->is_featured ?? false,
                            'access_type' => $course->access_type ?? 'public',
                            'is_public' => true,
                            'level' => $course->level ?? 'beginner',
                            'duration_hours' => $course->duration_hours ?? 0,
                            'enrollments_count' => 50,
                            'lessons_count' => 10,
                            'reviews_count' => 25,
                            'reviews_avg_rating' => 4.8,
                            'instructor' => [
                                'id' => 1,
                                'first_name' => 'John',
                                'last_name' => 'Doe',
                                'name' => 'John Doe',
                                'avatar' => null,
                            ],
                            'category' => [
                                'id' => 1,
                                'name' => 'Programming',
                                'slug' => 'programming',
                            ],
                            'is_enrolled' => false,
                            'access_duration_days' => $course->access_duration_days,
                            'created_at' => $course->created_at,
                        ];
                    });

                // Convert to paginated structure
                $courses = new \Illuminate\Pagination\LengthAwarePaginator(
                    $basicCourses,
                    $basicCourses->count(),
                    12,
                    1,
                    ['path' => request()->url()]
                );
                
            } catch (\Exception $fallbackError) {
                $courses = new \Illuminate\Pagination\LengthAwarePaginator(
                    collect([]),
                    0,
                    12,
                    1,
                    ['path' => request()->url()]
                );
            }
            
            // Try to get actual categories even in fallback
            try {
                $categories = Category::orderBy('name')
                ->withCount(['courses' => function($query) {
                    $query->where('status', 'published')
                          ->where('access_type', 'public');
                }])
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'courses_count' => $category->courses_count,
                    ];
                });
            } catch (\Exception $e) {
                $categories = collect([
                    ['id' => 1, 'name' => 'Programming', 'slug' => 'programming', 'courses_count' => 0],
                    ['id' => 2, 'name' => 'Design', 'slug' => 'design', 'courses_count' => 0],
                    ['id' => 3, 'name' => 'Business', 'slug' => 'business', 'courses_count' => 0],
                ]);
            }
            $featuredCourses = collect([]);
            $enrolledCourseIds = [];
            $stats = [
                'available_courses' => $courses->total(),
                'enrolled_courses' => 0,
                'completed_courses' => 0,
                'certificates_earned' => 0,
            ];
        }

        // Debug information
        Log::info('Student Browse Courses - Data Summary', [
            'courses_count' => $courses instanceof \Illuminate\Pagination\LengthAwarePaginator ? $courses->total() : $courses->count(),
            'categories_count' => $categories->count(),
            'featured_count' => $featuredCourses->count(),
            'user_id' => $user->id,
            'enrolled_courses' => count($enrolledCourseIds)
        ]);

        return Inertia::render('Student/BrowseCourses', [
            'courses' => $courses,
            'categories' => $categories,
            'featuredCourses' => $featuredCourses,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'sort', 'access', 'price', 'certificate_type', 'target_category']),
            'parentCourseTypes' => $parentCourseTypes ?? collect([]),
            'targetCategories' => $targetCategories ?? collect([]),
            'enrolledCourseIds' => $enrolledCourseIds,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'user_type' => $user->user_type ?? 'general', // general or special
                    'user_group_id' => $user->user_group_id,
                    'roles' => $user->roles,
                ]
            ]
        ]);
    }

    /**
     * Show student certificates page
     * Now reads from CertificateQueue (new auto-generation system)
     */
    public function certificates(Request $request)
    {
        $user = Auth::user();

        try {
            // Get query parameters for filtering
            $search = $request->get('search', '');
            $status = $request->get('status', 'all');

            // Build the query for certificates from CertificateQueue (approved only)
            $query = CertificateQueue::where('user_id', $user->id)
                ->where('status', 'approved')
                ->with([
                    'course' => function ($q) {
                        $q->select('id', 'title', 'thumbnail', 'instructor_id')
                            ->with('instructor:id,first_name,last_name,avatar');
                    }
                ]);

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('certificate_number', 'ILIKE', "%{$search}%")
                        ->orWhereHas('course', function ($cq) use ($search) {
                            $cq->where('title', 'ILIKE', "%{$search}%");
                        });
                });
            }

            // Status filter
            if ($status !== 'all') {
                switch ($status) {
                    case 'valid':
                        $query->where('status', 'approved');
                        break;
                    case 'expired':
                        // CertificateQueue doesn't have expires_at, show none for expired
                        $query->whereRaw('1 = 0');
                        break;
                    case 'revoked':
                        $query->where('status', 'rejected');
                        break;
                }
            }

            // Execute query with pagination
            $certificates = $query->latest('approved_at')
                ->paginate(12)
                ->withQueryString()
                ->through(function ($cert) {
                    return [
                        'id' => $cert->id,
                        'certificate_number' => $cert->certificate_number,
                        'certificate_title' => $cert->certificate_title,
                        'issued_at' => $cert->approved_at ?? $cert->created_at,
                        'expires_at' => null, // CertificateQueue doesn't have expiration
                        'grade' => null,
                        'completion_percentage' => 100,
                        'verification_code' => $cert->certificate_number,
                        'is_revoked' => $cert->status === 'rejected',
                        'revoked_at' => $cert->rejected_at,
                        'revoked_reason' => $cert->rejection_reason,
                        'certificate_url' => $cert->certificate_file ? asset('storage/' . $cert->certificate_file) : null,
                        'is_valid' => $cert->status === 'approved',
                        'download_url' => $cert->certificate_file ? route('student.certificates.queue.download', $cert->id) : null,
                        'certificate_type' => $cert->certificate_type,
                        'is_primary' => $cert->is_primary,
                        'auto_approved' => $cert->auto_approved,
                        'course' => $cert->course ? [
                            'id' => $cert->course->id,
                            'title' => $cert->course->title,
                            'thumbnail' => $cert->course->thumbnail,
                            'instructor' => $cert->course->instructor ? [
                                'first_name' => $cert->course->instructor->first_name,
                                'last_name' => $cert->course->instructor->last_name,
                                'avatar' => $cert->course->instructor->avatar,
                            ] : null,
                        ] : null,
                    ];
                });

            // Get certificate statistics from CertificateQueue
            $stats = [
                'total_certificates' => CertificateQueue::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->count(),
                'valid_certificates' => CertificateQueue::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->count(),
                'expired_certificates' => 0, // CertificateQueue doesn't have expiration
                'this_month_certificates' => CertificateQueue::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->whereMonth('approved_at', now()->month)
                    ->whereYear('approved_at', now()->year)
                    ->count(),
            ];

        } catch (\Exception $e) {
            // Log the exception for debugging
            \Log::error('StudentController certificates page error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback data if there's an error
            $certificates = collect([]);
            $stats = [
                'total_certificates' => 0,
                'valid_certificates' => 0,
                'expired_certificates' => 0,
                'this_month_certificates' => 0,
            ];
        }

        return Inertia::render('Student/Certificates', [
            'certificates' => $certificates,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
            'user' => $user,
        ]);
    }

    /**
     * Get recent activity for the user
     */
    private function getRecentActivity($userId, $limit = 10)
    {
        try {
            $activities = [];
            
            // Get recent lesson completions
            try {
                $lessonCompletions = LessonCompletion::where('user_id', $userId)
                    ->with(['lesson.course'])
                    ->latest()
                    ->take($limit / 2)
                    ->get()
                    ->map(function($completion) {
                        return [
                            'type' => 'lesson_completed',
                            'title' => 'Completed lesson: ' . $completion->lesson->title,
                            'description' => 'in ' . $completion->lesson->course->title,
                            'timestamp' => $completion->created_at,
                            'icon' => 'PlayCircle'
                        ];
                    });
                    
                $activities = array_merge($activities, $lessonCompletions->toArray());
            } catch (\Exception $e) {
                // Skip if table doesn't exist
            }
            
            // Get recent quiz attempts
            try {
                $quizAttempts = QuizAttempt::where('user_id', $userId)
                    ->with(['quiz.course'])
                    ->where('status', 'completed')
                    ->latest()
                    ->take($limit / 2)
                    ->get()
                    ->map(function($attempt) {
                        return [
                            'type' => 'quiz_completed',
                            'title' => 'Completed quiz: ' . $attempt->quiz->title,
                            'description' => 'Score: ' . $attempt->score . '%',
                            'timestamp' => $attempt->completed_at ?? $attempt->updated_at,
                            'icon' => 'Target'
                        ];
                    });
                    
                $activities = array_merge($activities, $quizAttempts->toArray());
            } catch (\Exception $e) {
                // Skip if table doesn't exist
            }
            
            // Sort by timestamp
            usort($activities, function($a, $b) {
                return $b['timestamp'] <=> $a['timestamp'];
            });
            
            return array_slice($activities, 0, $limit);
            
        } catch (\Exception $e) {
            return [];
        }
    }
    
    /**
     * Generate user badges based on achievements
     */
    private function generateUserBadges($userId)
    {
        $badges = collect();
        
        try {
            $enrollmentsCount = Enrollment::where('user_id', $userId)->count();
            $completedCount = Enrollment::where('user_id', $userId)->where('status', 'completed')->count();
            $certificatesCount = Certificate::where('user_id', $userId)->count();
            
            // First Course Badge
            if ($enrollmentsCount >= 1) {
                $badges->push([
                    'id' => 'first_course',
                    'name' => 'First Steps',
                    'description' => 'Enrolled in your first course',
                    'icon' => 'BookOpen',
                    'color' => 'blue',
                    'earned_at' => Enrollment::where('user_id', $userId)->oldest()->first()->created_at ?? now()
                ]);
            }
            
            // Course Completion Badges
            if ($completedCount >= 1) {
                $badges->push([
                    'id' => 'first_completion',
                    'name' => 'Finisher',
                    'description' => 'Completed your first course',
                    'icon' => 'CheckCircle',
                    'color' => 'green',
                    'earned_at' => Enrollment::where('user_id', $userId)->where('status', 'completed')->oldest()->first()->updated_at ?? now()
                ]);
            }
            
            if ($completedCount >= 5) {
                $badges->push([
                    'id' => 'five_completions',
                    'name' => 'Dedicated Learner',
                    'description' => 'Completed 5 courses',
                    'icon' => 'Award',
                    'color' => 'purple',
                    'earned_at' => now()
                ]);
            }
            
            if ($completedCount >= 10) {
                $badges->push([
                    'id' => 'ten_completions',
                    'name' => 'Learning Champion',
                    'description' => 'Completed 10 courses',
                    'icon' => 'Trophy',
                    'color' => 'yellow',
                    'earned_at' => now()
                ]);
            }
            
            // Certificate Badges
            if ($certificatesCount >= 1) {
                $badges->push([
                    'id' => 'first_certificate',
                    'name' => 'Certified',
                    'description' => 'Earned your first certificate',
                    'icon' => 'Award',
                    'color' => 'orange',
                    'earned_at' => Certificate::where('user_id', $userId)->oldest()->first()->issued_at ?? now()
                ]);
            }
            
            // Learning Streak Badge
            $user = User::find($userId);
            $currentStreak = $user ? ($user->current_streak ?? 0) : 0;
            if ($currentStreak >= 7) {
                $badges->push([
                    'id' => 'week_streak',
                    'name' => 'Consistent Learner',
                    'description' => '7-day learning streak',
                    'icon' => 'Flame',
                    'color' => 'red',
                    'earned_at' => now()
                ]);
            }
            
        } catch (\Exception $e) {
            // Return mock badges if there's an error
            $badges = collect([
                [
                    'id' => 'welcome',
                    'name' => 'Welcome',
                    'description' => 'Welcome to the platform',
                    'icon' => 'Star',
                    'color' => 'blue',
                    'earned_at' => now()
                ]
            ]);
        }
        
        return $badges;
    }
    
    /**
     * Get user completion rate
     */
    private function getUserCompletionRate($userId)
    {
        try {
            $enrollments = Enrollment::where('user_id', $userId)->count();
            $completed = Enrollment::where('user_id', $userId)->where('status', 'completed')->count();
            
            return $enrollments > 0 ? round(($completed / $enrollments) * 100, 1) : 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
    
    /**
     * Calculate skill points based on user achievements
     */
    private function calculateSkillPoints($userId)
    {
        try {
            $points = 0;
            
            // Points for enrollments
            $enrollments = Enrollment::where('user_id', $userId)->count();
            $points += $enrollments * 10;
            
            // Points for completions
            $completed = Enrollment::where('user_id', $userId)->where('status', 'completed')->count();
            $points += $completed * 50;
            
            // Points for certificates
            $certificates = Certificate::where('user_id', $userId)->count();
            $points += $certificates * 100;
            
            // Points for quiz attempts
            try {
                $quizAttempts = QuizAttempt::where('user_id', $userId)->where('status', 'completed')->count();
                $points += $quizAttempts * 20;
            } catch (\Exception $e) {
                // Skip if table doesn't exist
            }
            
            return $points;
            
        } catch (\Exception $e) {
            return rand(100, 500);
        }
    }
    
    /**
     * Get learning chart data for the user
     */
    private function getLearningChartData($userId)
    {
        try {
            $chartData = [];
            
            // Get data for the last 30 days
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dateStr = $date->format('Y-m-d');
                
                // Get learning session data for this day
                $dailyHours = 0;
                $coursesAccessed = 0;
                $lessonsCompleted = 0;
                $progressGained = 0;
                
                try {
                    // Try to get from learning_sessions table
                    $dailyHours = LearningSession::where('user_id', $userId)
                        ->whereDate('created_at', $date)
                        ->sum('duration') / 3600; // Convert seconds to hours
                        
                    $coursesAccessed = LearningSession::where('user_id', $userId)
                        ->whereDate('created_at', $date)
                        ->distinct('course_id')
                        ->count('course_id');
                        
                } catch (\Exception $e) {
                    // Fallback: use enrollment last_accessed_at
                    $dailyAccess = Enrollment::where('user_id', $userId)
                        ->whereDate('last_accessed_at', $date)
                        ->count();
                        
                    if ($dailyAccess > 0) {
                        $dailyHours = $dailyAccess * 0.5; // Estimate 0.5 hours per access
                        $coursesAccessed = $dailyAccess;
                    }
                }
                
                try {
                    // Get lessons completed on this day
                    $lessonsCompleted = LessonCompletion::where('user_id', $userId)
                        ->whereDate('created_at', $date)
                        ->count();
                        
                    // Estimate progress gained (each lesson = ~5% progress)
                    $progressGained = $lessonsCompleted * 5;
                        
                } catch (\Exception $e) {
                    // Fallback: estimate based on hours
                    $lessonsCompleted = round($dailyHours * 2); // ~2 lessons per hour
                    $progressGained = $lessonsCompleted * 5;
                }
                
                $chartData[] = [
                    'date' => $dateStr,
                    'day' => $date->format('M d'),
                    'dayName' => $date->format('D'),
                    'hours' => round($dailyHours, 1),
                    'courses' => $coursesAccessed,
                    'lessons' => $lessonsCompleted,
                    'progress' => $progressGained,
                    'cumulativeHours' => 0, // Will be calculated after
                ];
            }
            
            // Calculate cumulative hours
            $cumulativeHours = 0;
            foreach ($chartData as &$day) {
                $cumulativeHours += $day['hours'];
                $day['cumulativeHours'] = round($cumulativeHours, 1);
            }
            
            // Return different datasets for different chart types
            return [
                'daily' => array_slice($chartData, -7), // Last 7 days for daily view
                'weekly' => $this->aggregateWeeklyData($chartData), // Weekly aggregation
                'monthly' => $chartData, // Full 30 days for monthly view
                'summary' => [
                    'totalHours' => round($cumulativeHours, 1),
                    'totalLessons' => array_sum(array_column($chartData, 'lessons')),
                    'totalProgress' => array_sum(array_column($chartData, 'progress')),
                    'averageDailyHours' => round($cumulativeHours / 30, 1),
                    'activeDays' => count(array_filter($chartData, function($day) {
                        return $day['hours'] > 0;
                    }))
                ]
            ];
            
        } catch (\Exception $e) {
            // Fallback: generate sample data
            $sampleData = [];
            $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            foreach ($days as $index => $day) {
                $sampleData[] = [
                    'day' => $day,
                    'hours' => rand(1, 4),
                    'courses' => rand(1, 3),
                    'lessons' => rand(2, 8),
                    'progress' => rand(10, 40),
                ];
            }
            
            return [
                'daily' => $sampleData,
                'weekly' => [],
                'monthly' => [],
                'summary' => [
                    'totalHours' => 25.5,
                    'totalLessons' => 47,
                    'totalProgress' => 180,
                    'averageDailyHours' => 3.6,
                    'activeDays' => 7
                ]
            ];
        }
    }
    
    /**
     * Aggregate daily data into weekly data
     */
    private function aggregateWeeklyData($dailyData)
    {
        $weeklyData = [];
        $chunks = array_chunk($dailyData, 7);
        
        foreach ($chunks as $index => $week) {
            $weekStart = reset($week)['day'];
            $weekEnd = end($week)['day'];
            
            $weeklyData[] = [
                'week' => "Week " . ($index + 1),
                'period' => "$weekStart - $weekEnd",
                'hours' => round(array_sum(array_column($week, 'hours')), 1),
                'courses' => array_sum(array_column($week, 'courses')),
                'lessons' => array_sum(array_column($week, 'lessons')),
                'progress' => array_sum(array_column($week, 'progress')),
            ];
        }
        
        return $weeklyData;
    }

    public function viewCertificate(Certificate $certificate)
    {
        $user = Auth::user();
        
        // Check if certificate belongs to the current user
        if ($certificate->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this certificate.');
        }
        
        // Load certificate with course and instructor data
        $certificate->load([
            'course' => function($q) {
                $q->with('instructor:id,first_name,last_name,avatar');
            }
        ]);
        
        return Inertia::render('Student/Certificates/View', [
            'certificate' => $certificate
        ]);
    }

    public function downloadCertificate(Certificate $certificate)
    {
        $user = Auth::user();

        // Check if certificate belongs to the current user
        if ($certificate->user_id !== $user->id) {
            abort(403, 'You do not have permission to download this certificate.');
        }

        // Check if certificate file exists
        if (!$certificate->certificate_file || !\Illuminate\Support\Facades\Storage::disk('public')->exists($certificate->certificate_file)) {
            abort(404, 'Certificate file not found');
        }

        // Generate proper filename for download
        $filename = 'Certificate_' . $certificate->course->title . '_' . $user->first_name . '_' . $user->last_name;
        $filename = preg_replace('/[^A-Za-z0-9\-_]/', '_', $filename);

        $extension = pathinfo($certificate->certificate_file, PATHINFO_EXTENSION);
        $filename .= '.' . $extension;

        return \Illuminate\Support\Facades\Storage::disk('public')->download(
            $certificate->certificate_file,
            $filename
        );
    }

    /**
     * View certificate from CertificateQueue (auto-generated certificates)
     */
    public function viewQueueCertificate($id)
    {
        $user = Auth::user();

        $certificate = CertificateQueue::with(['course.instructor'])->findOrFail($id);

        // Check if certificate belongs to the current user
        if ($certificate->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this certificate.');
        }

        return Inertia::render('Student/Certificates/View', [
            'certificate' => [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'issued_at' => $certificate->approved_at ?? $certificate->created_at,
                'expires_at' => null,
                'grade' => null,
                'completion_percentage' => 100,
                'verification_code' => $certificate->certificate_number,
                'is_revoked' => $certificate->status === 'rejected',
                'revoked_at' => $certificate->rejected_at,
                'revoked_reason' => $certificate->rejection_reason,
                'certificate_url' => $certificate->certificate_file ? asset('storage/' . $certificate->certificate_file) : null,
                'certificate_file' => $certificate->certificate_file,
                'is_valid' => $certificate->status === 'approved',
                'certificate_type' => $certificate->certificate_type,
                'is_primary' => $certificate->is_primary,
                'auto_approved' => $certificate->auto_approved,
                'course' => $certificate->course ? [
                    'id' => $certificate->course->id,
                    'title' => $certificate->course->title,
                    'thumbnail' => $certificate->course->thumbnail,
                    'instructor' => $certificate->course->instructor ? [
                        'first_name' => $certificate->course->instructor->first_name,
                        'last_name' => $certificate->course->instructor->last_name,
                        'avatar' => $certificate->course->instructor->avatar,
                    ] : null,
                ] : null,
            ],
            'isQueueCertificate' => true,
        ]);
    }

    /**
     * Download certificate from CertificateQueue (auto-generated certificates)
     */
    public function downloadQueueCertificate($id)
    {
        $user = Auth::user();

        $certificate = CertificateQueue::with('course')->findOrFail($id);

        // Check if certificate belongs to the current user
        if ($certificate->user_id !== $user->id) {
            abort(403, 'You do not have permission to download this certificate.');
        }

        // Check if certificate file exists
        if (!$certificate->certificate_file || !\Illuminate\Support\Facades\Storage::disk('public')->exists($certificate->certificate_file)) {
            abort(404, 'Certificate file not found');
        }

        // Generate proper filename for download
        $courseName = $certificate->course ? $certificate->course->title : 'Course';
        $filename = 'Certificate_' . $courseName . '_' . $user->first_name . '_' . $user->last_name;
        $filename = preg_replace('/[^A-Za-z0-9\-_]/', '_', $filename);

        $extension = pathinfo($certificate->certificate_file, PATHINFO_EXTENSION);
        $filename .= '.' . $extension;

        return \Illuminate\Support\Facades\Storage::disk('public')->download(
            $certificate->certificate_file,
            $filename
        );
    }

    /**
     * Preview certificate template for enrolled students
     * Shows the certificate layout with placeholder name and number
     */
    public function previewCertificate(Course $course)
    {
        $user = Auth::user();

        // Check if user is enrolled in this course
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        if (!$enrollment) {
            abort(403, 'Anda tidak memiliki akses ke pelatihan ini.');
        }

        // Get course data for certificate
        $course->load('instructor');

        // Get instructor name (safely)
        $instructorName = 'Instruktur';
        try {
            if ($course->instructor) {
                $instructorName = trim(($course->instructor->first_name ?? '') . ' ' . ($course->instructor->last_name ?? ''));
            }
            if (empty(trim($instructorName)) || $instructorName === 'Instruktur') {
                $courseInstructorName = $course->getAttribute('instructor_name');
                if (!empty($courseInstructorName)) {
                    $instructorName = $courseInstructorName;
                }
            }
        } catch (\Exception $e) {
            // Keep default instructor name
        }

        // Get certificate unit kompetensi from course (safely)
        $certificateUnitKompetensi = [];

        // Try certificate_unit_kompetensi first
        try {
            $certUnitKompetensi = $course->getAttribute('certificate_unit_kompetensi');
            if (!empty($certUnitKompetensi)) {
                if (is_string($certUnitKompetensi)) {
                    $decoded = json_decode($certUnitKompetensi, true);
                    $certificateUnitKompetensi = is_array($decoded) ? $decoded : [];
                } elseif (is_array($certUnitKompetensi)) {
                    $certificateUnitKompetensi = $certUnitKompetensi;
                }
            }
        } catch (\Exception $e) {
            // Attribute doesn't exist, continue
        }

        // If no certificate_unit_kompetensi, try unit_kompetensi
        if (empty($certificateUnitKompetensi)) {
            try {
                $unitKompetensi = $course->getAttribute('unit_kompetensi');
                if (!empty($unitKompetensi)) {
                    if (is_string($unitKompetensi)) {
                        $decoded = json_decode($unitKompetensi, true);
                        $certificateUnitKompetensi = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($unitKompetensi)) {
                        $certificateUnitKompetensi = $unitKompetensi;
                    }
                }
            } catch (\Exception $e) {
                // Attribute doesn't exist, continue with empty array
            }
        }

        return view('certificates.preview-student', [
            'course_title' => $course->title,
            'instructor_name' => $instructorName,
            'certificate_unit_kompetensi' => $certificateUnitKompetensi,
            'back_url' => route('courses.learn', $course->slug),
        ]);
    }
}
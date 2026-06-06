<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Meeting;
use App\Models\User;
use App\Models\Role;
use App\Services\ProgressTrackingService;
use App\Notifications\CourseEnrolled;
use App\Notifications\Admin\NewStudentEnrolled;
use Illuminate\Support\Facades\Notification;

class EnrollmentController extends Controller
{
    protected $progressTrackingService;

    public function __construct(ProgressTrackingService $progressTrackingService)
    {
        $this->progressTrackingService = $progressTrackingService;
    }

    /**
     * Show user's enrolled courses (My Courses page)
     */
    public function index()
    {
        $user = Auth::user();

        try {
            // Get user's enrollments with course data
            $enrollments = Enrollment::with([
                'course' => function($query) {
                    $query->select('id', 'title', 'slug', 'description', 'thumbnail', 'instructor_id', 'level', 'duration_hours', 'price', 'is_free', 'status')
                          ->with(['instructor:id,first_name,last_name,avatar']);
                }
            ])
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->orderBy('enrolled_at', 'desc')
            ->get();

            // Transform enrollment data for frontend
            $enrolledCourses = $enrollments->map(function($enrollment) {
                $course = $enrollment->course;
                if (!$course) return null;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'description' => $course->description,
                    'thumbnail' => $course->thumbnail ? asset('storage/' . $course->thumbnail) : null,
                    'level' => $course->level ?? 'beginner',
                    'duration_hours' => $course->duration_hours ?? 0,
                    'price' => $course->price ?? 0,
                    'is_free' => $course->is_free ?? false,
                    'instructor' => $course->instructor ? [
                        'id' => $course->instructor->id,
                        'name' => $course->instructor->first_name . ' ' . $course->instructor->last_name,
                        'avatar' => $course->instructor->avatar ? asset('storage/' . $course->instructor->avatar) : null,
                    ] : null,
                    'enrollment' => [
                        'id' => $enrollment->id,
                        'status' => $enrollment->status,
                        'progress_percentage' => $enrollment->progress_percentage ?? 0,
                        'enrolled_at' => $enrollment->enrolled_at,
                        'last_accessed_at' => $enrollment->last_accessed_at,
                    ],
                    'can_access' => $enrollment->status === 'active',
                    'study_url' => route('courses.learn', $course->slug)
                ];
            })->filter(); // Remove null entries

            return Inertia::render('Student/MyCourses', [
                'enrolledCourses' => $enrolledCourses,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading My Courses: ' . $e->getMessage());
            return Inertia::render('Student/MyCourses', [
                'enrolledCourses' => collect([]),
                'user' => $user,
                'error' => 'Failed to load your courses. Please try again.'
            ]);
        }
    }

    /**
     * Enroll user in a course
     */
    public function store(Request $request, Course $course)
    {
        $user = Auth::user();

        try {
            // Check if user is already enrolled
            $existingEnrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existingEnrollment) {
                if ($existingEnrollment->status === 'active') {
                    return redirect()->route('courses.learn', $course->slug)
                        ->with('success', 'You are already enrolled in this course!');
                } else {
                    // Reactivate enrollment
                    $existingEnrollment->update([
                        'status' => 'active',
                        'enrolled_at' => now()
                    ]);

                    // Send notification to student
                    $user->notify(new CourseEnrolled($course));

                    // Send notification to all admins
                    $admins = User::whereHas('roles', function($q) {
                        $q->where('name', 'admin');
                    })->get();
                    Notification::send($admins, new NewStudentEnrolled($user, $course, $existingEnrollment));

                    return redirect()->route('courses.learn', $course->slug)
                        ->with('success', 'Welcome back! Your enrollment has been reactivated.');
                }
            }

            // Check if course is published
            if ($course->status !== 'published') {
                return redirect()->back()
                    ->with('error', 'This course is not available for enrollment.');
            }

            // For free courses, enroll directly
            if ($course->price == 0 || $course->is_free) {
                $enrollment = Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'status' => 'active',
                    'enrolled_at' => now(),
                    'enrollment_type' => 'self_enrolled'
                ]);

                // Send notification to student
                $user->notify(new CourseEnrolled($course));

                // Send notification to all admins
                $admins = User::whereHas('roles', function($q) {
                    $q->where('name', 'admin');
                })->get();
                Notification::send($admins, new NewStudentEnrolled($user, $course, $enrollment));

                return redirect()->route('courses.learn', $course->slug)
                    ->with('success', 'You have been successfully enrolled in this course!');
            }

            // For paid courses, redirect to payment
            return redirect()->route('checkout.course', $course->slug)
                ->with('info', 'Please complete the payment to enroll in this course.');

        } catch (\Exception $e) {
            Log::error('Error enrolling user: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to enroll in the course. Please try again.');
        }
    }

    /**
     * Show learning interface for enrolled course
     */
    public function learn(Request $request, Course $course)
    {
        $user = Auth::user();
        
        try {
            // Check if user is enrolled in this course
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['active', 'completed'])
                ->first();
            
            // If not enrolled, check if user should have access (for special students)
            if (!$enrollment) {
                // For special students, check if they should have access via group assignment
                if ($user->user_type === 'special' && $user->accessible_courses && is_array($user->accessible_courses)) {
                    if (in_array($course->id, $user->accessible_courses)) {
                        // Auto-enroll the student
                        try {
                            $enrollment = Enrollment::create([
                                'user_id' => $user->id,
                                'course_id' => $course->id,
                                'status' => 'active',
                                'enrolled_at' => now(),
                                'enrollment_type' => 'group_assigned'
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to auto-enroll special student: ' . $e->getMessage());
                        }
                    }
                }
                
                if (!$enrollment) {
                    return redirect()->route('courses.show', $course->slug)
                        ->with('error', 'You are not enrolled in this course or your enrollment is not active.');
                }
            }

            // Check if enrollment has expired
            if ($enrollment->isExpired()) {
                return redirect()->route('my-learning')
                    ->with('error', 'Akses Anda ke pelatihan "' . $course->title . '" telah berakhir. Silakan hubungi admin untuk memperpanjang.');
            }

            // Load course with all sections, lessons, quizzes, and assignments
            $course->load([
                'instructor' => function($query) {
                    $query->select('id', 'first_name', 'last_name', 'avatar', 'bio');
                },
                'sections' => function($query) {
                    $query->orderBy('sort_order')->with([
                        'lessons' => function($q) {
                            $q->select('id', 'section_id', 'title', 'description', 'content', 'type', 'content_images', 'document_file', 'document_filename', 'document_size', 'document_mime_type', 'duration_minutes', 'video_url', 'video_provider', 'video_duration', 'video_file', 'video_mime_type', 'video_duration_seconds', 'sort_order', 'is_preview')
                              ->orderBy('sort_order');
                        },
                        'quizzes' => function($q) {
                            $q->select('id', 'section_id', 'title', 'description', 'time_limit', 'passing_score', 'attempts_allowed', 'instructions', 'sort_order')
                              ->withCount('questions')
                              ->orderBy('sort_order');
                        },
                        'assignments' => function($q) {
                            $q->select('id', 'section_id', 'title', 'description', 'due_date', 'sort_order')
                              ->orderBy('sort_order');
                        },
                        'meetings' => function($q) {
                            $q->select('id', 'section_id', 'course_id', 'title', 'description', 'zoom_link', 'scheduled_at', 'duration_minutes', 'meeting_id', 'passcode', 'notes', 'is_published', 'sort_order')
                              ->where('is_published', true)
                              ->orderBy('scheduled_at')
                              ->orderBy('sort_order');
                        }
                    ]);
                }
            ]);

            // Get current lesson, quiz, assignment, or meeting (from URL parameters)
            $currentLessonId = $request->get('lesson');
            $currentQuizId = $request->get('quiz');
            $currentAssignmentId = $request->get('assignment');
            $currentMeetingId = $request->get('meeting');
            $currentLesson = null;
            $currentQuiz = null;
            $currentAssignment = null;
            $currentMeeting = null;

            if ($currentLessonId) {
                $currentLesson = Lesson::where('id', $currentLessonId)
                    ->whereHas('section', function($query) use ($course) {
                        $query->where('course_id', $course->id);
                    })
                    ->first();
            }

            if ($currentQuizId) {
                $currentQuiz = Quiz::where('id', $currentQuizId)
                    ->whereHas('section', function($query) use ($course) {
                        $query->where('course_id', $course->id);
                    })
                    ->withCount('questions')
                    ->first();
            }

            if ($currentAssignmentId) {
                $currentAssignment = Assignment::where('id', $currentAssignmentId)
                    ->whereHas('section', function($query) use ($course) {
                        $query->where('course_id', $course->id);
                    })
                    ->first();
            }

            if ($currentMeetingId) {
                $currentMeeting = Meeting::where('id', $currentMeetingId)
                    ->where('course_id', $course->id)
                    ->where('is_published', true)
                    ->first();
            }

            // Load course-level meetings (meetings without section_id)
            $courseLevelMeetings = Meeting::where('course_id', $course->id)
                ->whereNull('section_id')
                ->where('is_published', true)
                ->orderBy('scheduled_at')
                ->get(['id', 'course_id', 'title', 'description', 'zoom_link', 'scheduled_at', 'duration_minutes', 'meeting_id', 'passcode', 'notes', 'is_published', 'sort_order']);

            // If no current lesson specified, get the first lesson
            if (!$currentLesson && $course->sections->isNotEmpty()) {
                $firstSection = $course->sections->first();
                if ($firstSection->lessons->isNotEmpty()) {
                    $currentLesson = $firstSection->lessons->first();
                }
            }

            // Get user's lesson completions for this course
            $lessonCompletions = [];
            if ($course->sections->isNotEmpty()) {
                $allLessonIds = collect();
                foreach ($course->sections as $section) {
                    $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
                }

                try {
                    // Combine lesson_completions and lesson_access for comprehensive completion tracking
                    // This ensures backward compatibility with older data
                    $fromCompletions = DB::table('lesson_completions')
                        ->where('user_id', $user->id)
                        ->whereIn('lesson_id', $allLessonIds)
                        ->pluck('lesson_id')
                        ->toArray();

                    $fromAccess = DB::table('lesson_access')
                        ->where('user_id', $user->id)
                        ->whereIn('lesson_id', $allLessonIds)
                        ->pluck('lesson_id')
                        ->toArray();

                    // Merge both sources - lesson is complete if in either table
                    $lessonCompletions = array_values(array_unique(array_merge($fromCompletions, $fromAccess)));
                } catch (\Exception $e) {
                    Log::warning('Lesson completion query failed: ' . $e->getMessage());
                    $lessonCompletions = [];
                }
            }

            // Calculate course progress (lessons, quizzes, and assignments)
            $totalItems = 0;
            $completedItems = 0;

            // Get completed quiz attempts (must be PASSED based on passing_score)
            $completedQuizzes = [];
            try {
                $completedQuizzes = QuizAttempt::where('user_id', $user->id)
                    ->whereIn('quiz_id', function($query) use ($course) {
                        $query->select('id')
                            ->from('quizzes')
                            ->where('course_id', $course->id);
                    })
                    ->where('status', 'completed')
                    ->where('is_passed', true)
                    ->pluck('quiz_id')
                    ->unique()
                    ->values()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning('Quiz completions query failed: ' . $e->getMessage());
                // Fallback: count any completed quiz attempt
                try {
                    $completedQuizzes = QuizAttempt::where('user_id', $user->id)
                        ->whereIn('quiz_id', function($query) use ($course) {
                            $query->select('id')
                                ->from('quizzes')
                                ->where('course_id', $course->id);
                        })
                        ->where('status', 'completed')
                        ->pluck('quiz_id')
                        ->unique()
                        ->values()
                        ->toArray();
                } catch (\Exception $e2) {
                    $completedQuizzes = [];
                }
            }

            // Get completed assignment submissions (submitted or graded)
            $completedAssignments = [];
            try {
                $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
                    ->whereIn('assignment_id', function($query) use ($course) {
                        $query->select('id')
                            ->from('assignments')
                            ->where('course_id', $course->id);
                    })
                    ->whereIn('status', ['submitted', 'graded'])
                    ->pluck('assignment_id')
                    ->unique()
                    ->values()
                    ->toArray();
            } catch (\Exception $e) {
                Log::warning('Assignment completions query failed: ' . $e->getMessage());
                $completedAssignments = [];
            }

            foreach ($course->sections as $section) {
                // Count lessons
                $totalItems += $section->lessons->count();
                foreach ($section->lessons as $lesson) {
                    if (in_array($lesson->id, $lessonCompletions)) {
                        $completedItems++;
                    }
                }

                // Count quizzes
                $totalItems += $section->quizzes->count();
                foreach ($section->quizzes as $quiz) {
                    if (in_array($quiz->id, $completedQuizzes)) {
                        $completedItems++;
                    }
                }

                // Count assignments
                $totalItems += $section->assignments->count();
                foreach ($section->assignments as $assignment) {
                    if (in_array($assignment->id, $completedAssignments)) {
                        $completedItems++;
                    }
                }
            }

            $progressPercentage = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0;

            // Update enrollment progress if it has changed (using ProgressTrackingService for auto-certificate generation)
            if ($enrollment->progress_percentage != $progressPercentage) {
                $this->progressTrackingService->updateEnrollmentProgress($user->id, $course->id, [
                    'progress_percentage' => $progressPercentage
                ]);
                // Refresh enrollment to get updated data
                $enrollment->refresh();
            }

            // Build sequential content order and lock status
            $contentLockStatus = [];
            try {
                // Content order within each section: lessons -> quizzes -> assignments (by sort_order)
                $contentOrder = [];
                foreach ($course->sections as $section) {
                    $sectionItems = [];

                    foreach ($section->lessons as $lesson) {
                        $sectionItems[] = [
                            'type' => 'lesson',
                            'id' => $lesson->id,
                            'sort_order' => $lesson->sort_order,
                            'type_priority' => 1,
                        ];
                    }
                    foreach ($section->quizzes as $quiz) {
                        $sectionItems[] = [
                            'type' => 'quiz',
                            'id' => $quiz->id,
                            'sort_order' => $quiz->sort_order,
                            'type_priority' => 2,
                        ];
                    }
                    foreach ($section->assignments as $assignment) {
                        $sectionItems[] = [
                            'type' => 'assignment',
                            'id' => $assignment->id,
                            'sort_order' => $assignment->sort_order,
                            'type_priority' => 3,
                        ];
                    }

                    usort($sectionItems, function($a, $b) {
                        if ($a['type_priority'] !== $b['type_priority']) {
                            return $a['type_priority'] - $b['type_priority'];
                        }
                        return $a['sort_order'] - $b['sort_order'];
                    });

                    foreach ($sectionItems as $item) {
                        $contentOrder[] = $item;
                    }
                }

                // Determine lock status for each content item
                $previousCompleted = true; // First item always accessible

                foreach ($contentOrder as $item) {
                    $key = $item['type'] . '_' . $item['id'];
                    $isCompleted = false;

                    switch ($item['type']) {
                        case 'lesson':
                            $isCompleted = in_array($item['id'], $lessonCompletions);
                            break;
                        case 'quiz':
                            $isCompleted = in_array($item['id'], $completedQuizzes);
                            break;
                        case 'assignment':
                            $isCompleted = in_array($item['id'], $completedAssignments);
                            break;
                    }

                    $contentLockStatus[$key] = !$previousCompleted;
                    $previousCompleted = $isCompleted;
                }
            } catch (\Exception $e) {
                Log::warning('Error building content lock status: ' . $e->getMessage());
                $contentLockStatus = []; // Empty = all unlocked (safe fallback)
            }

            // Track lesson access if current lesson exists
            if ($currentLesson) {
                $this->progressTrackingService->trackLessonAccess($user->id, $course->id, $currentLesson->id);
            }

            // Get next and previous lessons for navigation
            $allLessons = collect();
            foreach ($course->sections as $section) {
                foreach ($section->lessons as $lesson) {
                    $allLessons->push($lesson);
                }
            }
            
            $currentIndex = $currentLesson ? $allLessons->search(function($lesson) use ($currentLesson) {
                return $lesson->id === $currentLesson->id;
            }) : -1;
            
            $previousLesson = $currentIndex > 0 ? $allLessons[$currentIndex - 1] : null;
            $nextLesson = $currentIndex >= 0 && $currentIndex < $allLessons->count() - 1 ? $allLessons[$currentIndex + 1] : null;

            // Calculate adjusted total/completed if zoom screenshot required
            $adjustedTotalItems = $totalItems;
            $adjustedCompletedItems = $completedItems;

            if ($course->require_zoom_screenshot) {
                $adjustedTotalItems += 1;
                if ($enrollment->zoom_screenshot_path) {
                    $adjustedCompletedItems += 1;
                }
            }

            $adjustedProgressPercentage = $adjustedTotalItems > 0
                ? round(($adjustedCompletedItems / $adjustedTotalItems) * 100, 2)
                : 0;

            return Inertia::render('Student/Learn', [
                'course' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'description' => $course->description,
                    'thumbnail' => $course->thumbnail,
                    'level' => $course->level,
                    'duration_hours' => $course->duration_hours,
                    'instructor' => $course->instructor,
                    'sections' => $course->sections,
                    'require_zoom_screenshot' => $course->require_zoom_screenshot,
                    'zoom_link' => $course->zoom_link,
                    'zoom_schedule' => $course->zoom_schedule,
                    'zoom_notes' => $course->zoom_notes,
                    'virtual_background_path' => $course->virtual_background_path,
                ],
                'enrollment' => [
                    'id' => $enrollment->id,
                    'progress_percentage' => $adjustedProgressPercentage,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'status' => $enrollment->status,
                    'zoom_screenshot_path' => $enrollment->zoom_screenshot_path,
                    'zoom_screenshot_url' => $enrollment->zoom_screenshot_path ? asset('storage/' . $enrollment->zoom_screenshot_path) : null,
                    'zoom_screenshot_uploaded_at' => $enrollment->zoom_screenshot_uploaded_at,
                ],
                'currentLesson' => $currentLesson,
                'currentQuiz' => $currentQuiz,
                'currentAssignment' => $currentAssignment,
                'currentMeeting' => $currentMeeting,
                'previousLesson' => $previousLesson,
                'nextLesson' => $nextLesson,
                'lessonCompletions' => $lessonCompletions,
                'quizCompletions' => $completedQuizzes,
                'assignmentSubmissions' => $completedAssignments,
                'courseProgress' => [
                    'total_items' => $adjustedTotalItems,
                    'completed_items' => $adjustedCompletedItems,
                    'total_lessons' => collect($course->sections)->sum(function($section) { return $section->lessons->count(); }),
                    'total_quizzes' => collect($course->sections)->sum(function($section) { return $section->quizzes->count(); }),
                    'total_assignments' => collect($course->sections)->sum(function($section) { return $section->assignments->count(); }),
                    'completed_lessons' => count($lessonCompletions),
                    'completed_quizzes' => count($completedQuizzes),
                    'completed_assignments' => count($completedAssignments),
                    'percentage' => $adjustedProgressPercentage,
                    'require_zoom_screenshot' => $course->require_zoom_screenshot,
                    'zoom_screenshot_uploaded' => !empty($enrollment->zoom_screenshot_path),
                ],
                'contentLockStatus' => $contentLockStatus,
                'courseLevelMeetings' => $courseLevelMeetings
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error accessing learning interface: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            // Instead of redirecting away, try to render the page with minimal data
            // so the student can still see the course structure
            try {
                $course->load([
                    'instructor' => function($query) {
                        $query->select('id', 'first_name', 'last_name', 'avatar', 'bio');
                    },
                    'sections' => function($query) {
                        $query->orderBy('sort_order')->with([
                            'lessons' => function($q) { $q->orderBy('sort_order'); },
                            'quizzes' => function($q) { $q->withCount('questions')->orderBy('sort_order'); },
                            'assignments' => function($q) { $q->orderBy('sort_order'); },
                            'meetings' => function($q) { $q->where('is_published', true)->orderBy('sort_order'); }
                        ]);
                    }
                ]);

                $enrollment = $enrollment ?? Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->first();

                $firstLesson = null;
                if ($course->sections && $course->sections->isNotEmpty()) {
                    $firstSection = $course->sections->first();
                    if ($firstSection->lessons->isNotEmpty()) {
                        $firstLesson = $firstSection->lessons->first();
                    }
                }

                return Inertia::render('Student/Learn', [
                    'course' => [
                        'id' => $course->id,
                        'title' => $course->title,
                        'slug' => $course->slug,
                        'description' => $course->description,
                        'thumbnail' => $course->thumbnail,
                        'level' => $course->level,
                        'duration_hours' => $course->duration_hours,
                        'instructor' => $course->instructor,
                        'sections' => $course->sections,
                        'virtual_background_path' => $course->virtual_background_path,
                    ],
                    'enrollment' => [
                        'id' => $enrollment->id ?? 0,
                        'progress_percentage' => $enrollment->progress_percentage ?? 0,
                        'enrolled_at' => $enrollment->enrolled_at ?? now(),
                        'status' => $enrollment->status ?? 'active'
                    ],
                    'currentLesson' => $firstLesson,
                    'currentQuiz' => null,
                    'currentAssignment' => null,
                    'currentMeeting' => null,
                    'previousLesson' => null,
                    'nextLesson' => null,
                    'lessonCompletions' => [],
                    'quizCompletions' => [],
                    'assignmentSubmissions' => [],
                    'courseProgress' => [
                        'total_items' => 0,
                        'completed_items' => 0,
                        'total_lessons' => 0,
                        'total_quizzes' => 0,
                        'total_assignments' => 0,
                        'completed_lessons' => 0,
                        'completed_quizzes' => 0,
                        'completed_assignments' => 0,
                        'percentage' => 0
                    ],
                    'contentLockStatus' => [],
                    'courseLevelMeetings' => collect([])
                ]);
            } catch (\Exception $fallbackError) {
                Log::error('Fallback render also failed: ' . $fallbackError->getMessage());
                return redirect()->route('student.my-learning')
                    ->with('error', 'Gagal memuat konten kursus. Silakan coba lagi.');
            }
        }
    }

    /**
     * Mark lesson as completed
     */
    public function completeLesson(Request $request, Lesson $lesson)
    {
        $user = Auth::user();
        
        try {
            // Check if user is enrolled in the course
            $enrollment = Enrollment::where('user_id', $user->id)
                ->whereHas('course.sections.lessons', function($query) use ($lesson) {
                    $query->where('lessons.id', $lesson->id);
                })
                ->where('status', 'active')
                ->first();
            
            if (!$enrollment) {
                return response()->json(['error' => 'Not enrolled in this course'], 403);
            }

            // Track lesson access/completion
            $this->progressTrackingService->trackLessonAccess($user->id, $enrollment->course_id, $lesson->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Lesson marked as completed'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error completing lesson: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to complete lesson'], 500);
        }
    }

    /**
     * Update overall progress
     */
    public function updateProgress(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'time_spent' => 'nullable|integer|min:0',
            'progress_percentage' => 'nullable|numeric|min:0|max:100'
        ]);
        
        try {
            $courseId = $request->course_id;
            $lessonId = $request->lesson_id;
            
            // Check enrollment
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $courseId)
                ->where('status', 'active')
                ->first();
            
            if (!$enrollment) {
                return response()->json(['error' => 'Not enrolled in this course'], 403);
            }

            // Track lesson access if lesson provided
            if ($lessonId) {
                $this->progressTrackingService->trackLessonAccess($user->id, $courseId, $lessonId);
            }
            
            // Update manual progress if provided
            if ($request->has('progress_percentage')) {
                $this->progressTrackingService->updateEnrollmentProgress($user->id, $courseId, [
                    'progress_percentage' => $request->progress_percentage,
                    'time_spent' => $request->time_spent ?? 0
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Progress updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating progress: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update progress'], 500);
        }
    }

    /**
     * Upload zoom screenshot for enrollment
     */
    public function uploadZoomScreenshot(Request $request, Course $course)
    {
        $user = Auth::user();

        try {
            // Check enrollment
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['active', 'completed'])
                ->first();

            if (!$enrollment) {
                return response()->json(['error' => 'Not enrolled in this course'], 403);
            }

            // Check if course requires zoom screenshot
            if (!$course->require_zoom_screenshot) {
                return response()->json(['error' => 'This course does not require zoom screenshot'], 400);
            }

            // Validate screenshot file
            $request->validate([
                'zoom_screenshot' => 'required|image|mimes:jpeg,jpg,png|max:5120', // Max 5MB
            ]);

            // Delete old screenshot if exists
            if ($enrollment->zoom_screenshot_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($enrollment->zoom_screenshot_path);
            }

            // Store new screenshot
            $path = $request->file('zoom_screenshot')->store('zoom-screenshots/' . $enrollment->id, 'public');

            // Update enrollment
            $enrollment->update([
                'zoom_screenshot_path' => $path,
                'zoom_screenshot_uploaded_at' => now(),
            ]);

            // Recalculate and update progress
            $this->recalculateProgressWithZoomScreenshot($enrollment, $course);

            return response()->json([
                'success' => true,
                'message' => 'Foto zoom berhasil diupload',
                'zoom_screenshot_url' => asset('storage/' . $path),
                'zoom_screenshot_uploaded_at' => $enrollment->zoom_screenshot_uploaded_at->format('d M Y H:i'),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error uploading zoom screenshot: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload zoom screenshot'], 500);
        }
    }

    /**
     * Delete zoom screenshot for enrollment
     */
    public function deleteZoomScreenshot(Request $request, Course $course)
    {
        $user = Auth::user();

        try {
            // Check enrollment
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['active', 'completed'])
                ->first();

            if (!$enrollment) {
                return response()->json(['error' => 'Not enrolled in this course'], 403);
            }

            if (!$enrollment->zoom_screenshot_path) {
                return response()->json(['error' => 'No zoom screenshot to delete'], 400);
            }

            // Delete the file
            \Illuminate\Support\Facades\Storage::disk('public')->delete($enrollment->zoom_screenshot_path);

            // Update enrollment
            $enrollment->update([
                'zoom_screenshot_path' => null,
                'zoom_screenshot_uploaded_at' => null,
            ]);

            // Recalculate progress
            $this->recalculateProgressWithZoomScreenshot($enrollment, $course);

            return response()->json([
                'success' => true,
                'message' => 'Foto zoom berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting zoom screenshot: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete zoom screenshot'], 500);
        }
    }

    /**
     * Recalculate progress including zoom screenshot requirement
     * Uses sections-based counting to match Learn page calculation
     */
    private function recalculateProgressWithZoomScreenshot(Enrollment $enrollment, Course $course)
    {
        $user = User::find($enrollment->user_id);

        // Load course sections with all content (consistent with Learn page)
        $course->load([
            'sections' => function($query) {
                $query->orderBy('sort_order')->with([
                    'lessons' => function($q) { $q->orderBy('sort_order'); },
                    'quizzes' => function($q) { $q->orderBy('sort_order'); },
                    'assignments' => function($q) { $q->orderBy('sort_order'); },
                ]);
            }
        ]);

        // Collect all IDs from sections (consistent with Learn page)
        $allLessonIds = collect();
        $allQuizIds = collect();
        $allAssignmentIds = collect();
        $totalLessons = 0;
        $totalQuizzes = 0;
        $totalAssignments = 0;

        foreach ($course->sections as $section) {
            $allLessonIds = $allLessonIds->merge($section->lessons->pluck('id'));
            $allQuizIds = $allQuizIds->merge($section->quizzes->pluck('id'));
            $allAssignmentIds = $allAssignmentIds->merge($section->assignments->pluck('id'));
            $totalLessons += $section->lessons->count();
            $totalQuizzes += $section->quizzes->count();
            $totalAssignments += $section->assignments->count();
        }

        // Get completed lessons (combine both tables for backward compatibility)
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

        // Get completed quizzes (must be PASSED)
        $completedQuizzes = QuizAttempt::where('user_id', $user->id)
            ->whereIn('quiz_id', $allQuizIds)
            ->where('status', 'completed')
            ->where('is_passed', true)
            ->distinct('quiz_id')
            ->count('quiz_id');

        // Get completed assignments
        $completedAssignments = AssignmentSubmission::where('user_id', $user->id)
            ->whereIn('assignment_id', $allAssignmentIds)
            ->whereIn('status', ['submitted', 'graded'])
            ->distinct('assignment_id')
            ->count('assignment_id');

        // Calculate totals
        $totalItems = $totalLessons + $totalQuizzes + $totalAssignments;
        $completedItems = $completedLessons + $completedQuizzes + $completedAssignments;

        // Add zoom screenshot requirement if enabled
        if ($course->require_zoom_screenshot) {
            $totalItems += 1; // Add 1 item for zoom screenshot
            if ($enrollment->zoom_screenshot_path) {
                $completedItems += 1; // Add completed if screenshot uploaded
            }
        }

        // Calculate percentage
        $progressPercentage = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0;

        // Update enrollment
        $enrollment->update([
            'progress_percentage' => $progressPercentage,
            'last_accessed_at' => now(),
        ]);

        // Mark as completed if 100%
        if ($progressPercentage >= 100 && $enrollment->status !== 'completed') {
            $enrollment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }

        return $progressPercentage;
    }
}

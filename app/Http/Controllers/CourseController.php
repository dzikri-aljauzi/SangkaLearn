<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Category;
use App\Models\Enrollment;
use App\Models\Review;
use App\Models\User;
use App\Models\CourseUserAccess;
use App\Models\UserGroup;
use App\Models\CourseTargetCategory;

class CourseController extends Controller
{
    /**
     * Format instructor data for course detail pages.
     */
    private function formatInstructorData($instructor)
    {
        if (!$instructor) {
            return [
                'id' => 0,
                'name' => 'LeadNex Instructor',
                'first_name' => 'LeadNex',
                'last_name' => 'Instructor',
                'avatar' => null,
                'bio' => 'Experienced instructor from LeadNex',
                'job_title' => null,
                'company' => null,
                'experience_years' => null,
                'specializations' => [],
                'expertise' => null,
                'courses_count' => 0,
                'total_students' => 0,
            ];
        }

        // Count published courses by this instructor
        $coursesCount = Course::where('instructor_id', $instructor->id)
            ->where('status', 'published')
            ->count();

        // Count total unique students enrolled in instructor's courses
        $totalStudents = Enrollment::whereHas('course', function($q) use ($instructor) {
            $q->where('instructor_id', $instructor->id);
        })->distinct('user_id')->count('user_id');

        // Build specializations list from relation + legacy field
        $specializations = [];
        if ($instructor->relationLoaded('specializations') && $instructor->specializations->isNotEmpty()) {
            $specializations = $instructor->specializations->map(function($spec) {
                return ['id' => $spec->id, 'name' => $spec->name];
            })->values()->toArray();
        }

        // Build expertise string from specializations or legacy field
        $expertise = null;
        if (!empty($specializations)) {
            $expertise = collect($specializations)->pluck('name')->implode(', ');
        } elseif (!empty($instructor->specialization)) {
            $expertise = $instructor->specialization;
        }

        return [
            'id' => $instructor->id,
            'name' => trim(($instructor->first_name ?? '') . ' ' . ($instructor->last_name ?? '')) ?: 'Instructor',
            'first_name' => $instructor->first_name ?? 'Instructor',
            'last_name' => $instructor->last_name ?? '',
            'avatar' => $instructor->avatar ?? null,
            'bio' => $instructor->bio ?? null,
            'job_title' => $instructor->job_title ?? null,
            'company' => $instructor->company ?? null,
            'experience_years' => $instructor->experience_years ?? null,
            'specializations' => $specializations,
            'expertise' => $expertise,
            'courses_count' => $coursesCount,
            'total_students' => $totalStudents,
        ];
    }

    /**
     * Eager load query for instructor with specializations.
     */
    private function instructorEagerLoad()
    {
        return function($query) {
            $query->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.bio', 'users.job_title', 'users.company', 'users.experience_years', 'users.specialization')
                  ->with(['specializations' => function($q) {
                      $q->where('is_active', true)->select('specializations.id', 'specializations.name');
                  }]);
        };
    }

    /**
     * Display courses listing with advanced filtering and search
     */
    public function index(Request $request)
    {
        try {
            // Get query parameters
            $search = $request->get('search', '');
            $category = $request->get('category', '');
            $level = $request->get('level', '');
            $sort = $request->get('sort', 'latest');
            $price = $request->get('price', '');
            $certificateType = $request->get('certificate_type', '');
            $targetCategory = $request->get('target_category', '');
            $perPage = $request->get('per_page', 12);
            
            // Build the query
            $query = Course::with([
                'instructor' => function($q) {
                    $q->select('id', 'first_name', 'last_name', 'avatar', 'bio');
                },
                'instructors' => function($q) {
                    $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.bio');
                },
                'category' => function($q) {
                    $q->select('id', 'name', 'slug');
                },
                'courseType' => function($q) {
                    $q->select('id', 'name', 'slug', 'color', 'icon');
                }
            ])
            ->withCount(['enrollments', 'reviews', 'lessons'])
            ->withAvg('reviews', 'rating')
            ->where('status', 'published');
            
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
            
            // Difficulty level filter
            if (!empty($level)) {
                $query->where('level', $level);
            }
            
            // Price filter - simplified
            if (!empty($price)) {
                switch($price) {
                    case '500k_1jt':
                        // 500rb - 1 juta
                        $query->whereBetween('price', [500000, 1000000]);
                        break;
                    case 'above_1jt':
                        // Di atas 1 juta
                        $query->where('price', '>', 1000000);
                        break;
                }
            }

            // Certificate Type filter - simplified
            if (!empty($certificateType)) {
                $query->whereHas('courseType', function($ct) use ($certificateType) {
                    // Check if filtering by parent slug or direct course type slug
                    $ct->where(function($q) use ($certificateType) {
                        // Filter by parent slug (if exists)
                        $q->whereHas('parent', function($parent) use ($certificateType) {
                            $parent->where('slug', $certificateType);
                        })
                        // OR filter by direct course type slug
                        ->orWhere('slug', $certificateType);
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
                default:
                    $query->latest();
                    break;
            }
            
            // Execute query with pagination
            $courses = $query->paginate($perPage)->withQueryString();
            
            // Transform courses data
            $courses->getCollection()->transform(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'subtitle' => $course->subtitle,
                    'description' => $course->description,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price,
                    'discount_price' => $course->discount_price,
                    'is_free' => $course->price == 0,
                    'is_featured' => $course->is_featured,
                    'difficulty_level' => $course->level ?? 'beginner',
                    'duration_hours' => $course->duration_hours,
                    'enrolled_count' => $course->enrollments_count,
                    'lesson_count' => $course->lessons_count,
                    'review_count' => $course->reviews_count,
                    'rating_avg' => round($course->reviews_avg_rating ?? 0, 1),
                    'instructor' => $course->instructor ? [
                        'id' => $course->instructor->id ?? 0,
                        'name' => trim(($course->instructor->first_name ?? '') . ' ' . ($course->instructor->last_name ?? '')) ?: 'Instructor',
                        'first_name' => $course->instructor->first_name ?? 'Instructor',
                        'last_name' => $course->instructor->last_name ?? '',
                        'avatar' => $course->instructor->avatar ?? null,
                        'bio' => $course->instructor->bio ?? null,
                    ] : [
                        'id' => 0,
                        'name' => 'LeadNex Instructor',
                        'first_name' => 'LeadNex',
                        'last_name' => 'Instructor',
                        'avatar' => null,
                        'bio' => null,
                    ],
                    'instructors' => $course->instructors->map(function($instructor) {
                        return [
                            'id' => $instructor->id,
                            'name' => trim(($instructor->first_name ?? '') . ' ' . ($instructor->last_name ?? '')) ?: 'Instructor',
                            'first_name' => $instructor->first_name ?? 'Instructor',
                            'last_name' => $instructor->last_name ?? '',
                            'avatar' => $instructor->avatar ?? null,
                            'bio' => $instructor->bio ?? null,
                        ];
                    })->values()->all(),
                    'category' => $course->category ? [
                        'id' => $course->category->id,
                        'name' => $course->category->name,
                        'slug' => $course->category->slug,
                    ] : null,
                    'created_at' => $course->created_at,
                    'is_enrolled' => Auth::check() ? 
                        Enrollment::where('user_id', Auth::id())
                                  ->where('course_id', $course->id)
                                  ->exists() : false,
                ];
            });
            
            // Get categories with course counts
            $categories = Category::withCount(['courses' => function($q) {
                $q->where('status', 'published');
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'courses_count' => $category->courses_count,
                ];
            });
            
            // Get course statistics
            $stats = [
                'total_courses' => Course::where('status', 'published')->count(),
                'total_students' => Enrollment::distinct('user_id')->count(),
                'total_instructors' => Course::where('status', 'published')
                    ->distinct('instructor_id')->count(),
                'featured_courses' => Course::where('status', 'published')
                    ->where('is_featured', true)->count(),
            ];
            
            // Get featured courses for hero section
            $featuredCourses = Course::with([
                'instructor' => function($q) {
                    $q->select('id', 'first_name', 'last_name', 'avatar');
                },
                'instructors' => function($q) {
                    $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar');
                },
                'category' => function($q) {
                    $q->select('id', 'name', 'slug');
                }
            ])
            ->withCount(['enrollments', 'reviews'])
            ->withAvg('reviews', 'rating')
            ->where('status', 'published')
            ->where('is_featured', true)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'subtitle' => $course->subtitle,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price,
                    'discount_price' => $course->discount_price,
                    'instructor_name' => $course->instructor ? trim(($course->instructor->first_name ?? '') . ' ' . ($course->instructor->last_name ?? '')) ?: 'LeadNex Instructor' : 'LeadNex Instructor',
                    'instructors' => $course->instructors->map(function($instructor) {
                        return [
                            'id' => $instructor->id,
                            'name' => trim(($instructor->first_name ?? '') . ' ' . ($instructor->last_name ?? '')) ?: 'Instructor',
                            'avatar' => $instructor->avatar ?? null,
                        ];
                    })->values()->all(),
                    'category_name' => $course->category->name ?? '',
                    'enrolled_count' => $course->enrollments_count,
                    'rating_avg' => round($course->reviews_avg_rating ?? 0, 1),
                ];
            });
            
        } catch (\Exception $e) {
            // Fallback data if there's an error
            $courses = collect([]);
            $categories = collect([]);
            $featuredCourses = collect([]);
            $stats = [
                'total_courses' => 0,
                'total_students' => 0,
                'total_instructors' => 0,
                'featured_courses' => 0,
            ];
        }

        // Get parent course types for filter dropdown
        $parentCourseTypes = \App\Models\CourseType::active()
                                                   ->parents()
                                                   ->ordered()
                                                   ->select('id', 'name', 'slug', 'color', 'icon')
                                                   ->get();

        // Get target categories with their courses for tab layout
        $targetCategories = CourseTargetCategory::active()
            ->ordered()
            ->get()
            ->map(function ($category) {
                // Get published courses for this target category
                $courses = $category->courses()
                    ->where('status', 'published')
                    ->with([
                        'instructor:id,first_name,last_name,avatar',
                        'instructors' => function($q) {
                            $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar');
                        },
                        'category:id,name,slug'
                    ])
                    ->withCount('enrollments')
                    ->take(12)
                    ->get()
                    ->map(function ($course) {
                        return [
                            'id' => $course->id,
                            'title' => $course->title,
                            'slug' => $course->slug,
                            'subtitle' => $course->subtitle,
                            'thumbnail' => $course->thumbnail,
                            'price' => $course->price ?? 0,
                            'is_private' => ($course->access_type ?? 'public') === 'private',
                            'duration_hours' => $course->duration_hours ?? 0,
                            'enrolled_count' => $course->enrollments_count ?? 0,
                            'instructor' => $course->instructor ? [
                                'name' => trim($course->instructor->first_name . ' ' . $course->instructor->last_name),
                                'avatar' => $course->instructor->avatar,
                            ] : null,
                            'instructors' => $course->instructors->map(fn($i) => [
                                'id' => $i->id,
                                'name' => trim($i->first_name . ' ' . $i->last_name),
                                'avatar' => $i->avatar,
                            ])->values()->all(),
                            'category' => $course->category ? ['name' => $course->category->name, 'slug' => $course->category->slug] : null,
                        ];
                    });

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'color' => $category->color,
                    'courses' => $courses,
                ];
            });

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'categories' => $categories,
            'featuredCourses' => $featuredCourses,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'level', 'sort', 'price', 'rating', 'certificate_type', 'target_category']),
            'currentUser' => Auth::user(),
            'parentCourseTypes' => $parentCourseTypes,
            'targetCategories' => $targetCategories,
        ]);
    }

    /**
     * Display a single course with detailed information
     */
    public function show($slug)
    {
        try {
            // Get course by slug with all related content
            $course = Course::where('slug', $slug)
                ->where('status', 'published')
                ->with([
                    'instructor' => $this->instructorEagerLoad(),
                    'instructors' => $this->instructorEagerLoad(),
                    'category:id,name,slug,description',
                    'sections' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.lessons' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.assignments' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.quizzes' => function($query) {
                        $query->where('is_published', true)
                              ->withCount('questions')
                              ->orderBy('sort_order');
                    }
                ])
                ->withCount(['enrollments', 'reviews', 'lessons'])
                ->withAvg('reviews', 'rating')
                ->first();
            
            if (!$course) {
                abort(404);
            }
            
            // Calculate actual metrics from loaded data
            $totalLessons = $course->sections->sum(function($section) {
                return $section->lessons->count();
            });
            
            $totalAssignments = $course->sections->sum(function($section) {
                return $section->assignments->count();
            });
            
            $totalQuizzes = $course->sections->sum(function($section) {
                return $section->quizzes->count();
            });
            
            
            $totalContent = $totalLessons + $totalAssignments + $totalQuizzes;
            
            // Calculate total duration from lessons
            $totalDuration = $course->sections->sum(function($section) {
                return $section->lessons->sum('duration_minutes');
            });
            
            if ($totalDuration == 0) {
                $totalDuration = $course->duration_hours ? $course->duration_hours * 60 : 120;
            }
            
            // Get user's enrollment status and purchase eligibility
            $enrollment = null;
            $user = Auth::user();
            $canPurchase = true;
            $hasAccess = false;
            $isPrivate = ($course->access_type ?? 'public') === 'private';
            $userType = 'general';

            if ($user) {
                $userType = $user->user_type ?? 'general';
                $enrollment = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->first();

                // Determine if user has access (for private courses)
                if ($isPrivate) {
                    // Check direct course access
                    $directAccess = CourseUserAccess::where('user_id', $user->id)
                        ->where('course_id', $course->id)
                        ->where(function($q) {
                            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                        })
                        ->exists();

                    // Check group access for special students
                    $groupAccess = false;
                    if ($userType === 'special' && $user->user_group_id) {
                        $userGroup = UserGroup::find($user->user_group_id);
                        if ($userGroup) {
                            $groupAccess = $userGroup->assignedCourses()
                                ->where('courses.id', $course->id)
                                ->exists();
                        }
                    }

                    $hasAccess = $directAccess || $groupAccess;
                }

                // Determine purchase eligibility
                // General student: can buy public courses, cannot buy private courses
                // Special student: cannot buy any course (only access granted courses)
                if ($userType === 'general') {
                    $canPurchase = !$isPrivate;
                } else {
                    // Special students cannot purchase any course
                    $canPurchase = false;
                }
            }

            // Simple related courses query
            $relatedCourses = Course::where('status', 'published')
                ->where('id', '!=', $course->id)
            ->latest()
            ->take(4)
            ->get();
            
            // Format course data with basic info
            $courseData = [
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
                'difficulty_level' => $course->level ?? 'beginner',
                'duration_hours' => $course->duration_hours ?? 0,
                'total_duration_minutes' => $totalDuration,
                'total_content_items' => $totalContent,
                'enrolled_count' => $course->enrollments_count ?? 0,
                'lesson_count' => $totalLessons,
                'assignment_count' => $totalAssignments,
                'quiz_count' => $totalQuizzes,
                'review_count' => $course->reviews_count ?? 0,
                'rating_avg' => round($course->reviews_avg_rating ?? 0, 1),
                'sections_count' => $course->sections->count(),
                'requirements' => is_array($course->requirements) 
                    ? $course->requirements 
                    : (is_string($course->requirements) && !empty($course->requirements) 
                        ? json_decode($course->requirements, true) ?: [$course->requirements]
                        : ['Basic knowledge of computers']),
                'learning_outcomes' => is_array($course->learning_objectives) 
                    ? $course->learning_objectives 
                    : (is_string($course->learning_objectives) && !empty($course->learning_objectives) 
                        ? json_decode($course->learning_objectives, true) ?: [$course->learning_objectives]
                        : ['Master the basics']),
                'target_audience' => is_array($course->target_audience) 
                    ? $course->target_audience 
                    : (is_string($course->target_audience) && !empty($course->target_audience) 
                        ? json_decode($course->target_audience, true) ?: [$course->target_audience]
                        : ['Beginners']),
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
                'instructor' => $this->formatInstructorData($course->instructor),
                'instructors' => $course->instructors->map(fn($i) => $this->formatInstructorData($i))->values()->all(),
                'category' => $course->category ? [
                    'id' => $course->category->id,
                    'name' => $course->category->name,
                    'slug' => $course->category->slug,
                    'description' => $course->category->description ?? '',
                ] : null,
                'sections' => $course->sections->map(function($section) {
                    return [
                        'id' => $section->id,
                        'title' => $section->title,
                        'description' => $section->description,
                        'sort_order' => $section->sort_order,
                        'lessons' => $section->lessons->map(function($lesson) {
                            return [
                                'id' => $lesson->id,
                                'title' => $lesson->title,
                                'description' => $lesson->description,
                                'type' => $lesson->type,
                                'duration_minutes' => $lesson->duration_minutes ?? 0,
                                'sort_order' => $lesson->sort_order,
                                'is_preview' => $lesson->is_preview ?? false
                            ];
                        }),
                        'assignments' => $section->assignments->map(function($assignment) {
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'description' => $assignment->description,
                                'max_points' => $assignment->max_points ?? 100,
                                'due_date' => $assignment->due_date,
                                'sort_order' => $assignment->sort_order,
                                'can_access' => true // Accessible if enrolled
                            ];
                        }),
                        'quizzes' => $section->quizzes->map(function($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'description' => $quiz->description,
                                'time_limit' => $quiz->time_limit,
                                'attempts_allowed' => $quiz->attempts_allowed,
                                'passing_score' => $quiz->passing_score,
                                'questions_count' => $quiz->questions_count ?? 0,
                                'sort_order' => $quiz->sort_order,
                                'can_access' => true // Accessible if enrolled
                            ];
                        })
                    ];
                }),
                'reviews' => is_array($course->reviews ?? null) ? $course->reviews : [],
                'is_enrolled' => $enrollment !== null,
                'enrollment' => $enrollment ? [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'progress_percentage' => $enrollment->progress_percentage,
                    'enrolled_at' => $enrollment->created_at,
                ] : null,
                // Purchase restriction fields
                'access_type' => $course->access_type ?? 'public',
                'is_private' => $isPrivate,
                'can_purchase' => $canPurchase,
                'has_access' => $hasAccess,
                'user_type' => $userType,
            ];
            
        } catch (\Exception $e) {
            // Log error dan return fallback data dengan error message
            \Log::error("CourseController@show error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
            
            // Return dengan data kosong tapi valid agar component tidak crash
            $courseData = [
                'id' => 0,
                'title' => 'Course Error',
                'slug' => 'error',
                'subtitle' => 'Error loading course',
                'description' => 'Sorry, there was an error loading this course.',
                'thumbnail' => null,
                'price' => 0,
                'difficulty_level' => 'beginner',
                'duration_hours' => 0,
                'requirements' => ['Error loading requirements'],
                'learning_outcomes' => ['Error loading learning outcomes'],
                'target_audience' => ['Error loading target audience'],
                'sections' => [],
                'reviews' => [],
                'instructor' => $this->formatInstructorData(null),
                'instructors' => [],
                'category' => null,
                'is_enrolled' => false,
                'rating_avg' => 0,
                'review_count' => 0,
                'lesson_count' => 0,
                'enrolled_count' => 0,
                'error' => true,
            ];

            return Inertia::render('Courses/Show', [
                'course' => $courseData,
                'relatedCourses' => [],
                'auth' => ['user' => Auth::user()],
            ]);
        }

        return Inertia::render('Courses/Show', [
            'course' => $courseData,
            'relatedCourses' => $relatedCourses,
            'auth' => ['user' => Auth::user()],
        ]);
    }

    public function details($slug)
    {
        try {
            // Get course by slug with all related content
            $course = Course::where('slug', $slug)
                ->where('status', 'published')
                ->with([
                    'instructor' => $this->instructorEagerLoad(),
                    'instructors' => $this->instructorEagerLoad(),
                    'category:id,name,slug,description',
                    'sections' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.lessons' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.assignments' => function($query) {
                        $query->where('is_published', true)
                              ->orderBy('sort_order');
                    },
                    'sections.quizzes' => function($query) {
                        $query->where('is_published', true)
                              ->withCount('questions')
                              ->orderBy('sort_order');
                    }
                ])
                ->withCount(['enrollments', 'reviews', 'lessons'])
                ->withAvg('reviews', 'rating')
                ->first();
            
            if (!$course) {
                abort(404);
            }
            
            // Calculate actual metrics from loaded data
            $totalLessons = $course->sections->sum(function($section) {
                return $section->lessons->count();
            });
            
            $totalAssignments = $course->sections->sum(function($section) {
                return $section->assignments->count();
            });
            
            $totalQuizzes = $course->sections->sum(function($section) {
                return $section->quizzes->count();
            });
            
            
            $totalContent = $totalLessons + $totalAssignments + $totalQuizzes;
            
            // Calculate total duration from lessons
            $totalDuration = $course->sections->sum(function($section) {
                return $section->lessons->sum('duration_minutes');
            });
            
            if ($totalDuration == 0) {
                $totalDuration = $course->duration_hours ? $course->duration_hours * 60 : 120;
            }
            
            // Get user's enrollment status and purchase eligibility
            $enrollment = null;
            $user = Auth::user();
            $canPurchase = true;
            $hasAccess = false;
            $isPrivate = ($course->access_type ?? 'public') === 'private';
            $userType = 'general';

            if ($user) {
                $userType = $user->user_type ?? 'general';
                $enrollment = Enrollment::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->first();

                // Determine if user has access (for private courses)
                if ($isPrivate) {
                    // Check direct course access
                    $directAccess = CourseUserAccess::where('user_id', $user->id)
                        ->where('course_id', $course->id)
                        ->where(function($q) {
                            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                        })
                        ->exists();

                    // Check group access for special students
                    $groupAccess = false;
                    if ($userType === 'special' && $user->user_group_id) {
                        $userGroup = UserGroup::find($user->user_group_id);
                        if ($userGroup) {
                            $groupAccess = $userGroup->assignedCourses()
                                ->where('courses.id', $course->id)
                                ->exists();
                        }
                    }

                    $hasAccess = $directAccess || $groupAccess;
                }

                // Determine purchase eligibility
                // General student: can buy public courses, cannot buy private courses
                // Special student: cannot buy any course (only access granted courses)
                if ($userType === 'general') {
                    $canPurchase = !$isPrivate;
                } else {
                    // Special students cannot purchase any course
                    $canPurchase = false;
                }
            }

            // Simple related courses query
            $relatedCourses = Course::where('status', 'published')
                ->where('id', '!=', $course->id)
            ->latest()
            ->take(4)
            ->get();
            
            // Format course data with basic info
            $courseData = [
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
                'difficulty_level' => $course->level ?? 'beginner',
                'duration_hours' => $course->duration_hours ?? 0,
                'total_duration_minutes' => $totalDuration,
                'total_content_items' => $totalContent,
                'enrolled_count' => $course->enrollments_count ?? 0,
                'lesson_count' => $totalLessons,
                'assignment_count' => $totalAssignments,
                'quiz_count' => $totalQuizzes,
                'review_count' => $course->reviews_count ?? 0,
                'rating_avg' => round($course->reviews_avg_rating ?? 0, 1),
                'sections_count' => $course->sections->count(),
                'requirements' => is_array($course->requirements) 
                    ? $course->requirements 
                    : (is_string($course->requirements) && !empty($course->requirements) 
                        ? json_decode($course->requirements, true) ?: [$course->requirements]
                        : ['Basic knowledge of computers']),
                'learning_outcomes' => is_array($course->learning_objectives) 
                    ? $course->learning_objectives 
                    : (is_string($course->learning_objectives) && !empty($course->learning_objectives) 
                        ? json_decode($course->learning_objectives, true) ?: [$course->learning_objectives]
                        : ['Master the basics']),
                'target_audience' => is_array($course->target_audience) 
                    ? $course->target_audience 
                    : (is_string($course->target_audience) && !empty($course->target_audience) 
                        ? json_decode($course->target_audience, true) ?: [$course->target_audience]
                        : ['Beginners']),
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
                'instructor' => $this->formatInstructorData($course->instructor),
                'instructors' => $course->instructors->map(fn($i) => $this->formatInstructorData($i))->values()->all(),
                'category' => $course->category ? [
                    'id' => $course->category->id,
                    'name' => $course->category->name,
                    'slug' => $course->category->slug,
                    'description' => $course->category->description ?? '',
                ] : null,
                'sections' => $course->sections->map(function($section) {
                    return [
                        'id' => $section->id,
                        'title' => $section->title,
                        'description' => $section->description,
                        'sort_order' => $section->sort_order,
                        'lessons' => $section->lessons->map(function($lesson) {
                            return [
                                'id' => $lesson->id,
                                'title' => $lesson->title,
                                'description' => $lesson->description,
                                'type' => $lesson->type,
                                'duration_minutes' => $lesson->duration_minutes ?? 0,
                                'sort_order' => $lesson->sort_order,
                                'is_preview' => $lesson->is_preview ?? false
                            ];
                        }),
                        'assignments' => $section->assignments->map(function($assignment) {
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'description' => $assignment->description,
                                'max_points' => $assignment->max_points ?? 100,
                                'due_date' => $assignment->due_date,
                                'sort_order' => $assignment->sort_order,
                                'can_access' => true // Accessible if enrolled
                            ];
                        }),
                        'quizzes' => $section->quizzes->map(function($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'description' => $quiz->description,
                                'time_limit' => $quiz->time_limit,
                                'attempts_allowed' => $quiz->attempts_allowed,
                                'passing_score' => $quiz->passing_score,
                                'questions_count' => $quiz->questions_count ?? 0,
                                'sort_order' => $quiz->sort_order,
                                'can_access' => true // Accessible if enrolled
                            ];
                        })
                    ];
                }),
                'reviews' => is_array($course->reviews ?? null) ? $course->reviews : [],
                'is_enrolled' => $enrollment !== null,
                'enrollment' => $enrollment ? [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'progress_percentage' => $enrollment->progress_percentage,
                    'enrolled_at' => $enrollment->created_at,
                ] : null,
                // Purchase restriction fields
                'access_type' => $course->access_type ?? 'public',
                'is_private' => $isPrivate,
                'can_purchase' => $canPurchase,
                'has_access' => $hasAccess,
                'user_type' => $userType,
            ];
            
        } catch (\Exception $e) {
            // Log error dan return fallback data dengan error message
            \Log::error("CourseController@details error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());

            // Return dengan data kosong tapi valid agar component tidak crash
            $courseData = [
                'id' => 0,
                'title' => 'Course Error',
                'slug' => 'error',
                'subtitle' => 'Error loading course',
                'description' => 'Sorry, there was an error loading this course.',
                'thumbnail' => null,
                'price' => 0,
                'difficulty_level' => 'beginner',
                'duration_hours' => 0,
                'requirements' => ['Error loading requirements'],
                'learning_outcomes' => ['Error loading learning outcomes'],
                'target_audience' => ['Error loading target audience'],
                'sections' => [],
                'reviews' => [],
                'instructor' => $this->formatInstructorData(null),
                'instructors' => [],
                'category' => null,
                'is_enrolled' => false,
                'rating_avg' => 0,
                'review_count' => 0,
                'lesson_count' => 0,
                'enrolled_count' => 0,
                'error' => true,
            ];

            return Inertia::render('Courses/Details', [
                'course' => $courseData,
                'relatedCourses' => [],
                'auth' => ['user' => Auth::user()],
            ]);
        }

        return Inertia::render('Courses/Details', [
            'course' => $courseData,
            'relatedCourses' => $relatedCourses,
            'auth' => ['user' => Auth::user()],
        ]);
    }

    /**
     * Search courses via AJAX
     */
    public function search(Request $request)
    {
        $search = $request->get('q', '');
        
        if (strlen($search) < 2) {
            return response()->json([]);
        }
        
        $courses = Course::with('instructor:id,first_name,last_name')
            ->where('status', 'published')
            ->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('subtitle', 'LIKE', "%{$search}%");
            })
            ->select('id', 'title', 'slug', 'thumbnail', 'instructor_id', 'price')
            ->limit(10)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'thumbnail' => $course->thumbnail,
                    'price' => $course->price,
                    'instructor_name' => $course->instructor->first_name . ' ' . $course->instructor->last_name,
                ];
            });
            
        return response()->json($courses);
    }
    
    /**
     * Show course study page for enrolled students
     */
    public function study($slug)
    {
        $user = Auth::user();
        
        // Get course with enrollment check
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->with([
                'sections' => function($query) {
                    $query->where('is_published', true)
                          ->orderBy('sort_order');
                },
                'sections.lessons' => function($query) {
                    $query->where('is_published', true)
                          ->orderBy('sort_order');
                },
                'sections.assignments' => function($query) {
                    $query->where('is_published', true)
                          ->orderBy('sort_order');
                },
                'sections.quizzes' => function($query) {
                    $query->where('is_published', true)
                          ->orderBy('sort_order');
                }
            ])
            ->first();
            
        if (!$course) {
            abort(404, 'Course not found');
        }
        
        // Check if user is enrolled
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'active')
            ->first();
            
        if (!$enrollment) {
            return redirect()->route('courses.show', $course->slug)
                ->with('error', 'You need to be enrolled in this course to access the study materials.');
        }
        
        // Get user's progress data
        $userProgress = [];
        foreach ($course->sections as $section) {
            foreach ($section->lessons as $lesson) {
                $isCompleted = DB::table('lesson_access')
                    ->where('user_id', $user->id)
                    ->where('lesson_id', $lesson->id)
                    ->exists();
                $userProgress['lessons'][$lesson->id] = $isCompleted;
            }
            
            foreach ($section->assignments as $assignment) {
                $submission = DB::table('assignment_submissions')
                    ->where('user_id', $user->id)
                    ->where('assignment_id', $assignment->id)
                    ->first();
                $userProgress['assignments'][$assignment->id] = $submission ? $submission->status : null;
            }
            
            foreach ($section->quizzes as $quiz) {
                $attempt = DB::table('quiz_attempts')
                    ->where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('status', 'completed')
                    ->orderBy('created_at', 'desc')
                    ->first();
                $userProgress['quizzes'][$quiz->id] = $attempt ? $attempt->score : null;
            }
        }
        
        return Inertia::render('Student/CourseStudy', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'sections' => $course->sections->map(function($section) {
                    return [
                        'id' => $section->id,
                        'title' => $section->title,
                        'description' => $section->description,
                        'lessons' => $section->lessons->map(function($lesson) {
                            return [
                                'id' => $lesson->id,
                                'title' => $lesson->title,
                                'description' => $lesson->description,
                                'type' => $lesson->type,
                                'duration_minutes' => $lesson->duration_minutes,
                                'is_preview' => $lesson->is_preview,
                                'sort_order' => $lesson->sort_order
                            ];
                        }),
                        'assignments' => $section->assignments->map(function($assignment) {
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'description' => $assignment->description,
                                'due_date' => $assignment->due_date,
                                'max_points' => $assignment->max_points,
                                'sort_order' => $assignment->sort_order
                            ];
                        }),
                        'quizzes' => $section->quizzes->map(function($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'description' => $quiz->description,
                                'time_limit' => $quiz->time_limit,
                                'attempts_allowed' => $quiz->attempts_allowed,
                                'passing_score' => $quiz->passing_score,
                                'sort_order' => $quiz->sort_order
                            ];
                        })
                    ];
                })
            ],
            'enrollment' => [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'progress_percentage' => $enrollment->progress_percentage
            ],
            'userProgress' => $userProgress,
            'user' => $user
        ]);
    }
}
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Category;
use App\Models\CourseType;
use App\Models\CourseTargetCategory;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Course::with(['instructor', 'enrollments']);
            
            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('instructor', function($instructor) use ($search) {
                          $instructor->where('first_name', 'like', "%{$search}%")
                                   ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            // Status filter
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Level filter
            if ($request->has('level') && !empty($request->level)) {
                $query->where('level', $request->level);
            }

            // Access type filter
            if ($request->has('access_type') && !empty($request->access_type)) {
                $query->where('access_type', $request->access_type);
            }

            $courses = $query->latest()->paginate(12);
            
            // Add computed fields
            $courses->getCollection()->transform(function ($course) {
                $course->students_count = $course->enrollments->count();
                $course->revenue = $course->enrollments->count() * $course->price;
                
                // Add full thumbnail URL
                if ($course->thumbnail) {
                    $course->thumbnail_url = asset('storage/' . $course->thumbnail);
                } else {
                    $course->thumbnail_url = null;
                }
                
                return $course;
            });

            // Statistics
            $stats = [
                'total_courses' => Course::count(),
                'published_courses' => Course::where('status', 'published')->count(),
                'draft_courses' => Course::where('status', 'draft')->count(),
                'total_students' => Enrollment::distinct('user_id')->count(),
                'total_revenue' => Course::join('enrollments', 'courses.id', '=', 'enrollments.course_id')
                                       ->sum('courses.price') ?? 0,
            ];

            return Inertia::render('Admin/Courses/Index', [
                'courses' => $courses,
                'stats' => $stats,
                'filters' => $request->only(['search', 'status', 'level', 'access_type'])
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Admin/Courses/Index', [
                'courses' => [],
                'stats' => [
                    'total_courses' => 0,
                    'published_courses' => 0,
                    'draft_courses' => 0,
                    'total_students' => 0,
                    'total_revenue' => 0,
                ],
                'filters' => $request->only(['search', 'status', 'level', 'access_type'])
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            // Get instructors for dropdown
            $instructors = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                              ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                              ->where('roles.name', 'instructor')
                              ->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
                              ->get();

            // Get categories for dropdown
            $categories = Category::where('is_active', true)
                                 ->orderBy('name')
                                 ->select('id', 'name', 'slug')
                                 ->get();

            // Get course types for dropdown (children only, grouped by parent)
            $courseTypes = CourseType::active()
                                    ->children()
                                    ->with('parent:id,name,color,icon')
                                    ->ordered()
                                    ->select('id', 'parent_id', 'name', 'slug', 'color', 'icon')
                                    ->get();

            // Get parent categories for modal
            $parentCourseTypes = CourseType::active()
                                          ->parents()
                                          ->ordered()
                                          ->select('id', 'name', 'slug', 'color', 'icon')
                                          ->get();

            // Get target categories (Mahasiswa, Pemerintah, Perusahaan)
            $targetCategories = CourseTargetCategory::active()
                                                   ->ordered()
                                                   ->get(['id', 'name', 'slug', 'icon', 'color']);

            return Inertia::render('Admin/Courses/Create', [
                'instructors' => $instructors,
                'categories' => $categories,
                'courseTypes' => $courseTypes,
                'parentCourseTypes' => $parentCourseTypes,
                'targetCategories' => $targetCategories,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Admin/Courses/Create', [
                'instructors' => [],
                'categories' => [],
                'courseTypes' => [],
                'parentCourseTypes' => [],
                'targetCategories' => [],
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log incoming request for debugging
            Log::info('Course creation attempt', [
                'user_id' => auth()->id(),
                'data' => $request->except(['thumbnail', 'virtual_background']),
                'has_thumbnail' => $request->hasFile('thumbnail'),
                'has_virtual_background' => $request->hasFile('virtual_background')
            ]);

            $validated = $request->validate([
                // Basic Info
                'title' => 'required|string|max:255',
                'subtitle' => 'nullable|string|max:255',
                'description' => 'required|string',
                'learning_objectives' => 'nullable|array',
                'requirements' => 'nullable|array',
                'target_audience' => 'nullable|array',
                'instructor_ids' => 'required|array|min:1',
                'instructor_ids.*' => 'exists:users,id',
                'category_id' => 'required|exists:categories,id',
                'level' => 'required|in:beginner,intermediate,advanced',
                'language' => 'required|string|max:50',
                'duration_hours' => 'required|numeric|min:0',

                // Pricing
                'price' => 'nullable|numeric|min:0',
                'is_free' => 'boolean',

                // Status & Access
                'status' => 'required|in:draft,published,archived',
                'access_type' => 'required|in:public,private',
                'access_description' => 'nullable|string|max:1000',

                // Media
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
                'virtual_background' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120', // Max 5MB

                // Training Config
                'course_type_id' => 'nullable|exists:course_types,id',
                'is_permanent' => 'boolean',
                'access_duration_days' => 'nullable|integer|min:0',
                'period_start' => 'nullable|date',
                'period_end' => 'nullable|date|after_or_equal:period_start',
                'registration_deadline' => 'nullable|date|before_or_equal:period_start',
                'certificate_title' => 'nullable|string|max:255',
                'delivery_method' => 'nullable|in:hybrid,online_recording,zoom_interactive',
                'zoom_link' => 'nullable|url',
                'zoom_schedule' => 'nullable|date',
                'zoom_notes' => 'nullable|string',
                'auto_archive' => 'boolean',
                'require_zoom_screenshot' => 'boolean',
                // Certificate Fields
                'instructor_name' => 'nullable|string|max:500',
                'certificate_unit_kompetensi' => 'nullable|array',
                'certificate_unit_kompetensi.*' => 'nullable|string|max:500',
                // Target Categories (Mahasiswa, Pemerintah, Perusahaan)
                'target_category_ids' => 'nullable|array',
                'target_category_ids.*' => 'exists:course_target_categories,id',
            ]);

            // Extract target_category_ids before creating course
            $targetCategoryIds = $validated['target_category_ids'] ?? [];
            unset($validated['target_category_ids']);

            // Extract instructor_ids for many-to-many relationship
            $instructorIds = $validated['instructor_ids'] ?? [];
            unset($validated['instructor_ids']);

            // Set instructor_id to the first (primary) instructor for backward compatibility
            if (!empty($instructorIds)) {
                $validated['instructor_id'] = $instructorIds[0];

                // Set instructor_name from primary instructor for certificate
                $primaryInstructor = User::find($instructorIds[0]);
                if ($primaryInstructor && empty($validated['instructor_name'])) {
                    $validated['instructor_name'] = trim($primaryInstructor->first_name . ' ' . $primaryInstructor->last_name);
                }
            }

            // Handle require_zoom_screenshot - default to false
            $validated['require_zoom_screenshot'] = $validated['require_zoom_screenshot'] ?? false;

            // Handle price based on is_free flag
            if (isset($validated['is_free']) && $validated['is_free']) {
                $validated['price'] = 0;
            } else {
                $validated['price'] = $validated['price'] ?? 0;
            }

            // Set default values for required database fields
            $validated['has_certificate'] = true;
            $validated['is_featured'] = false;
            $validated['enrolled_count'] = 0;
            $validated['completed_count'] = 0;
            $validated['rating_avg'] = 0.0;
            $validated['rating_count'] = 0;
            $validated['lesson_count'] = 0;
            $validated['quiz_count'] = 0;

            // Handle training config defaults
            $validated['is_permanent'] = $validated['is_permanent'] ?? true;
            $validated['delivery_method'] = $validated['delivery_method'] ?? 'hybrid';
            $validated['auto_archive'] = $validated['auto_archive'] ?? false;

            // Clear period dates if is_permanent is true
            if ($validated['is_permanent']) {
                $validated['period_start'] = null;
                $validated['period_end'] = null;
                $validated['registration_deadline'] = null;
            }

            // Clear zoom fields if delivery method doesn't include zoom
            if ($validated['delivery_method'] === 'online_recording') {
                $validated['zoom_link'] = null;
                $validated['zoom_schedule'] = null;
                $validated['zoom_notes'] = null;
            }

            DB::beginTransaction();

            // Generate slug
            $validated['slug'] = Str::slug($validated['title']);

            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Course::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                try {
                    $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
                    $validated['thumbnail'] = $path;
                    Log::info('Thumbnail uploaded successfully', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Thumbnail upload failed', ['error' => $e->getMessage()]);
                    throw new \Exception('Failed to upload thumbnail: ' . $e->getMessage());
                }
            }

            // Handle virtual background upload
            if ($request->hasFile('virtual_background')) {
                try {
                    $path = $request->file('virtual_background')->store('courses/virtual-backgrounds', 'public');
                    $validated['virtual_background_path'] = $path;
                    Log::info('Virtual background uploaded successfully', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Virtual background upload failed', ['error' => $e->getMessage()]);
                    // Don't throw - virtual background is optional
                }
            }

            // Remove virtual_background from validated data (it's a file, not a database field)
            // We use virtual_background_path instead
            unset($validated['virtual_background']);

            // Set published date if status is published
            if ($validated['status'] === 'published') {
                $validated['published_at'] = now();
            }

            $course = Course::create($validated);

            // Sync target categories
            if (!empty($targetCategoryIds)) {
                $course->targetCategories()->sync($targetCategoryIds);
            }

            // Sync instructors (many-to-many relationship)
            if (!empty($instructorIds)) {
                $instructorData = [];
                foreach ($instructorIds as $index => $instructorId) {
                    $instructorData[$instructorId] = [
                        'role' => $index === 0 ? 'primary' : 'secondary',
                        'revenue_share' => 0.00,
                    ];
                }
                $course->instructors()->sync($instructorData);
            }

            Log::info('Course created successfully', ['course_id' => $course->id, 'title' => $course->title]);

            DB::commit();

            return redirect()->route('admin.courses.index')
                           ->with('success', 'Course created successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Course validation failed', [
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);
            return redirect()->back()
                           ->withInput()
                           ->withErrors($e->errors())
                           ->with('error', 'Validation failed. Please check the form.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Course creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to create course: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load(['instructor', 'enrollments.user']);
        
        // Calculate statistics
        $course->students_count = $course->enrollments->count();
        $course->revenue = $course->enrollments->count() * $course->price;
        $course->completion_rate = $course->enrollments->where('status', 'completed')->count() / max($course->enrollments->count(), 1) * 100;

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        try {
            // Load courseType, targetCategories, and instructors relationships
            $course->load(['courseType', 'targetCategories', 'instructors']);

            // Get instructors for dropdown
            $instructors = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                              ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                              ->where('roles.name', 'instructor')
                              ->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
                              ->get();

            // Get categories for dropdown
            $categories = Category::where('is_active', true)
                                 ->orderBy('name')
                                 ->select('id', 'name', 'slug')
                                 ->get();

            // Get course types for dropdown (children only, grouped by parent)
            $courseTypes = CourseType::active()
                                    ->children()
                                    ->with('parent:id,name,color,icon')
                                    ->ordered()
                                    ->select('id', 'parent_id', 'name', 'slug', 'color', 'icon')
                                    ->get();

            // Get target categories (Mahasiswa, Pemerintah, Perusahaan)
            $targetCategories = CourseTargetCategory::active()
                                                   ->ordered()
                                                   ->get(['id', 'name', 'slug', 'icon', 'color']);

            // Get parent categories for modal
            $parentCourseTypes = CourseType::active()
                                          ->parents()
                                          ->ordered()
                                          ->select('id', 'name', 'slug', 'color', 'icon')
                                          ->get();

            return Inertia::render('Admin/Courses/Edit', [
                'course' => $course,
                'instructors' => $instructors,
                'categories' => $categories,
                'courseTypes' => $courseTypes,
                'parentCourseTypes' => $parentCourseTypes,
                'targetCategories' => $targetCategories,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.courses.index')
                           ->with('error', 'Failed to load course for editing.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        try {
            // Log incoming request for debugging
            Log::info('Course update attempt', [
                'user_id' => auth()->id(),
                'course_id' => $course->id,
                'data' => $request->except(['thumbnail']),
                'has_thumbnail' => $request->hasFile('thumbnail')
            ]);

            $validated = $request->validate([
                // Basic Info
                'title' => 'required|string|max:255',
                'subtitle' => 'nullable|string|max:255',
                'description' => 'required|string',
                'learning_objectives' => 'nullable|array',
                'requirements' => 'nullable|array',
                'target_audience' => 'nullable|array',
                'instructor_ids' => 'required|array|min:1',
                'instructor_ids.*' => 'exists:users,id',
                'category_id' => 'nullable|exists:categories,id',
                'level' => 'required|in:beginner,intermediate,advanced',
                'language' => 'required|string|max:50',
                'duration_hours' => 'required|numeric|min:0',

                // Pricing
                'price' => 'nullable|numeric|min:0',
                'is_free' => 'boolean',

                // Status & Access
                'status' => 'required|in:draft,published,archived',
                'access_type' => 'required|in:public,private',
                'access_description' => 'nullable|string|max:1000',

                // Media
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',

                // Training Config
                'course_type_id' => 'nullable|exists:course_types,id',
                'is_permanent' => 'boolean',
                'access_duration_days' => 'nullable|integer|min:0',
                'period_start' => 'nullable|date',
                'period_end' => 'nullable|date|after_or_equal:period_start',
                'registration_deadline' => 'nullable|date|before_or_equal:period_start',
                'certificate_title' => 'nullable|string|max:255',
                'delivery_method' => 'nullable|in:hybrid,online_recording,zoom_interactive',
                'zoom_link' => 'nullable|url',
                'zoom_schedule' => 'nullable|date',
                'zoom_notes' => 'nullable|string',
                'auto_archive' => 'boolean',
                'require_zoom_screenshot' => 'boolean',
                // Certificate Fields
                'instructor_name' => 'nullable|string|max:500',
                'certificate_unit_kompetensi' => 'nullable|array',
                'certificate_unit_kompetensi.*' => 'nullable|string|max:500',
                // Target Categories (Mahasiswa, Pemerintah, Perusahaan)
                'target_category_ids' => 'nullable|array',
                'target_category_ids.*' => 'exists:course_target_categories,id',
            ]);

            // Extract target_category_ids before updating course
            $targetCategoryIds = $validated['target_category_ids'] ?? [];
            unset($validated['target_category_ids']);

            // Extract instructor_ids for many-to-many relationship
            $instructorIds = $validated['instructor_ids'] ?? [];
            unset($validated['instructor_ids']);

            // Set instructor_id to the first (primary) instructor for backward compatibility
            if (!empty($instructorIds)) {
                $validated['instructor_id'] = $instructorIds[0];

                // Update instructor_name from primary instructor for certificate if not manually set
                $primaryInstructor = User::find($instructorIds[0]);
                if ($primaryInstructor && empty($validated['instructor_name'])) {
                    $validated['instructor_name'] = trim($primaryInstructor->first_name . ' ' . $primaryInstructor->last_name);
                }
            }

            // Handle require_zoom_screenshot - keep existing value if not provided
            if (!$request->has('require_zoom_screenshot')) {
                $validated['require_zoom_screenshot'] = $course->require_zoom_screenshot ?? false;
            }

            DB::beginTransaction();

            // Handle is_free and price relationship
            if (isset($validated['is_free']) && $validated['is_free']) {
                $validated['price'] = 0;
            } else {
                $validated['price'] = $validated['price'] ?? 0;
            }

            // Handle training config defaults
            $validated['is_permanent'] = $validated['is_permanent'] ?? true;
            $validated['delivery_method'] = $validated['delivery_method'] ?? 'hybrid';
            $validated['auto_archive'] = $validated['auto_archive'] ?? false;

            // Clear period dates if is_permanent is true
            if ($validated['is_permanent']) {
                $validated['period_start'] = null;
                $validated['period_end'] = null;
                $validated['registration_deadline'] = null;
            }

            // Clear zoom fields if delivery method doesn't include zoom
            if ($validated['delivery_method'] === 'online_recording') {
                $validated['zoom_link'] = null;
                $validated['zoom_schedule'] = null;
                $validated['zoom_notes'] = null;
            }

            // Update slug if title changed
            if ($course->title !== $validated['title']) {
                $validated['slug'] = Str::slug($validated['title']);

                // Ensure unique slug
                $originalSlug = $validated['slug'];
                $count = 1;
                while (Course::where('slug', $validated['slug'])->where('id', '!=', $course->id)->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $count;
                    $count++;
                }
            }

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                try {
                    // Delete old thumbnail
                    if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
                        Storage::disk('public')->delete($course->thumbnail);
                    }

                    $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
                    $validated['thumbnail'] = $path;
                    Log::info('Thumbnail updated successfully', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Thumbnail update failed', ['error' => $e->getMessage()]);
                    throw new \Exception('Failed to update thumbnail: ' . $e->getMessage());
                }
            } else {
                // Keep existing thumbnail if no new file is uploaded
                unset($validated['thumbnail']);
            }

            // Set published date if status changed to published
            if ($validated['status'] === 'published' && $course->status !== 'published') {
                $validated['published_at'] = now();
            }

            // Handle empty certificate_unit_kompetensi - FormData doesn't send empty arrays
            // If the field is not in validated (empty array not sent), set it to empty array
            if (!$request->has('certificate_unit_kompetensi') ||
                (is_array($request->input('certificate_unit_kompetensi')) && count($request->input('certificate_unit_kompetensi')) === 0)) {
                $validated['certificate_unit_kompetensi'] = [];
            }

            $course->update($validated);

            // Sync target categories
            $course->targetCategories()->sync($targetCategoryIds);

            // Sync instructors (many-to-many relationship)
            if (!empty($instructorIds)) {
                $instructorData = [];
                foreach ($instructorIds as $index => $instructorId) {
                    $instructorData[$instructorId] = [
                        'role' => $index === 0 ? 'primary' : 'secondary',
                        'revenue_share' => 0.00,
                    ];
                }
                $course->instructors()->sync($instructorData);
            }

            Log::info('Course updated successfully', ['course_id' => $course->id, 'title' => $course->title]);

            DB::commit();

            return redirect()->route('admin.courses.index')
                           ->with('success', 'Course updated successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Course update validation failed', [
                'errors' => $e->errors(),
                'course_id' => $course->id,
                'user_id' => auth()->id()
            ]);
            return redirect()->back()
                           ->withInput()
                           ->withErrors($e->errors())
                           ->with('error', 'Validation failed. Please check the form.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Course update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'course_id' => $course->id,
                'user_id' => auth()->id()
            ]);
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to update course: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        try {
            DB::beginTransaction();

            // Delete thumbnail if exists
            if ($course->thumbnail && Storage::disk('public')->exists($course->thumbnail)) {
                Storage::disk('public')->delete($course->thumbnail);
            }

            // Soft delete the course
            $course->delete();

            DB::commit();

            return redirect()->route('admin.courses.index')
                           ->with('success', 'Course deleted successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                           ->with('error', 'Failed to delete course. Please try again.');
        }
    }

    /**
     * Update course by ID - Alternative method for POST route
     */
    public function updateById(Request $request, $id)
    {
        try {
            $course = Course::findOrFail($id);
            return $this->update($request, $course);
        } catch (\Exception $e) {
            return back()->with('error', 'Course not found or update failed: ' . $e->getMessage());
        }
    }

    /**
     * Export courses to Excel
     */
    public function export(Request $request)
    {
        try {
            // Get all courses with the same filters as the index page
            $query = Course::with(['instructor', 'enrollments', 'category']);
            
            // Apply filters if provided
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('instructor', function($instructor) use ($search) {
                          $instructor->where('first_name', 'like', "%{$search}%")
                                   ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('level') && !empty($request->level)) {
                $query->where('level', $request->level);
            }

            if ($request->has('access_type') && !empty($request->access_type)) {
                $query->where('access_type', $request->access_type);
            }

            $courses = $query->latest('created_at')->get();
            
            // Process course data
            $courses->transform(function ($course) {
                // Get enrollment statistics
                $course->enrollments_count = $course->enrollments->count();
                $course->active_enrollments = $course->enrollments->where('status', 'active')->count();
                $course->completed_enrollments = $course->enrollments->where('status', 'completed')->count();
                
                // Calculate average progress
                $avgProgress = $course->enrollments->avg('progress_percentage');
                $course->average_progress = $avgProgress ? round($avgProgress, 1) : 0;
                
                // Calculate completion rate
                $course->completion_rate = $course->enrollments_count > 0 
                    ? round(($course->completed_enrollments / $course->enrollments_count) * 100, 1) 
                    : 0;
                
                // Calculate revenue (simplified)
                $course->total_revenue = $course->enrollments_count * $course->price;
                
                return $course;
            });

            // Create Excel file
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Courses Export');

            // Set headers
            $headers = [
                'A1' => 'No.',
                'B1' => 'Title',
                'C1' => 'Instructor',
                'D1' => 'Category',
                'E1' => 'Level',
                'F1' => 'Status',
                'G1' => 'Access Type',
                'H1' => 'Price (IDR)',
                'I1' => 'Duration (Hours)',
                'J1' => 'Total Enrollments',
                'K1' => 'Active Enrollments',
                'L1' => 'Completed Enrollments',
                'M1' => 'Average Progress (%)',
                'N1' => 'Completion Rate (%)',
                'O1' => 'Total Revenue (IDR)',
                'P1' => 'Language',
                'Q1' => 'Created Date',
                'R1' => 'Updated Date'
            ];

            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
            }

            // Style header row
            $headerRange = 'A1:R1';
            $sheet->getStyle($headerRange)->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4A5568']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ]
            ]);

            // Auto-size columns
            foreach (range('A', 'R') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Add data
            $row = 2;
            foreach ($courses as $index => $course) {
                $instructorName = $course->instructor 
                    ? $course->instructor->first_name . ' ' . $course->instructor->last_name 
                    : 'N/A';
                
                $sheet->setCellValue('A' . $row, $index + 1);
                $sheet->setCellValue('B' . $row, $course->title);
                $sheet->setCellValue('C' . $row, $instructorName);
                $sheet->setCellValue('D' . $row, $course->category->name ?? 'Uncategorized');
                $sheet->setCellValue('E' . $row, ucfirst($course->level));
                $sheet->setCellValue('F' . $row, ucfirst($course->status));
                $sheet->setCellValue('G' . $row, ucfirst(str_replace('_', ' ', $course->access_type)));
                $sheet->setCellValue('H' . $row, number_format($course->price, 0, ',', '.'));
                $sheet->setCellValue('I' . $row, $course->duration_hours);
                $sheet->setCellValue('J' . $row, $course->enrollments_count);
                $sheet->setCellValue('K' . $row, $course->active_enrollments);
                $sheet->setCellValue('L' . $row, $course->completed_enrollments);
                $sheet->setCellValue('M' . $row, $course->average_progress . '%');
                $sheet->setCellValue('N' . $row, $course->completion_rate . '%');
                $sheet->setCellValue('O' . $row, number_format($course->total_revenue, 0, ',', '.'));
                $sheet->setCellValue('P' . $row, $course->language ?: 'Indonesian');
                $sheet->setCellValue('Q' . $row, $course->created_at->format('Y-m-d'));
                $sheet->setCellValue('R' . $row, $course->updated_at->format('Y-m-d'));
                
                // Style data rows with alternating colors
                $rowRange = 'A' . $row . ':R' . $row;
                $fillColor = ($row % 2 == 0) ? 'F7FAFC' : 'FFFFFF';
                $sheet->getStyle($rowRange)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $fillColor]
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'E2E8F0']
                        ]
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);
                
                $row++;
            }

            // Create a temporary file
            $fileName = 'courses_export_' . now()->format('Y_m_d_H_i_s') . '.xlsx';
            $tempFile = tempnam(sys_get_temp_dir(), 'courses_export');
            
            $writer = new Xlsx($spreadsheet);
            $writer->save($tempFile);

            // Return file download response
            return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Error exporting courses: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to export courses. Please try again.');
        }
    }

    /**
     * Preview course as student view (admin only)
     */
    public function preview(Course $course)
    {
        try {
            // Load course with all related content (same as student view)
            $course->load([
                'instructor:id,first_name,last_name,avatar,bio',
                'instructors' => function($q) {
                    $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.bio', 'users.job_title', 'users.company', 'users.experience_years', 'users.specialization');
                },
                'category:id,name,slug,description',
                'sections' => function($query) {
                    $query->orderBy('sort_order');
                },
                'sections.lessons' => function($query) {
                    $query->orderBy('sort_order');
                },
                'sections.assignments' => function($query) {
                    $query->orderBy('sort_order');
                },
                'sections.quizzes' => function($query) {
                    $query->orderBy('sort_order');
                },
                'sections.meetings' => function($query) {
                    $query->orderBy('scheduled_at')->orderBy('sort_order');
                }
            ]);

            // Calculate metrics (same as student view)
            $totalLessons = $course->sections->sum(function($section) {
                return $section->lessons->count();
            });

            $totalAssignments = $course->sections->sum(function($section) {
                return $section->assignments->count();
            });

            $totalQuizzes = $course->sections->sum(function($section) {
                return $section->quizzes->count();
            });

            $totalMeetings = $course->sections->sum(function($section) {
                return $section->meetings->count();
            });

            $totalContent = $totalLessons + $totalAssignments + $totalQuizzes + $totalMeetings;

            // Calculate total duration
            $totalDuration = $course->sections->sum(function($section) {
                return $section->lessons->sum('duration_minutes');
            });

            if ($totalDuration == 0) {
                $totalDuration = $course->duration_hours ? $course->duration_hours * 60 : 120;
            }

            // Get enrollment count and reviews
            $enrollmentCount = Enrollment::where('course_id', $course->id)->count();
            $reviewsAvg = $course->reviews()->avg('rating') ?? 0;
            $reviewsCount = $course->reviews()->count();

            // Get related courses (simplified)
            $relatedCourses = Course::where('status', 'published')
                ->where('id', '!=', $course->id)
                ->latest()
                ->take(4)
                ->get();

            // Format course data
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
                'difficulty_level' => $course->difficulty_level ?? 'beginner',
                'duration_hours' => $course->duration_hours ?? 0,
                'total_duration_minutes' => $totalDuration,
                'total_content_items' => $totalContent,
                'enrolled_count' => $enrollmentCount,
                'lesson_count' => $totalLessons,
                'assignment_count' => $totalAssignments,
                'quiz_count' => $totalQuizzes,
                'meeting_count' => $totalMeetings,
                'review_count' => $reviewsCount,
                'rating_avg' => round($reviewsAvg, 1),
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
                'instructor' => $course->instructor ? [
                    'id' => $course->instructor->id,
                    'name' => $course->instructor->first_name . ' ' . $course->instructor->last_name,
                    'first_name' => $course->instructor->first_name,
                    'last_name' => $course->instructor->last_name,
                    'avatar' => $course->instructor->avatar,
                    'bio' => $course->instructor->bio ?? 'Experienced instructor',
                    'expertise' => 'Teaching', // Default value since column doesn't exist
                    'courses_count' => Course::where('instructor_id', $course->instructor->id)->count(),
                ] : null,
                'instructors' => $course->instructors->map(function($instructor) {
                    return [
                        'id' => $instructor->id,
                        'name' => trim($instructor->first_name . ' ' . $instructor->last_name),
                        'first_name' => $instructor->first_name,
                        'last_name' => $instructor->last_name,
                        'avatar' => $instructor->avatar,
                        'bio' => $instructor->bio ?? 'Experienced instructor',
                        'job_title' => $instructor->job_title,
                        'company' => $instructor->company,
                        'experience_years' => $instructor->experience_years,
                        'expertise' => $instructor->specialization ?? 'Teaching',
                        'courses_count' => Course::where('instructor_id', $instructor->id)->count(),
                    ];
                })->values()->all(),
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
                        'is_published' => $section->is_published,
                        'lessons' => $section->lessons->map(function($lesson) {
                            return [
                                'id' => $lesson->id,
                                'title' => $lesson->title,
                                'description' => $lesson->description,
                                'type' => $lesson->type,
                                'duration_minutes' => $lesson->duration_minutes,
                                'sort_order' => $lesson->sort_order,
                                'is_published' => $lesson->is_published,
                                'is_preview' => $lesson->is_preview ?? false,
                            ];
                        }),
                        'assignments' => $section->assignments->map(function($assignment) {
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'description' => $assignment->description,
                                'max_points' => $assignment->max_points,
                                'due_date' => $assignment->due_date,
                                'sort_order' => $assignment->sort_order,
                                'is_published' => $assignment->is_published,
                            ];
                        }),
                        'quizzes' => $section->quizzes->map(function($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'description' => $quiz->description,
                                'time_limit' => $quiz->time_limit,
                                'passing_score' => $quiz->passing_score,
                                'sort_order' => $quiz->sort_order,
                                'is_published' => $quiz->is_published,
                                'questions_count' => $quiz->questions()->count(),
                            ];
                        }),
                        'meetings' => $section->meetings->map(function($meeting) {
                            return [
                                'id' => $meeting->id,
                                'title' => $meeting->title,
                                'description' => $meeting->description,
                                'scheduled_at' => $meeting->scheduled_at,
                                'duration_minutes' => $meeting->duration_minutes,
                                'meeting_type' => $meeting->meeting_type,
                                'meeting_link' => $meeting->meeting_link,
                                'meeting_platform' => $meeting->meeting_platform,
                                'sort_order' => $meeting->sort_order,
                                'is_published' => $meeting->is_published,
                            ];
                        }),
                    ];
                }),
            ];

            // Render the student course view with preview flag
            return Inertia::render('Courses/Show', [
                'course' => $courseData,
                'relatedCourses' => $relatedCourses,
                'enrollment' => null, // No enrollment in preview mode
                'isPreviewMode' => true, // Flag to indicate this is preview
                'adminReturnUrl' => route('admin.courses.index'), // Return URL for admin
                'previewEnrolledUrl' => route('admin.courses.preview-enrolled', $course->slug), // URL for enrolled preview
            ]);

        } catch (\Exception $e) {
            Log::error('Error previewing course: ' . $e->getMessage());
            return redirect()->route('admin.courses.index')
                ->with('error', 'Failed to preview course. Please try again.');
        }
    }

    /**
     * Upload virtual background for zoom meeting
     */
    public function uploadVirtualBackground(Request $request, Course $course)
    {
        try {
            $request->validate([
                'virtual_background' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // Max 5MB
            ]);

            DB::beginTransaction();

            // Delete old virtual background if exists
            if ($course->virtual_background_path && Storage::disk('public')->exists($course->virtual_background_path)) {
                Storage::disk('public')->delete($course->virtual_background_path);
            }

            // Store new virtual background
            $path = $request->file('virtual_background')->store('courses/virtual-backgrounds', 'public');

            $course->update([
                'virtual_background_path' => $path,
            ]);

            DB::commit();

            Log::info('Virtual background uploaded successfully', [
                'course_id' => $course->id,
                'path' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Virtual background berhasil diupload',
                'virtual_background_url' => asset('storage/' . $path),
                'virtual_background_path' => $path,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->errors()['virtual_background'][0] ?? 'Validasi gagal',
            ], 422);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Virtual background upload failed', [
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Gagal mengupload virtual background: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete virtual background for zoom meeting
     */
    public function deleteVirtualBackground(Course $course)
    {
        try {
            if (!$course->virtual_background_path) {
                return response()->json([
                    'success' => false,
                    'error' => 'Tidak ada virtual background untuk dihapus',
                ], 400);
            }

            DB::beginTransaction();

            // Delete the file
            if (Storage::disk('public')->exists($course->virtual_background_path)) {
                Storage::disk('public')->delete($course->virtual_background_path);
            }

            $course->update([
                'virtual_background_path' => null,
            ]);

            DB::commit();

            Log::info('Virtual background deleted successfully', [
                'course_id' => $course->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Virtual background berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Virtual background delete failed', [
                'course_id' => $course->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Gagal menghapus virtual background: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview course as enrolled student view (admin only)
     */
    public function previewEnrolled(Request $request, Course $course)
    {
        try {
            // Load course with all related content
            $course->load([
                'instructor:id,first_name,last_name,avatar,bio',
                'instructors' => function($q) {
                    $q->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.bio', 'users.job_title', 'users.company', 'users.experience_years', 'users.specialization');
                },
                'category:id,name,slug,description',
                'sections' => function($query) {
                    $query->where('is_published', true)->orderBy('sort_order');
                },
                'sections.lessons' => function($query) {
                    $query->where('is_published', true)->orderBy('sort_order');
                },
                'sections.assignments' => function($query) {
                    $query->where('is_published', true)->orderBy('sort_order');
                },
                'sections.quizzes' => function($query) {
                    $query->where('is_published', true)
                          ->withCount('questions')
                          ->orderBy('sort_order');
                },
                'sections.meetings' => function($query) {
                    $query->where('is_published', true)->orderBy('scheduled_at')->orderBy('sort_order');
                }
            ]);

            // Create mock enrollment data for preview
            $enrollment = (object) [
                'id' => 0,
                'user_id' => auth()->id(),
                'course_id' => $course->id,
                'status' => 'active',
                'enrolled_at' => now(),
                'progress' => 0,
                'completed_at' => null,
            ];

            // Get current lesson, quiz, assignment, or meeting (from URL parameters)
            $currentLessonId = $request->get('lesson');
            $currentQuizId = $request->get('quiz');
            $currentAssignmentId = $request->get('assignment');
            $currentMeetingId = $request->get('meeting');
            $currentLesson = null;
            $currentQuiz = null;
            $currentAssignment = null;
            $currentMeeting = null;

            // Load specific lesson if requested
            if ($currentLessonId) {
                foreach ($course->sections as $section) {
                    $currentLesson = $section->lessons->firstWhere('id', $currentLessonId);
                    if ($currentLesson) break;
                }
            }

            // Load specific quiz if requested
            if ($currentQuizId) {
                foreach ($course->sections as $section) {
                    $currentQuiz = $section->quizzes->firstWhere('id', $currentQuizId);
                    if ($currentQuiz) break;
                }
            }

            // Load specific assignment if requested
            if ($currentAssignmentId) {
                foreach ($course->sections as $section) {
                    $currentAssignment = $section->assignments->firstWhere('id', $currentAssignmentId);
                    if ($currentAssignment) break;
                }
            }

            // Load specific meeting if requested
            if ($currentMeetingId) {
                foreach ($course->sections as $section) {
                    $currentMeeting = $section->meetings->firstWhere('id', $currentMeetingId);
                    if ($currentMeeting) break;
                }
            }

            // If no current item specified, get the first lesson
            if (!$currentLesson && !$currentQuiz && !$currentAssignment && !$currentMeeting) {
                foreach ($course->sections as $section) {
                    if ($section->lessons->count() > 0) {
                        $currentLesson = $section->lessons->first();
                        break;
                    }
                }
            }

            // Calculate previous and next lessons for navigation
            $allLessons = collect();
            foreach ($course->sections as $section) {
                $allLessons = $allLessons->merge($section->lessons);
            }

            $previousLesson = null;
            $nextLesson = null;

            if ($currentLesson) {
                $currentIndex = $allLessons->search(function($lesson) use ($currentLesson) {
                    return $lesson->id === $currentLesson->id;
                });

                if ($currentIndex !== false) {
                    if ($currentIndex > 0) {
                        $previousLesson = $allLessons[$currentIndex - 1];
                    }
                    if ($currentIndex < $allLessons->count() - 1) {
                        $nextLesson = $allLessons[$currentIndex + 1];
                    }
                }
            }

            // Create mock course progress for preview
            $courseProgress = (object) [
                'percentage' => 0,
                'completed_items' => 0,
                'total_items' => 0,
                'completed_lessons' => 0,
                'total_lessons' => 0,
                'completed_quizzes' => 0,
                'total_quizzes' => 0,
                'completed_assignments' => 0,
                'total_assignments' => 0,
                'completed_meetings' => 0,
                'total_meetings' => 0,
            ];

            // Render the enrolled student view (Learn page)
            return Inertia::render('Student/Learn', [
                'course' => $course,
                'enrollment' => $enrollment,
                'currentLesson' => $currentLesson,
                'currentQuiz' => $currentQuiz,
                'currentAssignment' => $currentAssignment,
                'currentMeeting' => $currentMeeting,
                'previousLesson' => $previousLesson,
                'nextLesson' => $nextLesson,
                'lessonCompletions' => [],
                'quizCompletions' => [],
                'assignmentSubmissions' => [],
                'courseProgress' => $courseProgress,
                'contentLockStatus' => (object) [],
                'isPreviewMode' => true,
                'adminReturnUrl' => route('admin.courses.index'),
                'previewPublicUrl' => route('admin.courses.preview', $course->slug),
            ]);

        } catch (\Exception $e) {
            Log::error('Error previewing enrolled course: ' . $e->getMessage());
            return redirect()->route('admin.courses.index')
                ->with('error', 'Failed to preview enrolled view. Please try again.');
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserGroup;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of user groups
     */
    public function index(Request $request)
    {
        try {
            $query = UserGroup::query();

            // Search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Status filter
            if ($request->has('status') && !empty($request->status)) {
                $query->where('is_active', $request->status === 'active');
            }

            $groups = $query->withCount([
                'users',
                'specialStudents',
                'subAdmins'
            ])->latest()->paginate(15);

            // Add additional computed data
            $groups->getCollection()->transform(function ($group) {
                try {
                    // Get active/inactive counts
                    $activeUsers = $group->users()->where('is_active', true)->count();
                    $inactiveUsers = $group->users_count - $activeUsers;

                    // Get enrollment statistics for special students
                    $specialStudentIds = $group->specialStudents()->pluck('id');
                    $totalEnrollments = 0;
                    $completedEnrollments = 0;

                    if ($specialStudentIds->isNotEmpty()) {
                        $enrollmentStats = DB::table('enrollments')
                            ->whereIn('user_id', $specialStudentIds)
                            ->selectRaw('
                                COUNT(*) as total,
                                COUNT(CASE WHEN status = "completed" THEN 1 END) as completed
                            ')
                            ->first();

                        $totalEnrollments = $enrollmentStats->total ?? 0;
                        $completedEnrollments = $enrollmentStats->completed ?? 0;
                    }

                    $group->stats = [
                        'active_users' => $activeUsers,
                        'inactive_users' => $inactiveUsers,
                        'total_enrollments' => $totalEnrollments,
                        'completed_enrollments' => $completedEnrollments,
                        'completion_rate' => $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 1) : 0
                    ];

                    $group->status = $group->is_active ? 'active' : 'inactive';
                } catch (\Exception $e) {
                    // Fallback data
                    $group->stats = [
                        'active_users' => 0,
                        'inactive_users' => 0,
                        'total_enrollments' => 0,
                        'completed_enrollments' => 0,
                        'completion_rate' => 0
                    ];
                    $group->status = $group->is_active ? 'active' : 'inactive';
                }

                return $group;
            });

            // Overall stats
            $stats = [
                'total_groups' => UserGroup::count(),
                'active_groups' => UserGroup::where('is_active', true)->count(),
                'inactive_groups' => UserGroup::where('is_active', false)->count(),
                'total_members' => User::whereNotNull('user_group_id')->count(),
                'special_students' => User::where('user_type', 'special')->whereNotNull('user_group_id')->count()
            ];

            return Inertia::render('Admin/Groups/Index', [
                'groups' => $groups,
                'stats' => $stats,
                'filters' => $request->only(['search', 'status'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching groups: ' . $e->getMessage());
            
            return Inertia::render('Admin/Groups/Index', [
                'groups' => collect([]),
                'stats' => [
                    'total_groups' => 0,
                    'active_groups' => 0,
                    'inactive_groups' => 0,
                    'total_members' => 0,
                    'special_students' => 0
                ],
                'filters' => $request->only(['search', 'status'])
            ]);
        }
    }

    /**
     * Show the form for creating a new group
     */
    public function create()
    {
        $courses = Course::where('status', 'published')->get(['id', 'title', 'thumbnail']);
        
        return Inertia::render('Admin/Groups/Form', [
            'courses' => $courses
        ]);
    }

    /**
     * Store a newly created group
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:user_groups,name',
            'code' => 'required|string|max:50|unique:user_groups,code',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'assigned_courses' => 'nullable|array',
            'assigned_courses.*' => 'exists:courses,id'
        ]);

        try {
            DB::beginTransaction();

            $group = UserGroup::create([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true
            ]);

            // Assign courses if provided
            if (!empty($validated['assigned_courses'])) {
                $courseData = [];
                foreach ($validated['assigned_courses'] as $courseId) {
                    $courseData[$courseId] = [
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
                $group->assignedCourses()->attach($courseData);
            }

            DB::commit();

            return redirect()->route('admin.groups.index')->with('success', 'Group created successfully');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating group: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to create group. Please try again.');
        }
    }

    /**
     * Display the specified group
     */
    public function show(UserGroup $group)
    {
        try {
            $group->load([
                'users.roles',
                'specialStudents.enrollments.course',
                'subAdmins',
                'assignedCourses'
            ]);

            // Get detailed member statistics
            $members = $group->users()->with(['roles', 'enrollments'])->get();
            $specialStudents = $group->specialStudents()->with(['enrollments.course', 'certificates'])->get();
            $subAdmins = $group->subAdmins()->get();

            // Calculate detailed stats
            $memberStats = [
                'total_members' => $members->count(),
                'active_members' => $members->where('is_active', true)->count(),
                'special_students' => $specialStudents->count(),
                'sub_admins' => $subAdmins->count(),
            ];

            // Calculate learning progress for special students
            $learningStats = [
                'total_enrollments' => 0,
                'completed_courses' => 0,
                'in_progress_courses' => 0,
                'total_certificates' => 0,
                'average_progress' => 0
            ];

            // Collect all courses from special students' enrollments
            $enrolledCourses = collect();
            $courseEnrollmentStats = [];

            if ($specialStudents->isNotEmpty()) {
                $totalProgress = 0;
                $enrollmentCount = 0;

                foreach ($specialStudents as $student) {
                    $enrollments = $student->enrollments;
                    $learningStats['total_enrollments'] += $enrollments->count();
                    $learningStats['completed_courses'] += $enrollments->where('status', 'completed')->count();
                    $learningStats['in_progress_courses'] += $enrollments->where('status', 'active')->count();
                    $learningStats['total_certificates'] += $student->certificates->count();

                    foreach ($enrollments as $enrollment) {
                        $totalProgress += $enrollment->progress_percentage ?? 0;
                        $enrollmentCount++;

                        // Collect course data with enrollment info
                        if ($enrollment->course) {
                            $courseId = $enrollment->course->id;
                            if (!isset($courseEnrollmentStats[$courseId])) {
                                $courseEnrollmentStats[$courseId] = [
                                    'course' => $enrollment->course,
                                    'total_enrolled' => 0,
                                    'completed' => 0,
                                    'in_progress' => 0,
                                    'total_progress' => 0,
                                ];
                            }
                            $courseEnrollmentStats[$courseId]['total_enrolled']++;
                            if ($enrollment->status === 'completed') {
                                $courseEnrollmentStats[$courseId]['completed']++;
                            } elseif ($enrollment->status === 'active') {
                                $courseEnrollmentStats[$courseId]['in_progress']++;
                            }
                            $courseEnrollmentStats[$courseId]['total_progress'] += $enrollment->progress_percentage ?? 0;
                        }
                    }
                }

                if ($enrollmentCount > 0) {
                    $learningStats['average_progress'] = round($totalProgress / $enrollmentCount, 1);
                }

                // Build enrolled courses list with stats
                foreach ($courseEnrollmentStats as $courseId => $stats) {
                    $course = $stats['course'];
                    $course->enrollment_stats = [
                        'total_enrolled' => $stats['total_enrolled'],
                        'completed' => $stats['completed'],
                        'in_progress' => $stats['in_progress'],
                        'average_progress' => $stats['total_enrolled'] > 0
                            ? round($stats['total_progress'] / $stats['total_enrolled'], 1)
                            : 0,
                    ];
                    $enrolledCourses->push($course);
                }
            }

            // Add total unique courses count to learningStats
            $learningStats['total_courses'] = $enrolledCourses->count();

            return Inertia::render('Admin/Groups/Show', [
                'group' => $group,
                'members' => $members,
                'specialStudents' => $specialStudents,
                'subAdmins' => $subAdmins,
                'memberStats' => $memberStats,
                'learningStats' => $learningStats,
                'enrolledCourses' => $enrolledCourses->values()
            ]);

        } catch (\Exception $e) {
            Log::error('Error showing group details: ' . $e->getMessage());
            return redirect()->route('admin.groups.index')->with('error', 'Failed to load group details');
        }
    }

    /**
     * Show the form for editing the specified group
     */
    public function edit(UserGroup $group)
    {
        try {
            $group->load('assignedCourses');
            $courses = Course::where('status', 'published')->get(['id', 'title', 'thumbnail']);
            
            // Get assigned course IDs
            $assignedCourseIds = $group->assignedCourses->pluck('id')->toArray();
            $group->assigned_courses = $assignedCourseIds;
            $group->status = $group->is_active ? 'active' : 'inactive';

            return Inertia::render('Admin/Groups/Form', [
                'group' => $group,
                'courses' => $courses
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading group edit form: ' . $e->getMessage());
            return redirect()->route('admin.groups.index')->with('error', 'Failed to load group edit form');
        }
    }

    /**
     * Update the specified group
     */
    public function update(Request $request, UserGroup $group)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:user_groups,name,' . $group->id,
            'code' => 'required|string|max:50|unique:user_groups,code,' . $group->id,
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive',
            'assigned_courses' => 'nullable|array',
            'assigned_courses.*' => 'exists:courses,id'
        ]);

        try {
            DB::beginTransaction();

            $group->update([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['status'] === 'active'
            ]);

            // Update assigned courses
            $group->assignedCourses()->detach();
            if (!empty($validated['assigned_courses'])) {
                $courseData = [];
                foreach ($validated['assigned_courses'] as $courseId) {
                    $courseData[$courseId] = [
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }
                $group->assignedCourses()->attach($courseData);
            }

            DB::commit();

            return redirect()->route('admin.groups.index')->with('success', 'Group updated successfully');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error updating group: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to update group. Please try again.');
        }
    }

    /**
     * Remove the specified group
     */
    public function destroy(UserGroup $group)
    {
        try {
            DB::beginTransaction();

            $groupName = $group->name;

            // Check if group has members
            $memberCount = $group->users()->count();
            if ($memberCount > 0) {
                return redirect()->back()->with('error', "Cannot delete group '{$groupName}' because it has {$memberCount} members. Please reassign or remove members first.");
            }

            // Remove course assignments
            $group->assignedCourses()->detach();

            // Delete the group
            $group->delete();

            DB::commit();

            return redirect()->route('admin.groups.index')->with('success', "Group '{$groupName}' deleted successfully");
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error deleting group: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete group. Please try again.');
        }
    }

    /**
     * Get groups for dropdown/select (API endpoint)
     */
    public function getGroups(Request $request)
    {
        try {
            $groups = UserGroup::where('is_active', true)
                              ->orderBy('name')
                              ->get(['id', 'name', 'code', 'description']);

            return response()->json([
                'success' => true,
                'groups' => $groups
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching groups: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch groups'
            ], 500);
        }
    }

    /**
     * Bulk actions for groups
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'group_ids' => 'required|array',
            'group_ids.*' => 'exists:user_groups,id'
        ]);

        try {
            DB::beginTransaction();

            $groups = UserGroup::whereIn('id', $validated['group_ids'])->get();
            $count = $groups->count();

            switch ($validated['action']) {
                case 'activate':
                    UserGroup::whereIn('id', $validated['group_ids'])->update(['is_active' => true]);
                    $message = "{$count} groups activated successfully";
                    break;

                case 'deactivate':
                    UserGroup::whereIn('id', $validated['group_ids'])->update(['is_active' => false]);
                    $message = "{$count} groups deactivated successfully";
                    break;

                case 'delete':
                    // Check if any groups have members
                    $groupsWithMembers = [];
                    foreach ($groups as $group) {
                        if ($group->users()->count() > 0) {
                            $groupsWithMembers[] = $group->name;
                        }
                    }

                    if (!empty($groupsWithMembers)) {
                        DB::rollback();
                        return redirect()->back()->with('error', 'Cannot delete groups with members: ' . implode(', ', $groupsWithMembers));
                    }

                    // Remove course assignments and delete
                    foreach ($groups as $group) {
                        $group->assignedCourses()->detach();
                        $group->delete();
                    }
                    $message = "{$count} groups deleted successfully";
                    break;
            }

            DB::commit();

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error performing bulk action: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to perform bulk action. Please try again.');
        }
    }
}
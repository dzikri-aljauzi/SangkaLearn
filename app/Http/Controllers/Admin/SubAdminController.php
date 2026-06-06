<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\UserGroup;
use App\Models\Enrollment;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubAdminController extends Controller
{
    /**
     * Display a listing of sub admins
     */
    public function index(Request $request)
    {
        try {
            $query = User::with(['roles', 'userGroup', 'assignedStudents']);
            
            // Filter sub admins using join
            $query->join('user_roles', 'users.id', '=', 'user_roles.user_id')
                  ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                  ->where('roles.name', 'sub_admin')
                  ->select('users.*');

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('users.first_name', 'like', "%{$search}%")
                      ->orWhere('users.last_name', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            }

            if ($request->has('status') && !empty($request->status)) {
                $query->where('users.is_active', $request->status === 'active');
            }

            $subAdmins = $query->latest('users.created_at')->paginate(15);
            
            // Add computed fields for each sub admin
            $subAdmins->getCollection()->transform(function ($subAdmin) {
                try {
                    // Get assigned students count
                    $subAdmin->assigned_students_count = User::where('assigned_sub_admin_id', $subAdmin->id)
                                                            ->where('user_type', 'special')
                                                            ->count();
                    
                    // Get user group info if exists
                    if ($subAdmin->user_group_id) {
                        $subAdmin->load('userGroup');
                    }
                    
                    // Calculate students progress summary
                    $studentsProgress = User::where('assigned_sub_admin_id', $subAdmin->id)
                                          ->where('user_type', 'special')
                                          ->with('enrollments')
                                          ->get();
                    
                    $totalEnrollments = 0;
                    $completedEnrollments = 0;
                    
                    foreach ($studentsProgress as $student) {
                        $totalEnrollments += $student->enrollments->count();
                        $completedEnrollments += $student->enrollments->where('status', 'completed')->count();
                    }
                    
                    $subAdmin->students_progress = [
                        'total_enrollments' => $totalEnrollments,
                        'completed_enrollments' => $completedEnrollments,
                        'completion_rate' => $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 1) : 0
                    ];
                    
                    $subAdmin->status = $subAdmin->is_active ? 'active' : 'inactive';
                } catch (\Exception $e) {
                    // Fallback data
                    $subAdmin->assigned_students_count = 0;
                    $subAdmin->students_progress = [
                        'total_enrollments' => 0,
                        'completed_enrollments' => 0,
                        'completion_rate' => 0
                    ];
                    $subAdmin->status = $subAdmin->is_active ? 'active' : 'inactive';
                }
                
                return $subAdmin;
            });
            
            // Calculate stats
            $totalSubAdmins = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                                 ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                                 ->where('roles.name', 'sub_admin')
                                 ->count();
            
            $activeSubAdmins = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                                  ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                                  ->where('roles.name', 'sub_admin')
                                  ->where('users.is_active', true)
                                  ->count();

            $stats = [
                'total_sub_admins' => $totalSubAdmins,
                'active_sub_admins' => $activeSubAdmins,
                'inactive_sub_admins' => $totalSubAdmins - $activeSubAdmins,
                'total_assigned_students' => User::where('user_type', 'special')
                                                ->whereNotNull('assigned_sub_admin_id')
                                                ->count(),
            ];

            return Inertia::render('Admin/SubAdmins/Index', [
                'subAdmins' => $subAdmins,
                'stats' => $stats,
                'filters' => $request->only(['search', 'status'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching sub admins: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            // Return empty pagination object instead of collection
            return Inertia::render('Admin/SubAdmins/Index', [
                'subAdmins' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15),
                'stats' => [
                    'total_sub_admins' => 0,
                    'active_sub_admins' => 0,
                    'inactive_sub_admins' => 0,
                    'total_assigned_students' => 0,
                ],
                'filters' => $request->only(['search', 'status'])
            ]);
        }
    }

    /**
     * Show the form for creating a new sub admin
     */
    public function create()
    {
        $userGroups = UserGroup::where('is_active', true)->get();
        
        return Inertia::render('Admin/SubAdmins/Form', [
            'userGroups' => $userGroups
        ]);
    }

    /**
     * Store a newly created sub admin
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'date_of_birth' => 'nullable|date|before:today',
            'bio' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
            'user_group_id' => 'nullable|exists:user_groups,id'
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => bcrypt($validated['password']),
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'city' => $validated['city'] ?? null,
                'country' => $validated['country'] ?? null,
                'address' => $validated['address'] ?? null,
                'is_active' => $validated['status'] === 'active',
                'email_verified_at' => now(),
                'user_type' => 'general', // Sub admins are general type
                'user_group_id' => $validated['user_group_id'] ?? null,
            ]);

            // Assign sub_admin role
            $role = Role::where('name', 'sub_admin')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            DB::commit();

            return redirect()->route('admin.sub-admins.index')->with('success', 'Sub Admin created successfully');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating sub admin: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to create Sub Admin. Please try again.');
        }
    }

    /**
     * Display the specified sub admin
     */
    public function show(User $subAdmin)
    {
        try {
            // Load relationships
            $subAdmin->load(['roles', 'userGroup', 'assignedStudents.enrollments.course', 'assignedStudents.certificates']);
            
            // Check if user is actually a sub admin
            $isSubAdmin = $subAdmin->roles->where('name', 'sub_admin')->isNotEmpty();
            if (!$isSubAdmin) {
                return redirect()->route('admin.sub-admins.index')->with('error', 'User is not a sub admin');
            }

            // Get assigned students with detailed progress
            $assignedStudents = User::where('assigned_sub_admin_id', $subAdmin->id)
                ->where('user_type', 'special')
                ->with(['enrollments.course', 'certificates', 'userGroup'])
                ->get()
                ->map(function($student) {
                    $student->enrolled_courses_count = $student->enrollments->count();
                    $student->completed_courses_count = $student->enrollments->where('status', 'completed')->count();
                    $student->certificates_count = $student->certificates->count();
                    $student->average_progress = $student->enrollments->avg('progress_percentage') ?? 0;
                    
                    return $student;
                });

            // Calculate summary stats
            $stats = [
                'total_students' => $assignedStudents->count(),
                'active_students' => $assignedStudents->where('is_active', true)->count(),
                'total_enrollments' => $assignedStudents->sum('enrolled_courses_count'),
                'completed_courses' => $assignedStudents->sum('completed_courses_count'),
                'total_certificates' => $assignedStudents->sum('certificates_count'),
                'average_progress' => $assignedStudents->avg('average_progress'),
            ];

            return Inertia::render('Admin/SubAdmins/Show', [
                'subAdmin' => $subAdmin,
                'assignedStudents' => $assignedStudents,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error showing sub admin details: ' . $e->getMessage());
            return redirect()->route('admin.sub-admins.index')->with('error', 'Failed to load sub admin details');
        }
    }

    /**
     * Show the form for editing the specified sub admin
     */
    public function edit(User $subAdmin)
    {
        try {
            $subAdmin->load(['roles', 'userGroup']);
            
            $isSubAdmin = $subAdmin->roles->where('name', 'sub_admin')->isNotEmpty();
            if (!$isSubAdmin) {
                return redirect()->route('admin.sub-admins.index')->with('error', 'User is not a sub admin');
            }

            $subAdmin->status = $subAdmin->is_active ? 'active' : 'inactive';
            $userGroups = UserGroup::where('is_active', true)->get();

            return Inertia::render('Admin/SubAdmins/Form', [
                'subAdmin' => $subAdmin,
                'userGroups' => $userGroups
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading sub admin edit form: ' . $e->getMessage());
            return redirect()->route('admin.sub-admins.index')->with('error', 'Failed to load sub admin edit form');
        }
    }

    /**
     * Update the specified sub admin
     */
    public function update(Request $request, User $subAdmin)
    {
        $subAdmin->load('roles');
        $isSubAdmin = $subAdmin->roles->where('name', 'sub_admin')->isNotEmpty();
        if (!$isSubAdmin) {
            return redirect()->route('admin.sub-admins.index')->with('error', 'User is not a sub admin');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $subAdmin->id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'bio' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
            'user_group_id' => 'nullable|exists:user_groups,id'
        ]);

        try {
            $subAdmin->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'city' => $validated['city'] ?? null,
                'country' => $validated['country'] ?? null,
                'address' => $validated['address'] ?? null,
                'is_active' => $validated['status'] === 'active',
                'user_group_id' => $validated['user_group_id'] ?? null,
            ]);

            return redirect()->route('admin.sub-admins.index')->with('success', 'Sub Admin updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating sub admin: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to update Sub Admin. Please try again.');
        }
    }

    /**
     * Remove the specified sub admin
     */
    public function destroy(User $subAdmin)
    {
        try {
            $subAdmin->load('roles');
            $isSubAdmin = $subAdmin->roles->where('name', 'sub_admin')->isNotEmpty();
            if (!$isSubAdmin) {
                return redirect()->route('admin.sub-admins.index')->with('error', 'User is not a sub admin');
            }

            DB::beginTransaction();

            $subAdminName = $subAdmin->first_name . ' ' . $subAdmin->last_name;

            // Remove assignments from students
            User::where('assigned_sub_admin_id', $subAdmin->id)->update(['assigned_sub_admin_id' => null]);

            // Soft delete
            $subAdmin->delete();

            DB::commit();

            return redirect()->route('admin.sub-admins.index')->with('success', "Sub Admin {$subAdminName} deleted successfully");
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error deleting sub admin: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete Sub Admin. Please try again.');
        }
    }

    /**
     * Store a new user group
     */
    public function storeGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:user_groups,name',
            'code' => 'required|string|max:50|unique:user_groups,code',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean'
        ]);

        try {
            $userGroup = UserGroup::create([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Group created successfully',
                'group' => $userGroup
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating user group: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create group. Please try again.'
            ], 500);
        }
    }

    /**
     * Get user groups for dropdown
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
            Log::error('Error fetching user groups: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch groups'
            ], 500);
        }
    }
}

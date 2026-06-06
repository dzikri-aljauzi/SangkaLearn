<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\Enrollment;

class InstructorController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        
        // Load roles relationship if not already loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        // Get instructor's courses
        $courses = Course::where('instructor_id', $user->id)
            ->withCount('enrollments')
            ->latest()
            ->take(5)
            ->get();

        // Calculate stats
        $stats = [
            'total_courses' => Course::where('instructor_id', $user->id)->count(),
            'total_students' => Enrollment::whereHas('course', function($query) use ($user) {
                $query->where('instructor_id', $user->id);
            })->distinct('user_id')->count(),
            'total_revenue' => 0, // Will be implemented later
            'avg_rating' => 4.8, // Placeholder
        ];

        return Inertia::render('Instructor/Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'courses' => $courses,
        ]);
    }

    public function courses()
    {
        $user = Auth::user();
        
        $courses = Course::where('instructor_id', $user->id)
            ->withCount('enrollments')
            ->paginate(12);

        return Inertia::render('Instructor/Courses', [
            'courses' => $courses,
        ]);
    }

    public function createCourse()
    {
        return Inertia::render('Instructor/CreateCourse');
    }

    public function storeCourse(Request $request)
    {
        // Will be implemented later
        return redirect()->route('instructor.courses');
    }

    public function editCourse(Course $course)
    {
        return Inertia::render('Instructor/EditCourse', [
            'course' => $course,
        ]);
    }

    public function updateCourse(Request $request, Course $course)
    {
        // Will be implemented later
        return redirect()->route('instructor.courses');
    }

    public function destroyCourse(Course $course)
    {
        // Will be implemented later
        return redirect()->route('instructor.courses');
    }

    public function lessons(Course $course)
    {
        return Inertia::render('Instructor/Lessons', [
            'course' => $course,
        ]);
    }

    public function quizzes(Course $course)
    {
        return Inertia::render('Instructor/Quizzes', [
            'course' => $course,
        ]);
    }

    public function assignments(Course $course)
    {
        return Inertia::render('Instructor/Assignments', [
            'course' => $course,
        ]);
    }

    public function analytics()
    {
        return Inertia::render('Instructor/Analytics');
    }

    public function students()
    {
        return Inertia::render('Instructor/Students');
    }
}

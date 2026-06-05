<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function admin()
    {
        $analytics = [
            'total_users' => User::count(),
            'total_courses' => Course::count(),
            'total_enrollments' => Enrollment::count(),
            'active_users_today' => User::whereDate('last_login_at', Carbon::today())->count(),
            'new_users_this_month' => User::whereMonth('created_at', Carbon::now()->month)->count(),
            'courses_this_month' => Course::whereMonth('created_at', Carbon::now()->month)->count(),
            'enrollments_this_month' => Enrollment::whereMonth('created_at', Carbon::now()->month)->count(),
            'revenue_this_month' => 0, // You can implement revenue calculation based on your payment system
            'user_growth' => $this->getUserGrowthData(),
            'course_popularity' => $this->getCoursePopularityData(),
            'enrollment_trends' => $this->getEnrollmentTrendsData(),
        ];

        return Inertia::render('Admin/Analytics', [
            'analytics' => $analytics
        ]);
    }

    public function dashboard()
    {
        return $this->admin(); // Use the same data for now
    }

    private function getUserGrowthData()
    {
        $months = [];
        $userCounts = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');
            $userCounts[] = User::whereYear('created_at', $date->year)
                                ->whereMonth('created_at', $date->month)
                                ->count();
        }

        return [
            'labels' => $months,
            'data' => $userCounts
        ];
    }

    private function getCoursePopularityData()
    {
        $courses = Course::withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($course) {
                return [
                    'name' => $course->title,
                    'enrollments' => $course->enrollments_count
                ];
            });

        return $courses->toArray();
    }

    private function getEnrollmentTrendsData()
    {
        $months = [];
        $enrollmentCounts = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');
            $enrollmentCounts[] = Enrollment::whereYear('created_at', $date->year)
                                          ->whereMonth('created_at', $date->month)
                                          ->count();
        }

        return [
            'labels' => $months,
            'data' => $enrollmentCounts
        ];
    }
}

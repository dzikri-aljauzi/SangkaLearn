<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Load roles relationship if not already loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        // Redirect based on user role
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->hasRole('sub_admin')) {
            return redirect()->route('subadmin.dashboard');
        }

        if ($user->hasRole('instructor')) {
            return redirect()->route('instructor.dashboard');
        }

        if ($user->hasRole('student')) {
            return redirect()->route('student.dashboard');
        }

        // Default dashboard for users without specific roles
        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => [
                'courses_enrolled' => 0,
                'courses_completed' => 0,
                'certificates_earned' => 0,
                'total_learning_time' => 0,
            ]
        ]);
    }
}
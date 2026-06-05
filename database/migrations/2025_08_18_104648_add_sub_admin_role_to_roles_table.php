<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add sub_admin role to roles table
        Role::create([
            'name' => 'sub_admin',
            'display_name' => 'Sub Administrator',
            'description' => 'Sub administrator role for managing specific student groups',
            'permissions' => [
                'view_assigned_students',
                'track_student_progress',
                'view_student_analytics',
                'generate_student_reports',
                'communicate_with_students'
            ],
            'is_active' => true,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Role::where('name', 'sub_admin')->delete();
    }
};

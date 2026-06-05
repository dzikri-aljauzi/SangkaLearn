<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'System administration access with full permissions',
                'permissions' => [
                    // User Management
                    'manage_users', 'create_users', 'edit_users', 'delete_users', 'view_users',
                    
                    // Course Management
                    'manage_courses', 'create_courses', 'edit_courses', 'delete_courses', 'view_courses',
                    'approve_courses', 'reject_courses',
                    
                    // Payment & Finance
                    'manage_payments', 'view_payments', 'process_refunds', 'manage_coupons',
                    'view_revenue', 'manage_payouts',
                    
                    // System Settings
                    'manage_settings', 'manage_categories', 'manage_announcements',
                    'manage_roles', 'manage_permissions',
                    
                    // Analytics & Reports
                    'view_analytics', 'view_reports', 'export_data',
                    
                    // Content Moderation
                    'moderate_reviews', 'moderate_forum', 'manage_certificates',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'instructor',
                'display_name' => 'Instructor',
                'description' => 'Can create and manage courses, interact with students',
                'permissions' => [
                    // Course Creation & Management
                    'create_courses', 'manage_own_courses', 'edit_own_courses', 'delete_own_courses',
                    'manage_course_content', 'manage_lessons', 'manage_quizzes', 'manage_assignments',
                    
                    // Student Interaction
                    'view_students', 'view_enrollments', 'grade_assignments', 'grade_quizzes',
                    'communicate_students', 'view_student_progress',
                    
                    // Forum & Communication
                    'manage_course_forum', 'create_announcements', 'reply_forum',
                    
                    // Analytics
                    'view_course_analytics', 'view_student_analytics', 'export_course_data',
                    
                    // Revenue
                    'view_own_revenue', 'request_payout',
                    
                    // Certificates
                    'issue_certificates', 'manage_certificates',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'student',
                'display_name' => 'Student',
                'description' => 'Can enroll in courses, participate in learning activities',
                'permissions' => [
                    // Course Access
                    'enroll_courses', 'view_enrolled_courses', 'access_course_content',
                    'view_lessons', 'complete_lessons',
                    
                    // Assessments
                    'take_quizzes', 'submit_assignments', 'view_grades', 'retake_quizzes',
                    
                    // Forum & Communication
                    'participate_forum', 'create_topics', 'reply_posts', 'like_posts',
                    
                    // Progress & Certificates
                    'view_progress', 'view_certificates', 'download_certificates',
                    
                    // Reviews & Ratings
                    'write_reviews', 'rate_courses', 'edit_own_reviews',
                    
                    // Profile & Settings
                    'manage_profile', 'view_learning_history', 'manage_notifications',
                    
                    // Shopping
                    'add_to_cart', 'make_purchases', 'view_orders', 'request_refunds',
                    
                    // Wishlist
                    'manage_wishlist', 'share_courses',
                ],
                'is_active' => true,
            ]
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name']], 
                $roleData
            );
        }

        $this->command->info('Roles created successfully:');
        $this->command->info('- Admin: Full system access');
        $this->command->info('- Instructor: Course creation and management');
        $this->command->info('- Student: Learning and participation');
    }
}
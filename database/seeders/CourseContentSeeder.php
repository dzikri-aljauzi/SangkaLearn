<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use App\Models\Assignment;

class CourseContentSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get the first course
        $course = Course::first();
        
        if (!$course) {
            $this->command->error('No course found. Please create a course first.');
            return;
        }

        // Create sample sections
        $section1 = CourseSection::firstOrCreate([
            'course_id' => $course->id,
            'title' => 'Introduction to Laravel'
        ], [
            'description' => 'Basic concepts and setup',
            'sort_order' => 1,
            'is_published' => true
        ]);

        $section2 = CourseSection::firstOrCreate([
            'course_id' => $course->id,
            'title' => 'Laravel Fundamentals'
        ], [
            'description' => 'Core Laravel features and components',
            'sort_order' => 2,
            'is_published' => true
        ]);

        $section3 = CourseSection::firstOrCreate([
            'course_id' => $course->id,
            'title' => 'Advanced Topics'
        ], [
            'description' => 'Advanced Laravel concepts and best practices',
            'sort_order' => 3,
            'is_published' => true
        ]);

        // Create sample lessons for section 1
        Lesson::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section1->id,
            'title' => 'What is Laravel?'
        ], [
            'description' => 'Introduction to Laravel framework',
            'content' => 'Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling.',
            'type' => 'text',
            'sort_order' => 1,
            'is_published' => true,
            'is_preview' => true
        ]);

        Lesson::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section1->id,
            'title' => 'Laravel Installation'
        ], [
            'description' => 'How to install Laravel',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=BXiHvZPQ0oQ',
            'video_duration' => '15',
            'sort_order' => 2,
            'is_published' => true,
            'is_preview' => false
        ]);

        // Create sample lessons for section 2
        Lesson::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section2->id,
            'title' => 'Routing Basics'
        ], [
            'description' => 'Understanding Laravel routes',
            'content' => 'Laravel routes are defined in the routes/web.php file. Basic routing is simple and intuitive.',
            'type' => 'text',
            'sort_order' => 1,
            'is_published' => true,
            'is_preview' => false
        ]);

        Lesson::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section2->id,
            'title' => 'Controllers Introduction'
        ], [
            'description' => 'Working with Laravel controllers',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=E3VG-dLCRUk',
            'video_duration' => '20',
            'sort_order' => 2,
            'is_published' => true,
            'is_preview' => false
        ]);

        // Create sample assignment
        Assignment::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section2->id,
            'title' => 'Create Your First Laravel Route'
        ], [
            'description' => 'Create a simple route that returns a view with your name',
            'instructions' => '1. Create a new route in routes/web.php
2. Create a corresponding view file
3. Make sure the route displays your name
4. Take a screenshot of the working route
5. Submit your code and screenshot',
            'max_points' => 100,
            'due_date' => now()->addDays(7),
            'allow_late_submission' => true,
            'late_penalty_percent' => 10,
            'submission_types' => json_encode(['file']),
            'sort_order' => 1,
            'is_published' => true
        ]);

        // Create sample lessons for section 3
        Lesson::firstOrCreate([
            'course_id' => $course->id,
            'section_id' => $section3->id,
            'title' => 'Eloquent ORM'
        ], [
            'description' => 'Advanced database operations with Eloquent',
            'content' => 'Eloquent ORM provides a beautiful, simple ActiveRecord implementation for working with your database.',
            'type' => 'text',
            'sort_order' => 1,
            'is_published' => true,
            'is_preview' => false
        ]);

        $this->command->info('Course content seeded successfully!');
        $this->command->info("Course: {$course->title}");
        $this->command->info("Sections: 3");
        $this->command->info("Lessons: 5");
        $this->command->info("Assignments: 1");
    }
}
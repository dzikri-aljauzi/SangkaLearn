<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Category;
use App\Models\User;
use App\Models\CourseType;
use Illuminate\Support\Str;

class DemoCourseSeeder extends Seeder
{
    public function run()
    {
        // Force delete all existing courses (including soft deleted)
        Course::withTrashed()->forceDelete();
        echo "✓ Force deleted all existing courses (including soft deleted)\n";

        // Get instructor
        $instructors = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
                          ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                          ->where('roles.name', 'instructor')
                          ->select('users.*')
                          ->get();

        if ($instructors->isEmpty()) {
            echo "✗ No instructors found! Please create at least one instructor first.\n";
            return;
        }

        // Get or create categories
        $categories = [
            Category::firstOrCreate(
                ['slug' => 'risk-management'],
                ['name' => 'Risk Management', 'description' => 'Enterprise Risk Management and Compliance', 'is_active' => true]
            ),
            Category::firstOrCreate(
                ['slug' => 'digital-technology'],
                ['name' => 'Digital Technology', 'description' => 'Modern Digital Technology and Development', 'is_active' => true]
            ),
            Category::firstOrCreate(
                ['slug' => 'finance'],
                ['name' => 'Finance', 'description' => 'Financial Management and Analysis', 'is_active' => true]
            ),
            Category::firstOrCreate(
                ['slug' => 'business'],
                ['name' => 'Business', 'description' => 'Business Strategy and Management', 'is_active' => true]
            ),
            Category::firstOrCreate(
                ['slug' => 'certification'],
                ['name' => 'Certification', 'description' => 'Professional Certification Programs', 'is_active' => true]
            ),
        ];

        echo "✓ Categories ready\n";

        // Get all children course types with their parents
        $courseTypes = CourseType::whereNotNull('parent_id')
                                 ->with('parent')
                                 ->orderBy('parent_id')
                                 ->orderBy('order')
                                 ->get();

        if ($courseTypes->isEmpty()) {
            echo "✗ No course types found! Please run CourseTypeSeeder first.\n";
            return;
        }

        echo "✓ Found {$courseTypes->count()} course types\n";

        // Course data templates
        $courses = [];
        $levels = ['beginner', 'intermediate', 'advanced'];
        $deliveryMethods = ['hybrid', 'online_recording', 'zoom_interactive'];
        $languages = ['id', 'en', 'both'];

        // Generate 1 course per course type
        foreach ($courseTypes as $index => $courseType) {
            $instructor = $instructors->random();
            $category = $categories[array_rand($categories)];
            $level = $levels[array_rand($levels)];
            $deliveryMethod = $deliveryMethods[array_rand($deliveryMethods)];
            $language = $languages[array_rand($languages)];

            // Random price between 500k - 5jt
            $price = rand(5, 50) * 100000; // 500k, 600k, ... 5jt

            // 80% published, 20% draft
            $status = (rand(1, 100) <= 80) ? 'published' : 'draft';

            // 70% permanent, 30% periode
            $isPermanent = (rand(1, 100) <= 70);

            // Generate title from course type name
            $title = $courseType->name;

            // Generate slug
            $slug = Str::slug($title);

            // Make sure slug is unique
            $originalSlug = $slug;
            $counter = 1;
            while (Course::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Generate subtitle based on parent
            $subtitle = "Pelatihan " . $courseType->parent->name;

            // Generate description
            $description = "Program pelatihan komprehensif untuk {$title}. ";
            $description .= "Pelatihan ini dirancang untuk memberikan pemahaman mendalam tentang konsep dan praktik terbaik dalam bidang ini. ";
            $description .= "Peserta akan mendapatkan sertifikat setelah menyelesaikan seluruh materi dan assessment.";

            // Learning objectives
            $learningObjectives = [
                "Memahami konsep dasar dan fundamental",
                "Menguasai teknik dan metodologi yang relevan",
                "Mampu mengimplementasikan best practices",
                "Mengembangkan skill praktis yang dapat diterapkan langsung"
            ];

            // Requirements
            $requirements = [
                "Memiliki latar belakang pendidikan minimal S1",
                "Memiliki pengalaman kerja di bidang terkait (diutamakan)",
                "Komitmen untuk mengikuti seluruh sesi pelatihan"
            ];

            // Target audience
            $targetAudience = [
                "Profesional yang ingin meningkatkan kompetensi",
                "Manajer dan supervisor",
                "Individu yang ingin mendapatkan sertifikasi profesional"
            ];

            // Duration: random between 20-80 hours
            $duration = rand(20, 80);

            // Certificate title
            $certificateTitle = "Certified " . str_replace(['Pelatihan Umum - ', 'Pelatihan Teknologi - ', 'Sertifikat LSP BNSP - ', 'Sertifikat SangkaLearn - '], '', $courseType->name);

            $courseData = [
                'title' => $title,
                'slug' => $slug,
                'subtitle' => $subtitle,
                'description' => $description,
                'learning_objectives' => json_encode($learningObjectives),
                'requirements' => json_encode($requirements),
                'target_audience' => json_encode($targetAudience),
                'instructor_id' => $instructor->id,
                'category_id' => $category->id,
                'level' => $level,
                'language' => $language,
                'duration_hours' => $duration,
                'price' => $price,
                'is_free' => false,
                'status' => $status,
                'access_type' => 'public',
                'is_featured' => ($index < 5), // First 5 are featured
                'published_at' => $status === 'published' ? now()->subDays(rand(1, 30)) : null,
                'has_certificate' => true,

                // Training Fields
                'course_type_id' => $courseType->id,
                'is_permanent' => $isPermanent,
                'period_start' => $isPermanent ? null : now()->addDays(rand(1, 30)),
                'period_end' => $isPermanent ? null : now()->addDays(rand(60, 180)),
                'registration_deadline' => $isPermanent ? null : now()->addDays(rand(1, 25)),
                'auto_archive' => $isPermanent ? false : (rand(1, 100) <= 50),
                'certificate_title' => $certificateTitle,
                'delivery_method' => $deliveryMethod,
                'zoom_link' => in_array($deliveryMethod, ['hybrid', 'zoom_interactive']) ? 'https://zoom.us/j/' . rand(1000000000, 9999999999) : null,
                'zoom_schedule' => in_array($deliveryMethod, ['hybrid', 'zoom_interactive']) ? now()->addDays(rand(7, 60))->format('Y-m-d H:i:s') : null,
                'zoom_notes' => in_array($deliveryMethod, ['hybrid', 'zoom_interactive']) ? 'Harap bergabung 10 menit sebelum sesi dimulai. Link akan aktif 30 menit sebelum jadwal.' : null,
            ];

            $courses[] = $courseData;
        }

        // Insert all courses
        foreach ($courses as $index => $courseData) {
            try {
                Course::create($courseData);
                echo "✓ Created course " . ($index + 1) . ": {$courseData['title']}\n";
            } catch (\Exception $e) {
                echo "✗ Failed to create course {$courseData['title']}: " . $e->getMessage() . "\n";
            }
        }

        echo "\n";
        echo "========================================\n";
        echo "✓ DEMO COURSES SEEDED SUCCESSFULLY!\n";
        echo "========================================\n";
        echo "Total courses created: " . count($courses) . "\n";
        echo "Published: " . Course::where('status', 'published')->count() . "\n";
        echo "Draft: " . Course::where('status', 'draft')->count() . "\n";
        echo "Featured: " . Course::where('is_featured', true)->count() . "\n";
        echo "========================================\n";
    }
}

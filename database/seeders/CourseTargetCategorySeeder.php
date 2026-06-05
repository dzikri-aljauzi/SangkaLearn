<?php

namespace Database\Seeders;

use App\Models\CourseTargetCategory;
use Illuminate\Database\Seeder;

class CourseTargetCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mahasiswa',
                'slug' => 'mahasiswa',
                'description' => 'Pelatihan untuk mahasiswa dan peserta individu',
                'icon' => 'academic-cap',
                'color' => '#3B82F6', // blue
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Pemerintah',
                'slug' => 'pemerintah',
                'description' => 'Pelatihan untuk instansi pemerintah',
                'icon' => 'building-library',
                'color' => '#10B981', // green
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Perusahaan',
                'slug' => 'perusahaan',
                'description' => 'Pelatihan untuk korporat dan perusahaan swasta',
                'icon' => 'building-office',
                'color' => '#8B5CF6', // purple
                'is_active' => true,
                'order' => 3,
            ],
        ];

        foreach ($categories as $category) {
            CourseTargetCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}

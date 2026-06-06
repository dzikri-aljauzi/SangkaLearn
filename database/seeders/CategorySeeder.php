<?php
// database/seeders/CategorySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Development',
                'slug' => 'development',
                'description' => 'Programming and software development courses',
                'icon' => 'code',
                'color' => '#3b82f6',
                'is_featured' => true,
                'children' => [
                    ['name' => 'Web Development', 'slug' => 'web-development'],
                    ['name' => 'Mobile Development', 'slug' => 'mobile-development'],
                    ['name' => 'Game Development', 'slug' => 'game-development'],
                    ['name' => 'DevOps', 'slug' => 'devops'],
                ]
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business and entrepreneurship courses',
                'icon' => 'briefcase',
                'color' => '#10b981',
                'is_featured' => true,
                'children' => [
                    ['name' => 'Entrepreneurship', 'slug' => 'entrepreneurship'],
                    ['name' => 'Management', 'slug' => 'management'],
                    ['name' => 'Marketing', 'slug' => 'marketing'],
                    ['name' => 'Finance', 'slug' => 'finance'],
                ]
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'description' => 'Design and creative courses',
                'icon' => 'palette',
                'color' => '#f59e0b',
                'is_featured' => true,
                'children' => [
                    ['name' => 'UI/UX Design', 'slug' => 'ui-ux-design'],
                    ['name' => 'Graphic Design', 'slug' => 'graphic-design'],
                    ['name' => '3D Design', 'slug' => '3d-design'],
                ]
            ],
            [
                'name' => 'Data Science',
                'slug' => 'data-science',
                'description' => 'Data science and analytics courses',
                'icon' => 'chart-bar',
                'color' => '#8b5cf6',
                'is_featured' => true,
                'children' => [
                    ['name' => 'Machine Learning', 'slug' => 'machine-learning'],
                    ['name' => 'Data Analysis', 'slug' => 'data-analysis'],
                    ['name' => 'Big Data', 'slug' => 'big-data'],
                ]
            ]
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);
            
            $category = Category::create($categoryData);
            
            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['description'] = $childData['description'] ?? '';
                Category::create($childData);
            }
        }
    }
}
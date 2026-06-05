<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialization;
use Illuminate\Support\Facades\DB;

class SpecializationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specializations = [
            [
                'name' => 'Web Development',
                'description' => 'Expertise in building web applications, frontend and backend development',
                'is_active' => true,
            ],
            [
                'name' => 'Mobile Development',
                'description' => 'Specialization in iOS, Android, and cross-platform mobile application development',
                'is_active' => true,
            ],
            [
                'name' => 'Data Science',
                'description' => 'Data analysis, machine learning, and statistical modeling',
                'is_active' => true,
            ],
            [
                'name' => 'UI/UX Design',
                'description' => 'User interface and user experience design principles and practices',
                'is_active' => true,
            ],
            [
                'name' => 'DevOps',
                'description' => 'Infrastructure management, CI/CD, cloud computing, and automation',
                'is_active' => true,
            ],
            [
                'name' => 'Cybersecurity',
                'description' => 'Information security, ethical hacking, and network security',
                'is_active' => true,
            ],
            [
                'name' => 'Cloud Computing',
                'description' => 'AWS, Azure, Google Cloud Platform expertise',
                'is_active' => true,
            ],
            [
                'name' => 'Artificial Intelligence',
                'description' => 'Machine learning, deep learning, neural networks',
                'is_active' => true,
            ],
            [
                'name' => 'Database Administration',
                'description' => 'SQL, NoSQL, database design and optimization',
                'is_active' => true,
            ],
            [
                'name' => 'Digital Marketing',
                'description' => 'SEO, SEM, social media marketing, content strategy',
                'is_active' => true,
            ],
            [
                'name' => 'Blockchain Development',
                'description' => 'Smart contracts, cryptocurrency, decentralized applications',
                'is_active' => true,
            ],
            [
                'name' => 'Game Development',
                'description' => 'Video game design and programming',
                'is_active' => true,
            ],
        ];

        foreach ($specializations as $specialization) {
            Specialization::firstOrCreate(
                ['name' => $specialization['name']],
                $specialization
            );
        }
    }
}

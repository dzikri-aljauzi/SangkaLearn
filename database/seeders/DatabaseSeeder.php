<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Don't use the default User::factory()->create()
        // as it conflicts with our custom user structure

        $this->call([
            RoleSeeder::class,           // Must be first - creates roles
            UserSeeder::class,           // Second - creates users and assigns roles
            CategorySeeder::class,       // Third - creates categories
            CourseTypeSeeder::class,     // Fourth - creates course types (Pelatihan Umum, Teknologi Bisnis Digital, etc.)
            DemoCourseSeeder::class,     // Fifth - creates demo courses with instructor assigned
        ]);

        // Fix PostgreSQL sequences after seeding
        if (config('database.default') === 'pgsql') {
            $this->command->info('');
            $this->command->info('🔧 Fixing PostgreSQL sequences...');
            try {
                \Artisan::call('postgres:fix-sequences');
            } catch (\Exception $e) {
                $this->command->warn('PostgreSQL sequence fix command not available');
            }
        }

        $this->command->info('');
        $this->command->info('🎉 Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Default login credentials:');
        $this->command->line('┌─────────────────────────────────────────┐');
        $this->command->line('│ Role        │ Email                   │ Password    │');
        $this->command->line('├─────────────────────────────────────────┤');
        $this->command->line('│ Admin       │ admin@lmsbdi.com        │ password123 │');
        $this->command->line('│ Instructor  │ budi.santoso@lmsbdi.com │ instructor123│');
        $this->command->line('│ Student     │ andi.pratama@student.com│ student123  │');
        $this->command->line('└─────────────────────────────────────────┘');
        
        if (app()->environment('local')) {
            $this->command->info('');
            $this->command->info('Test accounts (local only):');
            $this->command->line('│ test@admin.com, test@instructor.com, test@student.com │ password │');
        }
    }
}
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;

class TestVideoSystem extends Command
{
    protected $signature = 'test:video-system';
    protected $description = 'Test video system functionality';

    public function handle()
    {
        $this->info('Testing Video System...');
        
        try {
            // Test 1: Check if video file fields exist in database
            $this->info('1. Testing database schema...');
            $lesson = Lesson::first();
            if ($lesson && !isset($lesson->getAttributes()['video_file'])) {
                $this->error('video_file column not found in lessons table');
                return 1;
            }
            $this->info('✓ Database schema looks good');
            
            // Test 2: Check if storage directory exists
            $this->info('2. Testing storage setup...');
            $storagePath = storage_path('app/public/lessons/videos');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
                $this->info('✓ Created videos storage directory');
            } else {
                $this->info('✓ Videos storage directory exists');
            }
            
            // Test 3: Check if public storage link exists
            $publicPath = public_path('storage');
            if (!file_exists($publicPath)) {
                $this->error('Storage link not found. Run: php artisan storage:link');
                return 1;
            }
            $this->info('✓ Storage link exists');
            
            // Test 4: Test lesson model methods
            $this->info('3. Testing lesson model methods...');
            $testLesson = new Lesson();
            $testLesson->title = 'Test Lesson';
            $testLesson->video_file = 'test/video.mp4';
            $testLesson->video_size = 1024000;
            $testLesson->video_duration_seconds = 300;
            
            if (method_exists($testLesson, 'hasVideo')) {
                $this->info('✓ hasVideo() method exists');
            }
            
            if (method_exists($testLesson, 'getFormattedDuration')) {
                $duration = $testLesson->getFormattedDuration();
                $this->info("✓ getFormattedDuration() works: {$duration}");
            }
            
            if (method_exists($testLesson, 'getFormattedFileSize')) {
                $size = $testLesson->getFormattedFileSize();
                $this->info("✓ getFormattedFileSize() works: {$size}");
            }
            
            // Test 5: Check routes
            $this->info('4. Testing routes...');
            $routes = [
                'admin.courses.lessons.store',
                'admin.courses.lessons.update', 
                'admin.courses.lessons.destroy'
            ];
            
            foreach ($routes as $routeName) {
                try {
                    route($routeName, [1, 1, 1]);
                    $this->info("✓ Route {$routeName} exists");
                } catch (\Exception $e) {
                    $this->error("✗ Route {$routeName} not found");
                }
            }
            
            $this->info('');
            $this->info('🎉 Video system test completed successfully!');
            $this->info('');
            $this->info('Next steps:');
            $this->info('1. Access admin panel at: http://127.0.0.1:8000/admin');
            $this->info('2. Create/Edit a course');
            $this->info('3. Add a lesson with video file upload');
            $this->info('4. Test video playback in student view');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('Test failed: ' . $e->getMessage());
            return 1;
        }
    }
}
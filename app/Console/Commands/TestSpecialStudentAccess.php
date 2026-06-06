<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\SpecialStudentCourseAccessService;

class TestSpecialStudentAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:special-student-access 
                            {user_id : ID of the special student}
                            {course_ids? : Comma-separated course IDs to assign}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test special student course access functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $courseIdsArg = $this->argument('course_ids');
        
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }
        
        if ($user->user_type !== 'special') {
            $this->error("User {$user->email} is not a special student");
            return 1;
        }
        
        $this->info("=== TESTING SPECIAL STUDENT ACCESS ===");
        $this->info("Student: {$user->email} (ID: {$user->id})");
        
        // Show current state
        $this->info("\n--- CURRENT STATE ---");
        $this->showCurrentState($user);
        
        if ($courseIdsArg) {
            $courseIds = array_map('intval', explode(',', $courseIdsArg));
            $this->info("\n--- UPDATING COURSE ACCESS ---");
            $this->info("New course IDs: " . implode(', ', $courseIds));
            
            // Update course access
            $service = app(SpecialStudentCourseAccessService::class);
            
            try {
                $success = $service->updateCourseAccess($user, $courseIds);
                
                if ($success) {
                    $this->info("✅ Course access updated successfully");
                    
                    // Show new state
                    $this->info("\n--- NEW STATE ---");
                    $freshUser = User::find($userId);
                    $this->showCurrentState($freshUser);
                } else {
                    $this->error("❌ Failed to update course access");
                    return 1;
                }
            } catch (\Exception $e) {
                $this->error("❌ Error: " . $e->getMessage());
                return 1;
            }
        }
        
        $this->info("\n=== TEST COMPLETED ===");
        return 0;
    }
    
    private function showCurrentState(User $user)
    {
        $this->info("accessible_courses: " . json_encode($user->accessible_courses));
        
        $enrollments = Enrollment::where('user_id', $user->id)
            ->with('course:id,title')
            ->get();
            
        $this->info("Total enrollments: " . $enrollments->count());
        
        foreach ($enrollments as $enrollment) {
            $status = $enrollment->status;
            $type = $enrollment->enrollment_type;
            $course = $enrollment->course->title ?? 'Unknown';
            
            $statusIcon = match($status) {
                'active' => '🟢',
                'completed' => '🟡',
                'suspended' => '🔴',
                default => '⚪'
            };
            
            $this->line("  {$statusIcon} Course ID {$enrollment->course_id} ({$course}) - {$status} - {$type}");
        }
    }
}

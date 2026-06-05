<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use Illuminate\Console\Command;

class SyncLessonCompletions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lessons:sync-completions {--course_id=} {--user_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync lesson completions from completed course enrollments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting lesson completion sync...');

        // Build query for completed enrollments
        $query = Enrollment::with(['course', 'user'])
            ->whereNotNull('completed_at');

        // Filter by course if specified
        if ($this->option('course_id')) {
            $query->where('course_id', $this->option('course_id'));
        }

        // Filter by user if specified
        if ($this->option('user_id')) {
            $query->where('user_id', $this->option('user_id'));
        }

        $completedEnrollments = $query->get();

        $this->info("Found {$completedEnrollments->count()} completed enrollments");

        $totalCreated = 0;
        $totalUpdated = 0;
        $totalSkipped = 0;

        // Process each completed enrollment
        foreach ($completedEnrollments as $enrollment) {
            $this->line("Processing: {$enrollment->user->first_name} {$enrollment->user->last_name} - {$enrollment->course->title}");

            // Get all lessons for this course
            $lessons = Lesson::where('course_id', $enrollment->course_id)
                ->where('is_published', true)
                ->get();

            foreach ($lessons as $lesson) {
                // Check if completion record already exists
                $completion = LessonCompletion::where('user_id', $enrollment->user_id)
                    ->where('lesson_id', $lesson->id)
                    ->first();

                if ($completion) {
                    // Update existing completion if not already marked as completed
                    if (!$completion->completed_at) {
                        $completion->update([
                            'progress_percentage' => 100.00,
                            'completed_at' => $enrollment->completed_at,
                        ]);
                        $totalUpdated++;
                        $this->comment("  ✓ Updated: {$lesson->title}");
                    } else {
                        $totalSkipped++;
                    }
                } else {
                    // Create new completion record
                    LessonCompletion::create([
                        'user_id' => $enrollment->user_id,
                        'lesson_id' => $lesson->id,
                        'course_id' => $enrollment->course_id,
                        'progress_percentage' => 100.00,
                        'time_spent' => 0,
                        'completed_at' => $enrollment->completed_at,
                    ]);
                    $totalCreated++;
                    $this->comment("  ✓ Created: {$lesson->title}");
                }
            }
        }

        $this->newLine();
        $this->info('Sync completed!');
        $this->table(
            ['Action', 'Count'],
            [
                ['Created', $totalCreated],
                ['Updated', $totalUpdated],
                ['Skipped', $totalSkipped],
                ['Total', $totalCreated + $totalUpdated + $totalSkipped],
            ]
        );

        return Command::SUCCESS;
    }
}

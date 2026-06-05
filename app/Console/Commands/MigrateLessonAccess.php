<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\LessonCompletion;
use App\Models\Lesson;

class MigrateLessonAccess extends Command
{
    protected $signature = 'migrate:lesson-access';
    protected $description = 'Migrate lesson_access data to lesson_completions table';

    public function handle()
    {
        $this->info('Migrating lesson_access to lesson_completions...');

        // Get all lesson_access records
        $accessRecords = DB::table('lesson_access')->get();

        if ($accessRecords->isEmpty()) {
            $this->warn('No lesson_access records found.');
            return 0;
        }

        $this->info("Found {$accessRecords->count()} lesson access records.");

        $created = 0;
        $skipped = 0;

        $bar = $this->output->createProgressBar($accessRecords->count());
        $bar->start();

        foreach ($accessRecords as $access) {
            // Check if completion already exists
            $exists = LessonCompletion::where('user_id', $access->user_id)
                ->where('lesson_id', $access->lesson_id)
                ->exists();

            if (!$exists) {
                // Get lesson to retrieve course_id
                $lesson = Lesson::find($access->lesson_id);

                if ($lesson) {
                    $completion = new LessonCompletion();
                    $completion->user_id = $access->user_id;
                    $completion->lesson_id = $access->lesson_id;
                    $completion->course_id = $lesson->course_id;
                    $completion->completed_at = $access->first_accessed_at;
                    $completion->created_at = $access->created_at;
                    $completion->updated_at = $access->updated_at;
                    $completion->save();
                    $created++;
                } else {
                    $this->warn("\nLesson ID {$access->lesson_id} not found, skipping...");
                    $skipped++;
                }
            } else {
                $skipped++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Migration completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Created', $created],
                ['Skipped (already exists)', $skipped],
                ['Total', $accessRecords->count()]
            ]
        );

        $this->newLine();
        $this->info('Now run: php artisan progress:sync');

        return 0;
    }
}

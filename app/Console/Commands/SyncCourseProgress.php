<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Services\ProgressTrackingService;
use Illuminate\Console\Command;

class SyncCourseProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'progress:sync {--user_id= : Only sync progress for a specific user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate course progress for all enrollments based on lessons, quizzes, and assignments completion';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user_id');

        $query = Enrollment::with('course');

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Syncing progress for user ID: {$userId}");
        } else {
            $this->info("Syncing progress for all enrollments...");
        }

        $enrollments = $query->get();
        $progressService = app(ProgressTrackingService::class);

        if ($enrollments->isEmpty()) {
            $this->warn('No enrollments found to sync.');
            return 0;
        }

        $this->info("Found {$enrollments->count()} enrollment(s) to sync.");

        $bar = $this->output->createProgressBar($enrollments->count());
        $bar->start();

        $updated = 0;
        $skipped = 0;

        foreach ($enrollments as $enrollment) {
            try {
                $oldProgress = $enrollment->progress_percentage;
                $oldStatus = $enrollment->status;
                $newProgress = $progressService->calculateCourseProgress(
                    $enrollment->user_id,
                    $enrollment->course_id
                );

                // Determine if changes are needed
                $needsUpdate = false;
                $updateData = [];

                if ($oldProgress != $newProgress) {
                    $updateData['progress_percentage'] = $newProgress;
                    $needsUpdate = true;
                }

                // Auto-complete enrollment if progress reaches 100%
                if ($newProgress >= 100 && $oldStatus !== 'completed') {
                    $updateData['status'] = 'completed';
                    $updateData['completed_at'] = $enrollment->completed_at ?? now();
                    $needsUpdate = true;
                }

                if ($needsUpdate) {
                    $enrollment->update($updateData);
                    $updated++;
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                $this->error("\nError syncing enrollment ID {$enrollment->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Progress sync completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Updated', $updated],
                ['Skipped (no change)', $skipped],
                ['Total', $enrollments->count()]
            ]
        );

        return 0;
    }
}

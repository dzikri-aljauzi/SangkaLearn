<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\CertificateQueue;
use App\Services\ProgressTrackingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncAllProgress extends Command
{
    protected $signature = 'progress:sync {--force : Skip confirmation} {--user= : Only sync for specific user ID} {--course= : Only sync for specific course ID}';

    protected $description = 'Sync all enrollment progress from actual completion data and generate missing certificates';

    public function handle()
    {
        $shouldForce = $this->option('force');
        $userId = $this->option('user');
        $courseId = $this->option('course');

        $this->info('=== Progress Sync & Certificate Generator ===');
        $this->newLine();

        // Build query for all active enrollments
        $query = Enrollment::whereIn('status', ['active', 'completed'])
            ->with(['course', 'user']);

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Filtering by user ID: {$userId}");
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
            $this->info("Filtering by course ID: {$courseId}");
        }

        $enrollments = $query->get();

        if ($enrollments->isEmpty()) {
            $this->info('No enrollments found.');
            return 0;
        }

        $this->info("Found {$enrollments->count()} enrollments to check.");

        if (!$shouldForce && !$this->confirm('Proceed with sync?')) {
            $this->info('Cancelled.');
            return 0;
        }

        $progressService = new ProgressTrackingService();
        $bar = $this->output->createProgressBar($enrollments->count());
        $bar->start();

        $progressUpdated = 0;
        $statusUpdated = 0;
        $certificatesGenerated = 0;
        $errors = [];

        foreach ($enrollments as $enrollment) {
            try {
                // Calculate actual progress
                $actualProgress = $progressService->calculateCourseProgress(
                    $enrollment->user_id,
                    $enrollment->course_id
                );

                $storedProgress = $enrollment->progress_percentage ?? 0;
                $needsUpdate = false;
                $updateData = [];

                // Check if progress differs
                if (abs($storedProgress - $actualProgress) > 0.01) {
                    $updateData['progress_percentage'] = $actualProgress;
                    $progressUpdated++;
                    $needsUpdate = true;
                }

                // Check if should be marked completed
                if ($actualProgress >= 100 && $enrollment->status !== 'completed') {
                    $updateData['status'] = 'completed';
                    $updateData['completed_at'] = $enrollment->completed_at ?? now();
                    $statusUpdated++;
                    $needsUpdate = true;
                }

                // Apply updates
                if ($needsUpdate) {
                    $enrollment->update($updateData);
                    $enrollment->refresh();
                }

                // Check if needs certificate
                if ($actualProgress >= 100 && $enrollment->course->has_certificate) {
                    $hasCertificate = CertificateQueue::where('user_id', $enrollment->user_id)
                        ->where('course_id', $enrollment->course_id)
                        ->where('is_primary', true)
                        ->exists();

                    if (!$hasCertificate) {
                        $progressService->addToCertificateQueue($enrollment);
                        $certificatesGenerated++;

                        Log::info("SyncProgress: Generated certificate for user {$enrollment->user_id} in course {$enrollment->course_id}");
                    }
                }

            } catch (\Exception $e) {
                $errors[] = [
                    'user_id' => $enrollment->user_id,
                    'course_id' => $enrollment->course_id,
                    'error' => $e->getMessage(),
                ];
                Log::error("SyncProgress error: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('=== Sync Complete ===');
        $this->info("  - Progress updated: {$progressUpdated}");
        $this->info("  - Status changed to completed: {$statusUpdated}");
        $this->info("  - Certificates generated: {$certificatesGenerated}");

        if (!empty($errors)) {
            $this->error("  - Errors: " . count($errors));
            $this->newLine();
            $this->table(
                ['User ID', 'Course ID', 'Error'],
                $errors
            );
        }

        return empty($errors) ? 0 : 1;
    }
}

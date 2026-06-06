<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\CertificateQueue;
use App\Services\ProgressTrackingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackfillCertificates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:backfill
                            {--dry-run : Show what would be done without actually generating certificates}
                            {--force : Skip confirmation prompt (for scheduled tasks)}
                            {--debug : Show why some enrollments are excluded}
                            {--user= : Only backfill for a specific user ID}
                            {--course= : Only backfill for a specific course ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate certificates for all completed enrollments (100% progress) that don\'t have certificates yet';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $isDebug = $this->option('debug');
        $userId = $this->option('user');
        $courseId = $this->option('course');

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Debug mode: show all 100% enrollments and why they're included/excluded
        if ($isDebug) {
            $this->showDebugInfo($userId, $courseId);
            return 0;
        }

        $this->info('Searching for enrollments at 100% progress without certificates...');

        // Build query for enrollments at 100% that might need certificates
        // Use >= 100 to catch any rounding issues
        $query = Enrollment::where('progress_percentage', '>=', 100)
            ->whereHas('course', function ($q) {
                $q->where('has_certificate', true);
            })
            ->with(['course', 'user']);

        // Apply filters if provided
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
            $this->info('No enrollments found with 100% progress.');
            return 0;
        }

        $this->info("Found {$enrollments->count()} enrollments at 100% progress.");

        // Filter out those that already have certificates
        $needsCertificate = $enrollments->filter(function ($enrollment) {
            $hasCertificate = CertificateQueue::where('user_id', $enrollment->user_id)
                ->where('course_id', $enrollment->course_id)
                ->where('is_primary', true)
                ->exists();

            return !$hasCertificate;
        });

        if ($needsCertificate->isEmpty()) {
            $this->info('All enrollments already have certificates. Nothing to do.');
            return 0;
        }

        $this->info("Found {$needsCertificate->count()} enrollments that need certificates.");

        if ($isDryRun) {
            $this->table(
                ['User ID', 'User Name', 'Course ID', 'Course Title', 'Completed At'],
                $needsCertificate->map(function ($enrollment) {
                    return [
                        $enrollment->user_id,
                        $enrollment->user->name ?? 'Unknown',
                        $enrollment->course_id,
                        $enrollment->course->title ?? 'Unknown',
                        $enrollment->completed_at ?? 'N/A',
                    ];
                })->toArray()
            );

            $this->warn("DRY RUN: Would generate {$needsCertificate->count()} certificates.");
            return 0;
        }

        // Confirm before proceeding (skip if --force)
        if (!$this->option('force') && !$this->confirm("Do you want to generate {$needsCertificate->count()} certificates?")) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $progressTrackingService = new ProgressTrackingService();
        $bar = $this->output->createProgressBar($needsCertificate->count());
        $bar->start();

        $successCount = 0;
        $failedCount = 0;
        $failedEnrollments = [];

        foreach ($needsCertificate as $enrollment) {
            try {
                // Ensure completed_at is set
                if (!$enrollment->completed_at) {
                    $enrollment->update(['completed_at' => now()]);
                }

                // Generate certificate using the existing service
                $progressTrackingService->addToCertificateQueue($enrollment);

                // Verify certificate was created
                $certificateCreated = CertificateQueue::where('user_id', $enrollment->user_id)
                    ->where('course_id', $enrollment->course_id)
                    ->where('is_primary', true)
                    ->exists();

                if ($certificateCreated) {
                    $successCount++;
                    Log::info("Backfill: Certificate generated for user {$enrollment->user_id} in course {$enrollment->course_id}");
                } else {
                    $failedCount++;
                    $failedEnrollments[] = [
                        'user_id' => $enrollment->user_id,
                        'course_id' => $enrollment->course_id,
                        'reason' => 'Certificate queue entry not created',
                    ];
                }
            } catch (\Exception $e) {
                $failedCount++;
                $failedEnrollments[] = [
                    'user_id' => $enrollment->user_id,
                    'course_id' => $enrollment->course_id,
                    'reason' => $e->getMessage(),
                ];
                Log::error("Backfill: Failed to generate certificate for user {$enrollment->user_id} in course {$enrollment->course_id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info("Certificate generation completed:");
        $this->info("  - Success: {$successCount}");

        if ($failedCount > 0) {
            $this->error("  - Failed: {$failedCount}");
            $this->newLine();
            $this->warn("Failed enrollments:");
            $this->table(
                ['User ID', 'Course ID', 'Reason'],
                $failedEnrollments
            );
        }

        return $failedCount > 0 ? 1 : 0;
    }

    /**
     * Show debug information about enrollments
     */
    private function showDebugInfo($userId = null, $courseId = null)
    {
        $this->info('=== DEBUG: Checking all enrollments with progress >= 100% ===');
        $this->newLine();

        // Get ALL enrollments with 100% progress (no filters)
        $query = Enrollment::where('progress_percentage', '>=', 100)
            ->with(['course', 'user']);

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        $allCompleted = $query->get();

        $this->info("Total enrollments with progress >= 100%: {$allCompleted->count()}");
        $this->newLine();

        $debugData = [];
        foreach ($allCompleted as $enrollment) {
            $hasCertificateEnabled = $enrollment->course->has_certificate ?? false;
            $hasCertificateInQueue = CertificateQueue::where('user_id', $enrollment->user_id)
                ->where('course_id', $enrollment->course_id)
                ->where('is_primary', true)
                ->exists();

            $status = 'OK';
            $reason = '-';

            if (!$hasCertificateEnabled) {
                $status = 'SKIP';
                $reason = 'Course has_certificate = false';
            } elseif ($hasCertificateInQueue) {
                $status = 'EXISTS';
                $reason = 'Certificate already in queue';
            } else {
                $status = 'NEEDS';
                $reason = 'Needs certificate generation';
            }

            $debugData[] = [
                $enrollment->user_id,
                $enrollment->user->name ?? 'Unknown',
                $enrollment->course_id,
                substr($enrollment->course->title ?? 'Unknown', 0, 40),
                $enrollment->progress_percentage . '%',
                $hasCertificateEnabled ? 'Yes' : 'No',
                $hasCertificateInQueue ? 'Yes' : 'No',
                $status,
                $reason,
            ];
        }

        $this->table(
            ['User ID', 'User Name', 'Course ID', 'Course Title', 'Progress', 'Cert Enabled', 'In Queue', 'Status', 'Reason'],
            $debugData
        );

        // Summary
        $needsCert = collect($debugData)->where(7, 'NEEDS')->count();
        $skipped = collect($debugData)->where(7, 'SKIP')->count();
        $exists = collect($debugData)->where(7, 'EXISTS')->count();

        $this->newLine();
        $this->info("Summary:");
        $this->info("  - Needs certificate: {$needsCert}");
        $this->info("  - Already has certificate: {$exists}");
        $this->warn("  - Skipped (cert not enabled): {$skipped}");

        if ($skipped > 0) {
            $this->newLine();
            $this->warn("To enable certificates for a course, set 'has_certificate' to true in admin panel.");
        }
    }
}

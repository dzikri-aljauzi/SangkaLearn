<?php

namespace App\Console\Commands;

use App\Models\CertificateQueue;
use App\Services\CertificateGeneratorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RegenerateCertificates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:regenerate
                            {--all : Regenerate all existing certificates}
                            {--user= : Only regenerate for a specific user ID}
                            {--course= : Only regenerate for a specific course ID}
                            {--dry-run : Show what would be done without actually regenerating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate existing certificate PDFs (useful after template changes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $regenerateAll = $this->option('all');
        $userId = $this->option('user');
        $courseId = $this->option('course');
        $isDryRun = $this->option('dry-run');

        if (!$regenerateAll && !$userId && !$courseId) {
            $this->error('Please specify --all, --user=ID, or --course=ID');
            $this->info('Examples:');
            $this->info('  php artisan certificates:regenerate --all');
            $this->info('  php artisan certificates:regenerate --user=5');
            $this->info('  php artisan certificates:regenerate --course=10');
            return 1;
        }

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $this->info('Searching for certificates to regenerate...');

        // Build query for certificates
        $query = CertificateQueue::where('is_primary', true)
            ->whereIn('status', ['approved', 'pending'])
            ->with(['user', 'course', 'enrollment']);

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Filtering by user ID: {$userId}");
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
            $this->info("Filtering by course ID: {$courseId}");
        }

        $certificates = $query->get();

        if ($certificates->isEmpty()) {
            $this->info('No certificates found to regenerate.');
            return 0;
        }

        $this->info("Found {$certificates->count()} certificates to regenerate.");

        if ($isDryRun) {
            $this->table(
                ['ID', 'User ID', 'User Name', 'Course ID', 'Course Title', 'Status', 'Certificate File'],
                $certificates->map(function ($cert) {
                    return [
                        $cert->id,
                        $cert->user_id,
                        $cert->user->name ?? 'Unknown',
                        $cert->course_id,
                        $cert->course->title ?? 'Unknown',
                        $cert->status,
                        $cert->certificate_file ? 'Yes' : 'No',
                    ];
                })->toArray()
            );

            $this->warn("DRY RUN: Would regenerate {$certificates->count()} certificates.");
            return 0;
        }

        // Confirm before proceeding
        if (!$this->confirm("Do you want to regenerate {$certificates->count()} certificates?")) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $certificateGenerator = new CertificateGeneratorService();
        $bar = $this->output->createProgressBar($certificates->count());
        $bar->start();

        $successCount = 0;
        $failedCount = 0;
        $failedCertificates = [];

        foreach ($certificates as $cert) {
            try {
                // Delete old certificate file if exists
                if ($cert->certificate_file && Storage::disk('public')->exists($cert->certificate_file)) {
                    Storage::disk('public')->delete($cert->certificate_file);
                }

                // Regenerate certificate
                $certificatePath = $certificateGenerator->generate($cert);

                if ($certificatePath) {
                    // Update certificate queue with new path
                    $cert->update([
                        'certificate_file' => $certificatePath,
                        'auto_generated_certificate_path' => $certificatePath,
                        'status' => 'approved',
                    ]);

                    // Update enrollment certificate file path
                    if ($cert->enrollment) {
                        $cert->enrollment->update([
                            'certificate_file' => $certificatePath,
                        ]);
                    }

                    $successCount++;
                    Log::info("Regenerate: Certificate regenerated for user {$cert->user_id} in course {$cert->course_id}");
                } else {
                    $failedCount++;
                    $failedCertificates[] = [
                        'cert_id' => $cert->id,
                        'user_id' => $cert->user_id,
                        'course_id' => $cert->course_id,
                        'reason' => 'PDF generation returned null',
                    ];
                }
            } catch (\Exception $e) {
                $failedCount++;
                $failedCertificates[] = [
                    'cert_id' => $cert->id,
                    'user_id' => $cert->user_id,
                    'course_id' => $cert->course_id,
                    'reason' => $e->getMessage(),
                ];
                Log::error("Regenerate: Failed for certificate {$cert->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info("Certificate regeneration completed:");
        $this->info("  - Success: {$successCount}");

        if ($failedCount > 0) {
            $this->error("  - Failed: {$failedCount}");
            $this->newLine();
            $this->warn("Failed certificates:");
            $this->table(
                ['Cert ID', 'User ID', 'Course ID', 'Reason'],
                $failedCertificates
            );
        }

        return $failedCount > 0 ? 1 : 0;
    }
}

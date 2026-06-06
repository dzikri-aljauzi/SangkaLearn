<?php

namespace App\Console\Commands;

use App\Models\CertificateQueue;
use App\Models\Enrollment;
use App\Services\ProgressTrackingService;
use Illuminate\Console\Command;

class MigrateCertificateData extends Command
{
    protected $signature = 'certificates:migrate-old-data';
    protected $description = 'Migrate old certificate data to new auto-generate system';

    public function handle()
    {
        $this->info('=== Certificate Data Migration ===');
        $this->newLine();

        // Step 1: Update existing certificate_queue entries
        $this->info('Step 1: Updating existing certificate queue entries...');
        $this->updateExistingCertificates();

        // Step 2: Generate certificates for completed enrollments without certificates
        $this->info('Step 2: Generating missing certificates...');
        $this->generateMissingCertificates();

        $this->newLine();
        $this->info('✅ Migration complete!');

        return Command::SUCCESS;
    }

    private function updateExistingCertificates()
    {
        // Get all existing certificate queue entries that don't have certificate_type set
        $oldCertificates = CertificateQueue::whereNull('certificate_type')
            ->orWhereNull('is_primary')
            ->get();

        if ($oldCertificates->count() === 0) {
            $this->info('  No old certificates to update.');
            return;
        }

        $this->info("  Found {$oldCertificates->count()} old certificate entries.");

        $bar = $this->output->createProgressBar($oldCertificates->count());
        $bar->start();

        foreach ($oldCertificates as $cert) {
            // If it has certificate_file from upload, mark as uploaded
            // Otherwise, mark as auto_generated
            if ($cert->uploaded_certificate_path) {
                $cert->update([
                    'certificate_type' => 'uploaded',
                    'is_primary' => true, // Old uploaded certs are considered primary
                    'auto_approved' => false, // Was manually approved by admin
                ]);
            } else {
                $cert->update([
                    'certificate_type' => 'auto_generated',
                    'is_primary' => true,
                    'auto_approved' => $cert->status === 'approved', // If already approved, mark as auto
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("  ✅ Updated {$oldCertificates->count()} existing certificates.");
    }

    private function generateMissingCertificates()
    {
        // Get completed enrollments without certificates
        $existingEnrollmentIds = CertificateQueue::pluck('enrollment_id')->toArray();

        $completedEnrollments = Enrollment::where('progress_percentage', 100)
            ->whereNotIn('id', $existingEnrollmentIds)
            ->with(['user', 'course'])
            ->get();

        if ($completedEnrollments->count() === 0) {
            $this->info('  No missing certificates to generate.');
            return;
        }

        $this->info("  Found {$completedEnrollments->count()} enrollments without certificates.");

        $service = app(ProgressTrackingService::class);
        $bar = $this->output->createProgressBar($completedEnrollments->count());
        $bar->start();

        $success = 0;
        $failed = 0;
        $errors = [];

        foreach ($completedEnrollments as $enrollment) {
            try {
                // Use the service to create queue entry and generate certificate
                $service->addToCertificateQueue($enrollment);
                $success++;
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Enrollment ID {$enrollment->id}: {$e->getMessage()}";
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->info("  ✅ Successfully generated: {$success}");

        if ($failed > 0) {
            $this->warn("  ⚠️  Failed: {$failed}");
            $this->newLine();
            $this->warn('Failed enrollments:');
            foreach ($errors as $error) {
                $this->warn("  - {$error}");
            }
        }
    }
}

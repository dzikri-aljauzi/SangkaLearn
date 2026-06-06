<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use Illuminate\Console\Command;

class BackfillCompletedAt extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'enrollments:backfill-completed-at';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill completed_at field for enrollments with 100% progress but NULL completed_at';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Searching for enrollments with 100% progress but NULL completed_at...');

        $enrollments = Enrollment::where('progress_percentage', 100)
            ->whereNull('completed_at')
            ->get();

        if ($enrollments->isEmpty()) {
            $this->info('No enrollments found that need backfilling.');
            return 0;
        }

        $this->info("Found {$enrollments->count()} enrollments to update.");

        $bar = $this->output->createProgressBar($enrollments->count());
        $bar->start();

        foreach ($enrollments as $enrollment) {
            $enrollment->update([
                'completed_at' => now()
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully updated {$enrollments->count()} enrollments with completed_at timestamp.");

        return 0;
    }
}

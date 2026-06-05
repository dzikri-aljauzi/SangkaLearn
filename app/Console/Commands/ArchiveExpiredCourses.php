<?php

namespace App\Console\Commands;

use App\Models\Course;
use Illuminate\Console\Command;

class ArchiveExpiredCourses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'courses:archive-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Archive courses that have passed their period_end date and have auto_archive enabled';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for courses that need to be archived...');

        $courses = Course::where('auto_archive', true)
            ->where('is_permanent', false)
            ->where('status', 'published')
            ->whereNull('archived_at')
            ->whereNotNull('period_end')
            ->where('period_end', '<', now())
            ->get();

        if ($courses->isEmpty()) {
            $this->info('No courses need to be archived.');
            return 0;
        }

        $count = 0;
        foreach ($courses as $course) {
            if ($course->shouldBeArchived()) {
                $course->archive();
                $count++;
                $this->line("✓ Archived: {$course->title}");
            }
        }

        $this->info("\nTotal archived: {$count} courses");
        return 0;
    }
}

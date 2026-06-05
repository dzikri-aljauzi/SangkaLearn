<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixPostgresSequences extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'postgres:fix-sequences {--table= : Specific table to fix}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix PostgreSQL sequence values that are out of sync with table data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking and fixing PostgreSQL sequences...');

        // Tables that typically have sequence issues
        $tables = [
            'course_sections',
            'courses',
            'users',
            'enrollments',
            'lessons',
            'assignments',
            'quizzes',
            'quiz_questions',
            'categories',
            'orders',
            'payments',
            'reviews',
            'messages',
            'conversations',
            'conversation_participants',
            'forums',
            'forum_topics',
            'forum_posts',
            'announcements'
        ];

        // If specific table is provided, only fix that one
        if ($this->option('table')) {
            $tables = [$this->option('table')];
        }

        $fixedCount = 0;
        $errorCount = 0;

        foreach ($tables as $table) {
            try {
                $this->line("Checking table: {$table}");

                // Get max ID from table
                $maxId = DB::table($table)->max('id');

                if ($maxId === null) {
                    $this->comment("  No records found, skipping.");
                    continue;
                }

                // Sequence name follows Laravel convention
                $sequenceName = $table . '_id_seq';

                // Get current sequence value
                $result = DB::select("SELECT last_value FROM {$sequenceName}");
                if (empty($result)) {
                    $this->comment("  Sequence {$sequenceName} not found, skipping.");
                    continue;
                }

                $sequenceValue = $result[0]->last_value;

                // Fix sequence if needed
                if ($sequenceValue <= $maxId) {
                    $newValue = $maxId + 1;
                    $this->warn("  Fixing sequence {$sequenceName}: {$sequenceValue} -> {$newValue}");
                    DB::statement("SELECT setval('{$sequenceName}', {$newValue})");
                    $this->info("  ✅ Sequence fixed!");
                    $fixedCount++;
                } else {
                    $this->info("  ✅ Sequence is already correct ({$sequenceValue} > {$maxId})");
                }

            } catch (\Exception $e) {
                $this->error("  ❌ Error with table {$table}: " . $e->getMessage());
                $errorCount++;
            }
        }

        $this->newLine();
        if ($fixedCount > 0) {
            $this->info("Fixed {$fixedCount} sequences successfully!");
        }
        if ($errorCount > 0) {
            $this->warn("Encountered {$errorCount} errors.");
        }
        if ($fixedCount === 0 && $errorCount === 0) {
            $this->info("All sequences are already in sync!");
        }

        return Command::SUCCESS;
    }
}

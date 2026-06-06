<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDatabaseSequences extends Command
{
    protected $signature = 'db:fix-sequences';
    protected $description = 'Fix PostgreSQL sequence values that are out of sync';

    public function handle()
    {
        $this->info('Checking and fixing database sequences...');

        $tables = [
            'user_roles' => 'user_roles_id_seq',
            'users' => 'users_id_seq',
            'roles' => 'roles_id_seq',
            // Add other tables as needed
        ];

        foreach ($tables as $table => $sequence) {
            try {
                // Check if table exists
                $tableExists = DB::select("SELECT to_regclass(?) as exists", [$table])[0]->exists;
                if (!$tableExists) {
                    $this->warn("Table {$table} doesn't exist, skipping...");
                    continue;
                }

                // Get max ID from table
                $maxId = DB::table($table)->max('id') ?? 0;

                // Get current sequence value (use last_value instead of currval to avoid session issues)
                $currentSeq = DB::select("SELECT last_value as current_val FROM {$sequence}")[0]->current_val ?? 0;

                $this->info("Table: {$table} - Max ID: {$maxId}, Current sequence: {$currentSeq}");

                // Fix sequence if it's behind
                if ($maxId >= $currentSeq) {
                    $newSeq = $maxId + 1;
                    DB::statement("ALTER SEQUENCE {$sequence} RESTART WITH {$newSeq}");
                    $this->info("✓ Fixed {$sequence} - reset to {$newSeq}");
                } else {
                    $this->info("✓ {$sequence} is OK");
                }
            } catch (\Exception $e) {
                $this->error("Error with {$table}: " . $e->getMessage());
            }
        }

        $this->info('Database sequences check completed!');
        return 0;
    }
}
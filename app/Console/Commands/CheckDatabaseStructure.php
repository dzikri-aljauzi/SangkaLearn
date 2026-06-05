<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckDatabaseStructure extends Command
{
    protected $signature = 'db:check-structure {table?}';
    protected $description = 'Check database structure and foreign key constraints';

    public function handle()
    {
        $table = $this->argument('table') ?? 'payments';
        
        $this->info("🔍 Checking structure for table: {$table}");
        $this->newLine();

        try {
            // Check if table exists
            if (!Schema::hasTable($table)) {
                $this->error("❌ Table '{$table}' does not exist!");
                return Command::FAILURE;
            }

            $this->info("✅ Table '{$table}' exists");
            
            // Get table structure
            $columns = DB::select("PRAGMA table_info({$table})");
            
            $this->info("📋 Table Structure:");
            $this->table(
                ['Column', 'Type', 'Nullable', 'Default', 'Primary Key'],
                collect($columns)->map(function($col) {
                    return [
                        $col->name,
                        $col->type,
                        $col->notnull == 0 ? 'YES' : 'NO',
                        $col->dflt_value ?? 'NULL',
                        $col->pk == 1 ? 'YES' : 'NO'
                    ];
                })->toArray()
            );

            // Check foreign keys
            $this->newLine();
            $this->info("🔗 Foreign Key Constraints:");
            $foreignKeys = DB::select("PRAGMA foreign_key_list({$table})");
            
            if (empty($foreignKeys)) {
                $this->warn("⚠️ No foreign key constraints found");
            } else {
                $this->table(
                    ['ID', 'Sequence', 'Table', 'From', 'To', 'On Update', 'On Delete', 'Match'],
                    collect($foreignKeys)->map(function($fk) {
                        return [
                            $fk->id,
                            $fk->seq,
                            $fk->table,
                            $fk->from,
                            $fk->to,
                            $fk->on_update,
                            $fk->on_delete,
                            $fk->match
                        ];
                    })->toArray()
                );
            }

            // Check if foreign keys are enabled
            $this->newLine();
            $fkStatus = DB::select("PRAGMA foreign_keys")[0];
            $this->info("🔐 Foreign Keys Status: " . ($fkStatus->foreign_keys ? 'ENABLED' : 'DISABLED'));

            // If checking payments table specifically
            if ($table === 'payments') {
                $this->newLine();
                $this->info("🧪 Testing Payment Table Dependencies:");
                
                // Check related tables
                $relatedTables = ['users', 'orders'];
                foreach ($relatedTables as $relatedTable) {
                    if (Schema::hasTable($relatedTable)) {
                        $count = DB::table($relatedTable)->count();
                        $this->line("✅ {$relatedTable}: {$count} records");
                    } else {
                        $this->error("❌ {$relatedTable}: table missing");
                    }
                }

                // Check Payment model
                $this->newLine();
                $this->info("📝 Payment Model Check:");
                try {
                    $paymentModel = new \App\Models\Payment();
                    $fillable = $paymentModel->getFillable();
                    $this->line("Fillable fields: " . implode(', ', $fillable));
                    
                    // Check for relationships
                    if (method_exists($paymentModel, 'user')) {
                        $this->line("✅ user() relationship exists");
                    }
                    if (method_exists($paymentModel, 'order')) {
                        $this->line("✅ order() relationship exists");
                    }
                } catch (\Exception $e) {
                    $this->error("❌ Payment model error: " . $e->getMessage());
                }
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL: Update check constraint to include 'granted'
        // For MySQL: Modify enum column to include 'granted'

        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // PostgreSQL: Drop old constraint and create new one with 'granted'
            DB::statement("
                ALTER TABLE enrollments
                DROP CONSTRAINT IF EXISTS enrollments_enrollment_type_check
            ");

            DB::statement("
                ALTER TABLE enrollments
                ADD CONSTRAINT enrollments_enrollment_type_check
                CHECK (enrollment_type IN ('manual', 'purchase', 'group_assignment', 'granted'))
            ");
        } else {
            // MySQL/MariaDB: Recreate column with new enum values
            DB::statement("
                ALTER TABLE enrollments
                MODIFY COLUMN enrollment_type ENUM('manual', 'purchase', 'group_assignment', 'granted')
                DEFAULT 'manual'
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Removing enum values in PostgreSQL is complex and risky
        // We'll keep the 'granted' value even on rollback to avoid data loss

        // If you really need to remove it, you'd have to:
        // 1. Create a new type without 'granted'
        // 2. Update all 'granted' rows to another value (e.g., 'manual')
        // 3. Alter the column to use the new type
        // 4. Drop the old type

        // For safety, we're not implementing rollback for this migration
    }
};

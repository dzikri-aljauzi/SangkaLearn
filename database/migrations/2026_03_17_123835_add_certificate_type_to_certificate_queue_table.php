<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('certificate_queue', function (Blueprint $table) {
            // Drop the unique constraint to allow multiple certificates per enrollment
            $table->dropUnique(['user_id', 'course_id']);

            // Add new columns for multiple certificates support
            $table->enum('certificate_type', ['auto_generated', 'uploaded'])->default('auto_generated')->after('enrollment_id');
            $table->boolean('is_primary')->default(false)->after('certificate_type');
            $table->boolean('auto_approved')->default(false)->after('status'); // Track if auto-approved

            // Add index for better query performance
            $table->index(['enrollment_id', 'certificate_type']);
            $table->index('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_queue', function (Blueprint $table) {
            // Restore unique constraint
            $table->unique(['user_id', 'course_id']);

            // Drop new columns
            $table->dropColumn([
                'certificate_type',
                'is_primary',
                'auto_approved',
            ]);
        });
    }
};

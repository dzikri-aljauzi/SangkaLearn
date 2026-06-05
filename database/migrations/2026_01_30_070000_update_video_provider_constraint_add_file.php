<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Update the video_provider constraint to include 'file' for direct video uploads
     */
    public function up(): void
    {
        // Drop existing check constraint
        DB::statement('ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_video_provider_check');

        // Add new check constraint with 'drive' and 'file' included
        DB::statement("ALTER TABLE lessons ADD CONSTRAINT lessons_video_provider_check CHECK (video_provider IN ('drive', 'file'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the constraint
        DB::statement('ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_video_provider_check');

        // Restore previous constraint (only 'drive')
        DB::statement("ALTER TABLE lessons ADD CONSTRAINT lessons_video_provider_check CHECK (video_provider IN ('drive'))");
    }
};

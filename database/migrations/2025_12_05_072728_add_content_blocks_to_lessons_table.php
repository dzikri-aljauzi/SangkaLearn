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
        Schema::table('lessons', function (Blueprint $table) {
            // Add content_blocks field for flexible text + image content structure
            $table->json('content_blocks')->nullable()->after('content_images');

            // Add view_duration for progress tracking
            $table->integer('view_duration_seconds')->nullable()->after('duration_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['content_blocks', 'view_duration_seconds']);
        });
    }
};

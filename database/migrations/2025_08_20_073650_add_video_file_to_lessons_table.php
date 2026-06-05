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
            $table->string('video_file')->nullable()->after('video_url');
            $table->bigInteger('video_size')->nullable()->after('video_file'); // Size in bytes
            $table->string('video_mime_type')->nullable()->after('video_size');
            $table->integer('video_duration_seconds')->nullable()->after('video_mime_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['video_file', 'video_size', 'video_mime_type', 'video_duration_seconds']);
        });
    }
};

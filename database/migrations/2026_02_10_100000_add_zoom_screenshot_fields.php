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
        // Add require_zoom_screenshot to courses table
        Schema::table('courses', function (Blueprint $table) {
            $table->boolean('require_zoom_screenshot')->default(false)->after('zoom_notes');
        });

        // Add zoom_screenshot_path to enrollments table
        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('zoom_screenshot_path')->nullable()->after('completion_data');
            $table->timestamp('zoom_screenshot_uploaded_at')->nullable()->after('zoom_screenshot_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('require_zoom_screenshot');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['zoom_screenshot_path', 'zoom_screenshot_uploaded_at']);
        });
    }
};

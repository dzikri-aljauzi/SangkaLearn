<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds access_duration_days field to courses table.
     * This field defines how many days a student has access after enrollment.
     * If null or 0, access is unlimited (permanent).
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedInteger('access_duration_days')->nullable()->after('is_permanent')
                ->comment('Number of days access is valid after enrollment. Null = unlimited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('access_duration_days');
        });
    }
};

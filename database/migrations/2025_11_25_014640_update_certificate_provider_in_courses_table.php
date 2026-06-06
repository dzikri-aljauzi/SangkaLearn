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
        // First, drop the old enum column
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('certificate_provider');
        });

        // Add new column with foreign key
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('certificate_provider_id')
                  ->nullable()
                  ->after('has_certificate')
                  ->constrained('certificate_providers')
                  ->onDelete('set null');

            $table->index('certificate_provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['certificate_provider_id']);
            $table->dropIndex(['certificate_provider_id']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->enum('certificate_provider', ['leadnex', 'bnsp', 'both'])->default('leadnex')->after('has_certificate');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('certificate_provider_id');
        });
    }
};

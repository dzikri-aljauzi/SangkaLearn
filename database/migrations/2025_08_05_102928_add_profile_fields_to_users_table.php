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
        Schema::table('users', function (Blueprint $table) {
            // Add new profile fields if they don't exist
            if (!Schema::hasColumn('users', 'specialization')) {
                $table->string('specialization')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'experience_years')) {
                $table->integer('experience_years')->nullable()->default(0)->after('specialization');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['specialization', 'experience_years']);
        });
    }
};

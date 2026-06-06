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
        Schema::table('quizzes', function (Blueprint $table) {
            // Allow students to retake quiz until they pass (get score >= passing_score)
            $table->boolean('allow_retake_until_pass')->default(false)->after('show_results_immediately');

            // Maximum number of retake attempts (null = unlimited)
            $table->integer('max_retake_attempts')->nullable()->after('allow_retake_until_pass');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['allow_retake_until_pass', 'max_retake_attempts']);
        });
    }
};

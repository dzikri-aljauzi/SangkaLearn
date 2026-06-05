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
        // PostgreSQL doesn't support changing enum values easily
        // So we'll drop and recreate the column
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn('type');
        });
        
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->enum('type', ['multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'text'])
                  ->default('multiple_choice')
                  ->after('question');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            // Revert back to original enum
            $table->enum('type', ['multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching'])->change();
        });
    }
};

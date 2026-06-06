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
        Schema::table('assignments', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('is_published');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};

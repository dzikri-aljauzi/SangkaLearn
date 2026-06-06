<?php
// database/migrations/2024_01_01_000012_create_analytics_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // User Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');
            $table->text('description')->nullable();
            $table->morphs('subject'); // This already creates the index we need
            $table->json('properties')->nullable(); // additional data
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            // Removed duplicate morphs index since morphs() already creates it
        });

        // Course Analytics (daily aggregates)
        Schema::create('course_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('views')->default(0);
            $table->integer('enrollments')->default(0);
            $table->integer('completions')->default(0);
            $table->integer('video_views')->default(0);
            $table->integer('quiz_attempts')->default(0);
            $table->decimal('avg_rating', 3, 2)->nullable();
            $table->integer('total_revenue')->default(0);
            $table->timestamps();

            $table->unique(['course_id', 'date']);
            $table->index('date');
        });

        // Learning Sessions (for detailed tracking)
        Schema::create('learning_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration')->nullable(); // seconds
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('ip_address')->nullable();
            $table->json('progress_data')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'course_id', 'started_at']);
        });

        // System Metrics (cached)
        Schema::create('system_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_name');
            $table->string('metric_value');
            $table->date('date');
            $table->timestamps();

            $table->unique(['metric_name', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('system_metrics');
        Schema::dropIfExists('learning_sessions');
        Schema::dropIfExists('course_analytics');
        Schema::dropIfExists('activity_logs');
    }
};
<?php
// database/migrations/2024_01_01_000005_create_course_content_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Course Sections
        Schema::create('course_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['course_id', 'sort_order']);
        });

        // Lessons
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained('course_sections')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            
            // Lesson Type & Content
            $table->enum('type', ['video', 'text', 'quiz', 'assignment', 'file', 'live_session', 'scorm']);
            $table->string('video_url')->nullable();
            $table->enum('video_provider', ['youtube', 'vimeo', 'file', 'stream'])->nullable();
            $table->string('video_duration')->nullable(); // HH:MM:SS
            $table->json('attachments')->nullable();
            
            // Access Control
            $table->boolean('is_preview')->default(false);
            $table->boolean('is_published')->default(true);
            $table->json('completion_criteria')->nullable();
            
            // Ordering
            $table->integer('sort_order')->default(0);
            
            // Timing
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['course_id', 'section_id', 'sort_order']);
            $table->index(['type', 'is_published']);
        });

        // Lesson Completions
        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('time_spent')->default(0); // seconds
            $table->timestamp('completed_at')->nullable();
            $table->json('completion_data')->nullable(); // quiz scores, etc.
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
            $table->index(['course_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('lesson_completions');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('course_sections');
    }
};
<?php
// database/migrations/2024_01_01_000004_create_courses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('subtitle')->nullable();
            $table->longText('description');
            $table->json('learning_objectives')->nullable();
            $table->json('requirements')->nullable();
            $table->json('target_audience')->nullable();
            
            // Basic Info
            $table->foreignId('instructor_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->enum('level', ['beginner', 'intermediate', 'advanced']);
            $table->string('language', 5)->default('en');
            $table->integer('duration_hours')->nullable();
            $table->boolean('has_certificate')->default(false);
            
            // Media
            $table->string('thumbnail')->nullable();
            $table->string('preview_video')->nullable();
            $table->enum('preview_type', ['youtube', 'vimeo', 'file'])->nullable();
            
            // Pricing
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_free')->default(false);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->timestamp('discount_expires_at')->nullable();
            
            // Status & Publishing
            $table->enum('status', ['draft', 'pending', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('max_students')->nullable();
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            
            // Statistics (cached)
            $table->integer('enrolled_count')->default(0);
            $table->integer('completed_count')->default(0);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->integer('lesson_count')->default(0);
            $table->integer('quiz_count')->default(0);
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index(['instructor_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['is_featured', 'rating_avg']);
            $table->index('enrolled_count');
        });

        // Course Instructors (for multi-instructor courses)
        Schema::create('course_instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['primary', 'secondary', 'guest'])->default('secondary');
            $table->decimal('revenue_share', 5, 2)->default(0); // percentage
            $table->timestamps();

            $table->unique(['course_id', 'instructor_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_instructors');
        Schema::dropIfExists('courses');
    }
};
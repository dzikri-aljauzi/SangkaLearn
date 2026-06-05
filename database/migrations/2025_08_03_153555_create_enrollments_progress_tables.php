<?php
// database/migrations/2024_01_01_000007_create_enrollments_progress_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Course Enrollments
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'completed', 'suspended', 'expired'])->default('active');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->timestamp('enrolled_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->integer('total_time_spent')->default(0); // seconds
            $table->json('completion_data')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index(['course_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        // Learning Paths
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('instructor_id')->constrained('users')->onDelete('restrict');
            $table->integer('estimated_hours')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        // Learning Path Courses (ordered sequence)
        Schema::create('learning_path_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_path_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order');
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->unique(['learning_path_id', 'course_id']);
            $table->index(['learning_path_id', 'sort_order']);
        });

        // Certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('learning_path_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('certificate_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('template')->nullable();
            $table->timestamp('issued_at');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_valid')->default(true);
            $table->string('verification_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'issued_at']);
            $table->index('certificate_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('learning_path_courses');
        Schema::dropIfExists('learning_paths');
        Schema::dropIfExists('enrollments');
    }
};
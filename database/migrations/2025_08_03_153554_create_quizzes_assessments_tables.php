<?php
// database/migrations/2024_01_01_000006_create_quizzes_assessments_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Quizzes
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            
            // Quiz Settings
            $table->integer('time_limit')->nullable(); // minutes
            $table->integer('attempts_allowed')->default(1);
            $table->decimal('passing_score', 5, 2)->default(70);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('show_correct_answers')->default(true);
            $table->boolean('show_results_immediately')->default(true);
            
            // Availability
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->boolean('is_published')->default(true);
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['course_id', 'is_published']);
        });

        // Quiz Questions
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->text('question');
            $table->enum('type', ['multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching']);
            $table->json('options')->nullable(); // for multiple choice
            $table->json('correct_answers');
            $table->text('explanation')->nullable();
            $table->decimal('points', 5, 2)->default(1);
            $table->integer('sort_order')->default(0);
            $table->string('image')->nullable();
            $table->timestamps();

            $table->index(['quiz_id', 'sort_order']);
        });

        // Quiz Attempts
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->integer('attempt_number');
            $table->decimal('score', 5, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->boolean('is_passed')->default(false);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('time_taken')->nullable(); // seconds
            $table->json('answers')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'quiz_id']);
            $table->index(['quiz_id', 'is_passed']);
        });

        // Assignments
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('description');
            $table->longText('instructions')->nullable();
            $table->json('attachments')->nullable();
            $table->decimal('max_points', 8, 2)->default(100);
            $table->timestamp('due_date')->nullable();
            $table->boolean('allow_late_submission')->default(false);
            $table->integer('late_penalty_percent')->default(0);
            $table->json('submission_types')->nullable(); // text, file, link
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['course_id', 'due_date']);
        });

        // Assignment Submissions
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assignment_id')->constrained()->onDelete('cascade');
            $table->longText('content')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['draft', 'submitted', 'graded', 'returned'])->default('draft');
            $table->decimal('grade', 8, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'assignment_id']);
            $table->index(['assignment_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
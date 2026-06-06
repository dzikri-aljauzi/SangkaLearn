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
        Schema::create('certificate_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('certificate_file')->nullable(); // Path to uploaded certificate
            $table->text('rejection_reason')->nullable();
            $table->dateTime('completed_at'); // When student reached 100%
            $table->dateTime('reviewed_at')->nullable(); // When admin reviewed
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who reviewed
            $table->boolean('all_meetings_attended')->default(false); // Auto-calculated
            $table->integer('meetings_attended_count')->default(0);
            $table->integer('total_meetings_count')->default(0);
            $table->timestamps();

            // Unique constraint: one queue entry per user per course
            $table->unique(['user_id', 'course_id']);

            // Indexes
            $table->index('status');
            $table->index('completed_at');
            $table->index('user_id');
            $table->index('course_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_queue');
    }
};

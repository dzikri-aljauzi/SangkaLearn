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
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained('course_sections')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('zoom_link');
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->text('notes')->nullable();
            $table->string('meeting_id')->nullable(); // Zoom meeting ID
            $table->string('passcode')->nullable();
            $table->string('attendance_proof')->nullable(); // Screenshot path
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('course_id');
            $table->index('section_id');
            $table->index('scheduled_at');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};

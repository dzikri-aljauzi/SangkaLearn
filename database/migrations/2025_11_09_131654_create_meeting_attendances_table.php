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
        Schema::create('meeting_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('meetings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('attended')->default(false);
            $table->dateTime('marked_at')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who marked
            $table->text('notes')->nullable(); // Admin notes
            $table->timestamps();

            // Unique constraint: one attendance record per user per meeting
            $table->unique(['meeting_id', 'user_id']);

            // Indexes
            $table->index('meeting_id');
            $table->index('user_id');
            $table->index('attended');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_attendances');
    }
};

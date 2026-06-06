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
        Schema::create('meeting_screenshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('meetings')->onDelete('cascade');
            $table->string('screenshot_path');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            // Index for faster queries
            $table->index('meeting_id');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_screenshots');
    }
};

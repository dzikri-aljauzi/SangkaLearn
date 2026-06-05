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
        Schema::create('lesson_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('duration')->nullable(); // Duration in seconds
            $table->integer('progress')->default(0); // Progress percentage
            $table->boolean('completed')->default(false);
            $table->text('user_agent')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
            
            $table->index(['lesson_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_views');
    }
};

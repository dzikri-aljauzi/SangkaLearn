<?php
// database/migrations/2024_01_01_000009_create_reviews_ratings_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Reviews - FIXED POLYMORPHIC
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('reviewable_type'); // Manual polymorphic
            $table->unsignedBigInteger('reviewable_id');
            $table->decimal('rating', 3, 2); // 1.00 to 5.00
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['reviewable_type', 'reviewable_id', 'rating'], 'reviews_reviewable_rating_index');
            $table->index(['user_id', 'is_approved']);
            $table->unique(['user_id', 'reviewable_type', 'reviewable_id'], 'reviews_user_reviewable_unique');
        });

        // Review Helpfulness
        Schema::create('review_helpfulness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('review_id')->constrained()->onDelete('cascade');
            $table->boolean('is_helpful'); // true = helpful, false = not helpful
            $table->timestamps();

            $table->unique(['user_id', 'review_id']);
        });

        // Wishlists
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('review_helpfulness');
        Schema::dropIfExists('reviews');
    }
};
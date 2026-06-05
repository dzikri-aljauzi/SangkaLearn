<?php
// database/migrations/2024_01_01_000009_create_system_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('type')->default('string');
            $table->string('group')->default('general');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['group', 'key']);
        });

        // Use Laravel's default notifications table structure
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->string('notifiable_type'); // Manual polymorphic
            $table->unsignedBigInteger('notifiable_id');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Custom index name to avoid conflicts
            $table->index(['notifiable_type', 'notifiable_id'], 'notifications_notifiable_index');
        });

        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('file_name');
            $table->string('mime_type');
            $table->string('path');
            $table->bigInteger('size');
            $table->json('metadata')->nullable();
            $table->string('model_type'); // Manual polymorphic
            $table->unsignedBigInteger('model_id');
            $table->string('collection_name')->nullable();
            $table->timestamps();

            $table->index(['model_type', 'model_id'], 'media_files_model_index');
        });

        Schema::create('activity_logs_system', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');
            $table->text('description')->nullable();
            $table->string('subject_type')->nullable(); // Manual polymorphic
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('properties')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['subject_type', 'subject_id'], 'activity_logs_subject_index');
        });
    }

    public function down()
    {
        Schema::dropIfExists('activity_logs_system');
        Schema::dropIfExists('media_files');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('settings');
    }
};
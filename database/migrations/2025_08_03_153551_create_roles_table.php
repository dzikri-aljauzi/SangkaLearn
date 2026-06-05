<?php
// database/migrations/2024_01_01_000002_create_roles_permissions_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User roles (many-to-many)
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
        });

        // Instructor profiles
        Schema::create('instructor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('headline')->nullable();
            $table->longText('biography')->nullable();
            $table->json('specializations')->nullable();
            $table->json('certifications')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_students')->default(0);
            $table->integer('total_courses')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->json('payment_methods')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index('is_verified');
        });
    }

    public function down()
    {
        Schema::dropIfExists('instructor_profiles');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
    }
};
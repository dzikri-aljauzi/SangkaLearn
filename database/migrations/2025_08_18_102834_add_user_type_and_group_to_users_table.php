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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['general', 'special'])->default('general')->after('language');
            $table->unsignedBigInteger('user_group_id')->nullable()->after('user_type');
            $table->json('accessible_courses')->nullable()->after('user_group_id');
            $table->unsignedBigInteger('assigned_sub_admin_id')->nullable()->after('accessible_courses');
            
            $table->foreign('user_group_id')->references('id')->on('user_groups')->onDelete('set null');
            $table->foreign('assigned_sub_admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['user_group_id']);
            $table->dropForeign(['assigned_sub_admin_id']);
            $table->dropColumn(['user_type', 'user_group_id', 'accessible_courses', 'assigned_sub_admin_id']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('enrollments', function (Blueprint $table) {
            // Add order_id to link enrollment with purchase
            $table->foreignId('order_id')->nullable()->after('course_id')->constrained()->onDelete('restrict');
            
            // For SQLite compatibility, don't drop status column if it has indexes
            if (config('database.default') !== 'sqlite') {
                // Update status enum to include cancelled instead of suspended
                $table->dropColumn('status');
            }
        });
        
        // For SQLite, skip re-adding status column if it already exists
        if (config('database.default') !== 'sqlite') {
            // Re-add status with correct values
            Schema::table('enrollments', function (Blueprint $table) {
                $table->enum('status', ['active', 'completed'])->default('active')->after('course_id');
            });
        }
    }

    public function down()
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn('order_id');
            $table->dropColumn('status');
        });
        
        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('status', ['active', 'completed', 'suspended', 'expired'])->default('active');
        });
    }
};
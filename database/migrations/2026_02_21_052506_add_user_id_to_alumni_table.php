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
        Schema::table('alumni', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            $table->foreignId('certificate_queue_id')->nullable()->after('user_id')->constrained('certificate_queue')->onDelete('set null');
            $table->string('company')->nullable()->after('program');
            $table->string('job_title')->nullable()->after('company');
            $table->string('photo')->nullable()->after('job_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['certificate_queue_id']);
            $table->dropColumn(['user_id', 'certificate_queue_id', 'company', 'job_title', 'photo']);
        });
    }
};

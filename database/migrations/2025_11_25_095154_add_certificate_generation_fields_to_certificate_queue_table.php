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
        Schema::table('certificate_queue', function (Blueprint $table) {
            // Certificate generation mode: 'auto' or 'manual'
            $table->enum('certificate_mode', ['auto', 'manual'])->default('auto')->after('status');

            // Path to auto-generated certificate preview
            $table->string('auto_generated_certificate_path')->nullable()->after('certificate_file');

            // Path to manually uploaded certificate
            $table->string('uploaded_certificate_path')->nullable()->after('auto_generated_certificate_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_queue', function (Blueprint $table) {
            $table->dropColumn(['certificate_mode', 'auto_generated_certificate_path', 'uploaded_certificate_path']);
        });
    }
};

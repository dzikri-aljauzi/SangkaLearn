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
            // Add approved_at and approved_by fields
            if (!Schema::hasColumn('certificate_queue', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('reviewed_by');
            }
            if (!Schema::hasColumn('certificate_queue', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
            }

            // Add rejected_at field
            if (!Schema::hasColumn('certificate_queue', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('approved_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_queue', function (Blueprint $table) {
            $table->dropColumn(['approved_at', 'approved_by', 'rejected_at']);
        });
    }
};

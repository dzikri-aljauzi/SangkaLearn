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
        Schema::table('payments', function (Blueprint $table) {
            // Add static QRIS specific fields
            $table->timestamp('confirmed_at')->nullable()->after('paid_at')->comment('When static QRIS payment was manually confirmed');
            $table->decimal('confirmed_amount', 15, 2)->nullable()->after('amount')->comment('Amount confirmed for static QRIS payment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['confirmed_at', 'confirmed_amount']);
        });
    }
};

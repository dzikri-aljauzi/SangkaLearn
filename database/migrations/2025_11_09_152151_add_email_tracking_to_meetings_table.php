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
        Schema::table('meetings', function (Blueprint $table) {
            $table->boolean('alert_sent')->default(false)->after('is_published');
            $table->dateTime('alert_sent_at')->nullable()->after('alert_sent');
            $table->foreignId('alert_sent_by')->nullable()->after('alert_sent_at')->constrained('users')->onDelete('set null');
            $table->integer('alert_recipients_count')->default(0)->after('alert_sent_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->dropForeign(['alert_sent_by']);
            $table->dropColumn(['alert_sent', 'alert_sent_at', 'alert_sent_by', 'alert_recipients_count']);
        });
    }
};

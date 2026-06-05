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
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('certificate_file')->nullable()->after('metadata');
            $table->string('grade')->nullable()->after('certificate_file');
            $table->decimal('completion_percentage', 5, 2)->default(100.00)->after('grade');
            $table->string('verification_code')->unique()->nullable()->after('completion_percentage');
            $table->boolean('is_revoked')->default(false)->after('verification_code');
            $table->timestamp('revoked_at')->nullable()->after('is_revoked');
            $table->text('revoked_reason')->nullable()->after('revoked_at');
            $table->string('certificate_url')->nullable()->after('revoked_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn([
                'certificate_file',
                'grade',
                'completion_percentage',
                'verification_code',
                'is_revoked',
                'revoked_at',
                'revoked_reason',
                'certificate_url'
            ]);
        });
    }
};

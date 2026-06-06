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
        Schema::table('courses', function (Blueprint $table) {
            // Training Type
            $table->foreignId('course_type_id')->nullable()->after('category_id')->constrained('course_types')->onDelete('set null');

            // Period Configuration
            $table->boolean('is_permanent')->default(true)->after('status'); // Apakah pelatihan permanen atau punya periode
            $table->date('period_start')->nullable()->after('is_permanent'); // Mulai periode pelatihan
            $table->date('period_end')->nullable()->after('period_start'); // Akhir periode pelatihan
            $table->date('registration_deadline')->nullable()->after('period_end'); // Deadline pendaftaran

            // Certificate Configuration
            $table->enum('certificate_provider', ['leadnex', 'bnsp', 'both'])->default('leadnex')->after('has_certificate');
            // leadnex = hanya sertifikat dari LeadNex
            // bnsp = akan diuruskan ke BNSP
            // both = dapat keduanya

            $table->string('certificate_title')->nullable()->after('certificate_provider'); // Judul/gelar pada sertifikat

            // Training Delivery Method
            $table->enum('delivery_method', ['hybrid', 'online_recording', 'zoom_interactive'])->default('hybrid')->after('language');
            // hybrid = gabungan Online Recording + Zoom Interactive
            // online_recording = hanya video recording
            // zoom_interactive = hanya zoom meeting interaktif

            $table->string('zoom_link')->nullable()->after('delivery_method'); // Link zoom jika ada
            $table->dateTime('zoom_schedule')->nullable()->after('zoom_link'); // Jadwal zoom meeting
            $table->text('zoom_notes')->nullable()->after('zoom_schedule'); // Catatan tambahan untuk zoom

            // Auto-archive configuration
            $table->boolean('auto_archive')->default(false)->after('period_end'); // Otomatis arsip setelah period_end
            $table->dateTime('archived_at')->nullable()->after('auto_archive'); // Kapan di-archive

            // Additional indexes
            $table->index('is_permanent');
            $table->index(['period_start', 'period_end']);
            $table->index('delivery_method');
            $table->index('certificate_provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['course_type_id']);
            $table->dropIndex(['is_permanent']);
            $table->dropIndex(['period_start', 'period_end']);
            $table->dropIndex(['delivery_method']);
            $table->dropIndex(['certificate_provider']);

            $table->dropColumn([
                'course_type_id',
                'is_permanent',
                'period_start',
                'period_end',
                'registration_deadline',
                'certificate_provider',
                'certificate_title',
                'delivery_method',
                'zoom_link',
                'zoom_schedule',
                'zoom_notes',
                'auto_archive',
                'archived_at'
            ]);
        });
    }
};

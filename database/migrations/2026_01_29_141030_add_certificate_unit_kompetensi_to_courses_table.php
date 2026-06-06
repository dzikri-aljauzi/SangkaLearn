<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Migrate from 7 fixed unit_kompetensi columns to a single JSON array column
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->json('certificate_unit_kompetensi')->nullable()->after('instructor_name');
        });

        // Migrate existing data from unit_kompetensi_1 through unit_kompetensi_7 to the new JSON field
        $courses = DB::table('courses')
            ->whereNotNull('unit_kompetensi_1')
            ->orWhereNotNull('unit_kompetensi_2')
            ->orWhereNotNull('unit_kompetensi_3')
            ->orWhereNotNull('unit_kompetensi_4')
            ->orWhereNotNull('unit_kompetensi_5')
            ->orWhereNotNull('unit_kompetensi_6')
            ->orWhereNotNull('unit_kompetensi_7')
            ->get();

        foreach ($courses as $course) {
            $units = [];
            for ($i = 1; $i <= 7; $i++) {
                $field = "unit_kompetensi_{$i}";
                if (!empty($course->$field)) {
                    $units[] = $course->$field;
                }
            }

            if (!empty($units)) {
                DB::table('courses')
                    ->where('id', $course->id)
                    ->update(['certificate_unit_kompetensi' => json_encode($units)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('certificate_unit_kompetensi');
        });
    }
};

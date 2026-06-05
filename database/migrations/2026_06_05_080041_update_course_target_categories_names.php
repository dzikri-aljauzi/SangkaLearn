<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('course_target_categories')
            ->where('slug', 'mahasiswa')
            ->update(['name' => 'Umum', 'slug' => 'umum', 'description' => 'Pelatihan untuk peserta umum dan individu']);

        DB::table('course_target_categories')
            ->where('slug', 'pemerintah')
            ->update(['name' => 'Instansi', 'slug' => 'instansi', 'description' => 'Pelatihan untuk instansi dan lembaga pemerintah']);
    }

    public function down(): void
    {
        DB::table('course_target_categories')
            ->where('slug', 'umum')
            ->update(['name' => 'Mahasiswa', 'slug' => 'mahasiswa', 'description' => 'Pelatihan untuk mahasiswa dan peserta individu']);

        DB::table('course_target_categories')
            ->where('slug', 'instansi')
            ->update(['name' => 'Pemerintah', 'slug' => 'pemerintah', 'description' => 'Pelatihan untuk instansi pemerintah']);
    }
};

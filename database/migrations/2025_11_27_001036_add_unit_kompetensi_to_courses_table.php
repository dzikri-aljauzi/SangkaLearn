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
            $table->text('unit_kompetensi_1')->nullable()->after('description');
            $table->text('unit_kompetensi_2')->nullable()->after('unit_kompetensi_1');
            $table->text('unit_kompetensi_3')->nullable()->after('unit_kompetensi_2');
            $table->text('unit_kompetensi_4')->nullable()->after('unit_kompetensi_3');
            $table->text('unit_kompetensi_5')->nullable()->after('unit_kompetensi_4');
            $table->text('unit_kompetensi_6')->nullable()->after('unit_kompetensi_5');
            $table->text('unit_kompetensi_7')->nullable()->after('unit_kompetensi_6');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'unit_kompetensi_1',
                'unit_kompetensi_2',
                'unit_kompetensi_3',
                'unit_kompetensi_4',
                'unit_kompetensi_5',
                'unit_kompetensi_6',
                'unit_kompetensi_7',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change first_name and last_name columns from VARCHAR(255) to TEXT
     * to remove character limit restrictions.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('first_name')->change();
            $table->text('last_name')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name', 255)->change();
            $table->string('last_name', 255)->change();
        });
    }
};

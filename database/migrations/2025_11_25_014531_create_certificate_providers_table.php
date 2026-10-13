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
        Schema::create('certificate_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "LeadNex Academy", "BNSP", "ProSangka"
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('code')->unique(); // e.g., "leadnex", "bnsp", "prosangka"
            $table->string('color')->default('#3B82F6'); // Hex color for badge
            $table->string('logo')->nullable(); // Logo path
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0); // For sorting
            $table->timestamps();

            $table->index('is_active');
            $table->index('order');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_providers');
    }
};

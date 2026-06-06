<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add new columns
        Schema::table('lessons', function (Blueprint $table) {
            $table->json('content_images')->nullable()->after('type'); // Store images with positions
            $table->string('document_file')->nullable()->after('content_images'); // Document file path
            $table->string('document_filename')->nullable()->after('document_file'); // Original filename
            $table->integer('document_size')->nullable()->after('document_filename'); // File size in bytes
            $table->string('document_mime_type')->nullable()->after('document_size'); // MIME type
            $table->integer('duration_minutes')->nullable()->after('document_mime_type'); // Duration for reading/study time
        });

        // Remove the current type constraint
        DB::statement("ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_type_check");

        // Update existing 'text' type to 'reading' type
        DB::statement("UPDATE lessons SET type = 'reading' WHERE type = 'text'");

        // Update existing 'file' type to 'document' type
        DB::statement("UPDATE lessons SET type = 'document' WHERE type = 'file'");

        // Add new constraint with updated enum values
        DB::statement("ALTER TABLE lessons ADD CONSTRAINT lessons_type_check CHECK (type::text = ANY (ARRAY['video'::character varying, 'reading'::character varying, 'quiz'::character varying, 'assignment'::character varying, 'document'::character varying, 'live_session'::character varying, 'scorm'::character varying]::text[]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn([
                'content_images',
                'document_file',
                'document_filename',
                'document_size',
                'document_mime_type',
                'duration_minutes'
            ]);
            $table->dropColumn('type');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->enum('type', ['video', 'text', 'quiz', 'assignment', 'file', 'live_session', 'scorm'])->after('content');
        });
    }
};

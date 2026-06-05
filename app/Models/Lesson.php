<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_id',
        'section_id',
        'title',
        'description',
        'content',
        'type',
        'content_images',
        'content_blocks',
        'view_duration_seconds',
        'document_file',
        'document_filename',
        'document_size',
        'document_mime_type',
        'duration_minutes',
        'video_url',
        'video_provider',
        'video_duration',
        'video_file',
        'video_size',
        'video_mime_type',
        'video_duration_seconds',
        'attachments',
        'is_preview',
        'is_published',
        'completion_criteria',
        'sort_order',
        'available_from',
        'available_until',
    ];

    protected $casts = [
        'attachments' => 'array',
        'content_images' => 'array',
        'content_blocks' => 'array',
        'is_preview' => 'boolean',
        'is_published' => 'boolean',
        'completion_criteria' => 'array',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'section_id');
    }

    public function completions(): HasMany
    {
        return $this->hasMany(LessonCompletion::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(LessonView::class);
    }

    public function isCompletedBy(User $user): bool
    {
        return $this->completions()->where('user_id', $user->id)->exists();
    }

    public function getContentTypeAttribute(): string
    {
        return $this->type ?? 'text';
    }

    /**
     * Get the video file URL for playback
     */
    public function getVideoUrlAttribute($value)
    {
        // If we have a video file, return the storage URL
        if ($this->video_file) {
            return asset('storage/' . $this->video_file);
        }
        
        // Otherwise return the original video_url (for backwards compatibility)
        return $value;
    }

    /**
     * Check if lesson has a video (either file or URL)
     */
    public function hasVideo(): bool
    {
        return !empty($this->video_file) || !empty($this->attributes['video_url']);
    }

    /**
     * Get formatted video duration
     */
    public function getFormattedDuration(): string
    {
        $seconds = $this->video_duration_seconds ?? 0;
        if ($seconds <= 0) return 'N/A';
        
        $minutes = floor($seconds / 60);
        $hours = floor($minutes / 60);
        $minutes = $minutes % 60;
        
        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds % 60);
        } else {
            return sprintf('%d:%02d', $minutes, $seconds % 60);
        }
    }

    /**
     * Get human readable file size
     */
    public function getFormattedFileSize(): string
    {
        $bytes = $this->video_size ?? 0;
        if ($bytes == 0) return 'N/A';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / (1024 ** $i), 2) . ' ' . $units[$i];
    }

    /**
     * Get document file URL for download
     */
    public function getDocumentUrlAttribute(): ?string
    {
        if ($this->document_file) {
            return asset('storage/' . $this->document_file);
        }
        return null;
    }

    /**
     * Check if lesson has a document
     */
    public function hasDocument(): bool
    {
        return !empty($this->document_file);
    }

    /**
     * Get human readable document file size
     */
    public function getFormattedDocumentSize(): string
    {
        $bytes = $this->document_size ?? 0;
        if ($bytes == 0) return 'N/A';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / (1024 ** $i), 2) . ' ' . $units[$i];
    }

    /**
     * Check if lesson has content images
     */
    public function hasContentImages(): bool
    {
        return !empty($this->content_images) && is_array($this->content_images);
    }

    /**
     * Get content images with full URLs
     */
    public function getContentImagesWithUrls(): array
    {
        if (!$this->hasContentImages()) {
            return [];
        }

        return array_map(function($image) {
            if (isset($image['path'])) {
                $image['url'] = asset('storage/' . $image['path']);
            }
            return $image;
        }, $this->content_images);
    }
}

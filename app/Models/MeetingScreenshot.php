<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingScreenshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'screenshot_path',
        'uploaded_by',
        'notes',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Get the meeting that owns the screenshot
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    /**
     * Get the admin who uploaded the screenshot
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the full URL of the screenshot
     */
    public function getScreenshotUrlAttribute(): string
    {
        return asset('storage/' . $this->screenshot_path);
    }
}

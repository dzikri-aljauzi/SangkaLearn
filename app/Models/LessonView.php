<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonView extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'user_id',
        'duration',
        'progress',
        'completed',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'duration' => 'integer',
        'progress' => 'integer',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for formatted duration
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration) return '0m';
        
        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;
        
        if ($minutes > 0) {
            return $minutes . 'm ' . $seconds . 's';
        }
        
        return $seconds . 's';
    }
}
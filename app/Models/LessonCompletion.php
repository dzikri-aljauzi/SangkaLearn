<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'course_id',
        'progress_percentage',
        'time_spent',
        'completed_at',
        'completion_data',
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'time_spent' => 'integer',
        'completed_at' => 'datetime',
        'completion_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // Check if lesson is completed
    public function isCompleted(): bool
    {
        return !is_null($this->completed_at);
    }

    // Get formatted time spent
    public function getFormattedTimeSpentAttribute(): string
    {
        if (!$this->time_spent) return '0m';

        $minutes = floor($this->time_spent / 60);
        $seconds = $this->time_spent % 60;

        if ($minutes > 60) {
            $hours = floor($minutes / 60);
            $remainingMinutes = $minutes % 60;
            return "{$hours}h {$remainingMinutes}m";
        }

        if ($minutes > 0) {
            return $minutes . 'm ' . $seconds . 's';
        }

        return $seconds . 's';
    }
}

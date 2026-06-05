<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'user_id',
        'content',
        'attachments',
        'status',
        'submitted_at',
        'grade',
        'feedback',
        'graded_at',
        'graded_by',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'grade' => 'decimal:2',
        'attachments' => 'array',
    ];

    protected $appends = [
        'grade_percentage',
        'grade_points',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gradedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    // Accessor for formatted file size from attachments
    public function getFormattedFileSizeAttribute()
    {
        if (!$this->attachments || !is_array($this->attachments) || count($this->attachments) === 0) {
            return null;
        }

        $fileSize = $this->attachments[0]['size'] ?? null;
        if (!$fileSize) return null;

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $fileSize;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    // Check if submission is late
    public function getIsLateAttribute()
    {
        if (!$this->submitted_at) {
            return false;
        }

        // Check if assignment relation is loaded to avoid lazy loading
        if (!$this->relationLoaded('assignment') || !$this->assignment) {
            return false;
        }

        if (!$this->assignment->due_date) {
            return false;
        }

        return $this->submitted_at > $this->assignment->due_date;
    }

    // Check if submission is graded
    public function getIsGradedAttribute()
    {
        return !is_null($this->grade);
    }

    // Get grade as percentage (0-100)
    public function getGradePercentageAttribute()
    {
        return $this->grade;
    }

    // Get grade as points based on assignment's max_points
    public function getGradePointsAttribute()
    {
        if (is_null($this->grade)) {
            return null;
        }

        // Check if assignment relation is loaded to avoid lazy loading
        if (!$this->relationLoaded('assignment') || !$this->assignment) {
            // Return calculated value based on 100 points if assignment not loaded
            return round(($this->grade / 100) * 100, 2);
        }

        $maxPoints = $this->assignment->max_points ?? $this->assignment->max_score ?? 100;
        return round(($this->grade / 100) * $maxPoints, 2);
    }

    // Get formatted grade string (e.g., "80/100 (80%)")
    public function getFormattedGradeAttribute()
    {
        if (is_null($this->grade)) {
            return 'Not graded yet';
        }

        // Check if assignment relation is loaded to avoid lazy loading
        if (!$this->relationLoaded('assignment') || !$this->assignment) {
            $points = $this->grade_points;
            return "{$points}/100 ({$this->grade}%)";
        }

        $maxPoints = $this->assignment->max_points ?? $this->assignment->max_score ?? 100;
        $points = $this->grade_points;

        return "{$points}/{$maxPoints} ({$this->grade}%)";
    }
}

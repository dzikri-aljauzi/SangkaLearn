<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'section_id',
        'lesson_id',
        'title',
        'description',
        'instructions',
        'time_limit',
        'attempts_allowed',
        'passing_score',
        'randomize_questions',
        'show_correct_answers',
        'show_results_immediately',
        'allow_retake_until_pass',
        'max_retake_attempts',
        'available_from',
        'available_until',
        'is_published',
        'sort_order'
    ];

    protected $casts = [
        'randomize_questions' => 'boolean',
        'show_correct_answers' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_retake_until_pass' => 'boolean',
        'is_published' => 'boolean',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'passing_score' => 'decimal:2',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'section_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}

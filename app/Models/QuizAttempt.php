<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_id',
        'attempt_number',
        'status',
        'score',
        'percentage',
        'is_passed',
        'started_at',
        'completed_at',
        'time_taken',
        'answers'
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'is_passed' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'answers' => 'array'
    ];

    protected $appends = [
        'score_points',
        'score_percentage'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Calculate and update the score based on answers
     */
    public function calculateScore()
    {
        $this->load(['answers.question']);
        
        $totalPoints = 0;
        $earnedPoints = 0;
        
        foreach ($this->quiz->questions as $question) {
            $totalPoints += $question->points;
        }
        
        foreach ($this->answers as $answer) {
            $earnedPoints += $answer->points_earned;
        }
        
        $this->score = $earnedPoints;
        $this->percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
        $this->is_passed = $this->percentage >= $this->quiz->passing_score;
        
        $this->save();
        
        return $this;
    }

    /**
     * Complete the attempt
     */
    public function complete()
    {
        $this->completed_at = now();
        $this->time_taken = $this->started_at->diffInSeconds(now());
        $this->calculateScore();

        return $this;
    }

    /**
     * Get score as actual points earned
     */
    public function getScorePointsAttribute()
    {
        return $this->score;
    }

    /**
     * Get score as percentage
     */
    public function getScorePercentageAttribute()
    {
        return $this->percentage;
    }

    /**
     * Get formatted score display
     */
    public function getFormattedScoreAttribute()
    {
        if (is_null($this->score)) {
            return 'N/A';
        }

        // Check if quiz relation is loaded to avoid lazy loading
        if (!$this->relationLoaded('quiz')) {
            return "{$this->score} pts ({$this->percentage}%)";
        }

        $totalPoints = $this->quiz->total_points ?? 100;
        return "{$this->score}/{$totalPoints} ({$this->percentage}%)";
    }
}

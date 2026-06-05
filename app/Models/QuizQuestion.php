<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id',
        'question',
        'type',
        'options',
        'correct_answers',
        'explanation',
        'points',
        'sort_order',
        'image'
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answers' => 'array',
        'points' => 'decimal:2'
    ];

    // Question types
    const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_FILL_BLANK = 'fill_blank';
    const TYPE_ESSAY = 'essay';
    const TYPE_TEXT = 'text'; // New type for text-based questions
    const TYPE_MATCHING = 'matching';

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Check if answer is correct for different question types
     */
    public function checkAnswer($userAnswer)
    {
        switch ($this->type) {
            case self::TYPE_MULTIPLE_CHOICE:
                return $this->checkMultipleChoiceAnswer($userAnswer);
            case self::TYPE_TRUE_FALSE:
                return $this->checkTrueFalseAnswer($userAnswer);
            case self::TYPE_TEXT:
                return $this->checkTextAnswer($userAnswer);
            case self::TYPE_FILL_BLANK:
                return $this->checkFillBlankAnswer($userAnswer);
            default:
                return false;
        }
    }

    private function checkMultipleChoiceAnswer($userAnswer)
    {
        $correctAnswers = $this->correct_answers;
        if (is_array($userAnswer)) {
            return count(array_diff($userAnswer, $correctAnswers)) === 0 && 
                   count(array_diff($correctAnswers, $userAnswer)) === 0;
        }
        return in_array($userAnswer, $correctAnswers);
    }

    private function checkTrueFalseAnswer($userAnswer)
    {
        return in_array(strtolower($userAnswer), array_map('strtolower', $this->correct_answers));
    }

    private function checkTextAnswer($userAnswer)
    {
        if (empty($userAnswer) || empty($this->correct_answers)) {
            return false;
        }

        $userAnswer = strtolower(trim($userAnswer));
        $correctAnswers = $this->correct_answers;

        foreach ($correctAnswers as $correctAnswer) {
            $correctAnswer = strtolower(trim($correctAnswer));
            
            // Exact match
            if ($userAnswer === $correctAnswer) {
                return true;
            }
            
            // Contains the correct answer
            if (strpos($userAnswer, $correctAnswer) !== false) {
                return true;
            }
            
            // Check if all words from correct answer exist in user answer
            $correctWords = explode(' ', $correctAnswer);
            $allWordsFound = true;
            
            foreach ($correctWords as $word) {
                if (strlen($word) > 2 && strpos($userAnswer, $word) === false) {
                    $allWordsFound = false;
                    break;
                }
            }
            
            if ($allWordsFound && count($correctWords) > 1) {
                return true;
            }
        }

        return false;
    }

    private function checkFillBlankAnswer($userAnswer)
    {
        return $this->checkTextAnswer($userAnswer);
    }

    /**
     * Get the display type name
     */
    public function getTypeDisplayAttribute()
    {
        return match($this->type) {
            self::TYPE_MULTIPLE_CHOICE => 'Multiple Choice',
            self::TYPE_TRUE_FALSE => 'True/False',
            self::TYPE_FILL_BLANK => 'Fill in the Blank',
            self::TYPE_ESSAY => 'Essay',
            self::TYPE_TEXT => 'Text Answer',
            self::TYPE_MATCHING => 'Matching',
            default => 'Unknown'
        };
    }
}

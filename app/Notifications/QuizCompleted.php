<?php

namespace App\Notifications;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class QuizCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    protected $quiz;
    protected $attempt;

    public function __construct(Quiz $quiz, QuizAttempt $attempt)
    {
        $this->quiz = $quiz;
        $this->attempt = $attempt;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $score = $this->attempt->score;
        $passingScore = $this->quiz->passing_score ?? 60;
        $passed = $score >= $passingScore;

        $priority = $passed ? 'low' : 'medium';

        return [
            'type' => 'user',
            'category' => 'quiz',
            'title' => $passed ? 'Quiz berhasil diselesaikan!' : 'Quiz diselesaikan',
            'message' => "Anda telah menyelesaikan quiz '{$this->quiz->title}' dengan nilai {$score}",
            'priority' => $priority,
            'action_url' => route('student.quizzes.result', $this->attempt->id),
            'quiz_id' => $this->quiz->id,
            'attempt_id' => $this->attempt->id,
            'score' => $score,
            'passed' => $passed,
        ];
    }
}

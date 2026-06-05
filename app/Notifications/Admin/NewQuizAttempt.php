<?php

namespace App\Notifications\Admin;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewQuizAttempt extends Notification implements ShouldQueue
{
    use Queueable;

    protected $quiz;
    protected $attempt;
    protected $student;

    public function __construct(Quiz $quiz, QuizAttempt $attempt, User $student)
    {
        $this->quiz = $quiz;
        $this->attempt = $attempt;
        $this->student = $student;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $passed = $this->attempt->is_passed;
        $priority = $passed ? 'low' : 'medium';

        return [
            'type' => 'user',
            'category' => 'quiz',
            'title' => $passed ? 'Quiz berhasil diselesaikan' : 'Quiz diselesaikan',
            'message' => "{$this->student->first_name} {$this->student->last_name} menyelesaikan quiz '{$this->quiz->title}' dengan nilai {$this->attempt->percentage}%",
            'priority' => $priority,
            'action_url' => route('admin.quiz-monitoring.show', $this->quiz->id),
            'quiz_id' => $this->quiz->id,
            'quiz_title' => $this->quiz->title,
            'attempt_id' => $this->attempt->id,
            'student_id' => $this->student->id,
            'student_name' => $this->student->first_name . ' ' . $this->student->last_name,
            'score' => $this->attempt->percentage,
            'passed' => $passed,
        ];
    }
}

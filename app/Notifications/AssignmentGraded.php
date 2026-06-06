<?php

namespace App\Notifications;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class AssignmentGraded extends Notification implements ShouldQueue
{
    use Queueable;

    protected $assignment;
    protected $submission;

    public function __construct(Assignment $assignment, AssignmentSubmission $submission)
    {
        $this->assignment = $assignment;
        $this->submission = $submission;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $score = $this->submission->score;
        $maxScore = $this->assignment->max_score;
        $percentage = ($score / $maxScore) * 100;

        $priority = $percentage >= 80 ? 'low' : ($percentage >= 60 ? 'medium' : 'high');

        return [
            'type' => 'user',
            'category' => 'assignment',
            'title' => 'Tugas telah dinilai',
            'message' => "Tugas '{$this->assignment->title}' telah dinilai. Nilai: {$score}/{$maxScore}",
            'priority' => $priority,
            'action_url' => route('student.assignments.view', $this->assignment->id),
            'assignment_id' => $this->assignment->id,
            'submission_id' => $this->submission->id,
            'score' => $score,
            'max_score' => $maxScore,
        ];
    }
}

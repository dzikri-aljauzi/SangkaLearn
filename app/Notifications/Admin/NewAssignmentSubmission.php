<?php

namespace App\Notifications\Admin;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewAssignmentSubmission extends Notification implements ShouldQueue
{
    use Queueable;

    protected $assignment;
    protected $submission;
    protected $student;

    public function __construct(Assignment $assignment, AssignmentSubmission $submission, User $student)
    {
        $this->assignment = $assignment;
        $this->submission = $submission;
        $this->student = $student;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'user',
            'category' => 'assignment',
            'title' => 'Tugas baru diserahkan',
            'message' => "{$this->student->first_name} {$this->student->last_name} telah mengirim tugas '{$this->assignment->title}'",
            'priority' => 'medium',
            'action_url' => route('admin.assignment-monitoring.show', $this->assignment->id),
            'assignment_id' => $this->assignment->id,
            'assignment_title' => $this->assignment->title,
            'submission_id' => $this->submission->id,
            'student_id' => $this->student->id,
            'student_name' => $this->student->first_name . ' ' . $this->student->last_name,
        ];
    }
}

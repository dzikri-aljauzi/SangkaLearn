<?php

namespace App\Notifications;

use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class AssignmentDeadlineApproaching extends Notification implements ShouldQueue
{
    use Queueable;

    protected $assignment;
    protected $course;
    protected $daysRemaining;

    public function __construct(Assignment $assignment, Course $course, $daysRemaining)
    {
        $this->assignment = $assignment;
        $this->course = $course;
        $this->daysRemaining = $daysRemaining;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'user',
            'category' => 'course',
            'title' => 'Deadline Tugas Mendekati',
            'message' => "Tugas '{$this->assignment->title}' di pelatihan {$this->course->title} akan berakhir dalam {$this->daysRemaining} hari.",
            'priority' => 'high',
            'action_url' => route('student.learn', ['course' => $this->course->id]),
            'assignment_id' => $this->assignment->id,
            'assignment_title' => $this->assignment->title,
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'due_date' => $this->assignment->due_date,
            'days_remaining' => $this->daysRemaining,
        ];
    }
}

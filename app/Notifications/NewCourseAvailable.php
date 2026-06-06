<?php

namespace App\Notifications;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewCourseAvailable extends Notification implements ShouldQueue
{
    use Queueable;

    protected $course;

    public function __construct(Course $course)
    {
        $this->course = $course;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'system',
            'category' => 'course',
            'title' => 'Pelatihan baru tersedia!',
            'message' => "Pelatihan baru '{$this->course->title}' sudah tersedia. Daftar sekarang!",
            'priority' => 'medium',
            'action_url' => route('courses.show', $this->course->id),
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
        ];
    }
}

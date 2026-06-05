<?php

namespace App\Notifications;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class CourseEnrolled extends Notification implements ShouldQueue
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
            'type' => 'user',
            'category' => 'enrollment',
            'title' => 'Berhasil mendaftar pelatihan',
            'message' => "Anda telah berhasil mendaftar pelatihan {$this->course->title}",
            'priority' => 'medium',
            'action_url' => route('courses.show', $this->course->id),
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
        ];
    }
}

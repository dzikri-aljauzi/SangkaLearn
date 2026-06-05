<?php

namespace App\Notifications\Admin;

use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class LowCourseEnrollment extends Notification implements ShouldQueue
{
    use Queueable;

    protected $course;
    protected $enrollmentCount;

    public function __construct(Course $course, $enrollmentCount)
    {
        $this->course = $course;
        $this->enrollmentCount = $enrollmentCount;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'system',
            'category' => 'performance',
            'title' => 'Pendaftaran pelatihan rendah',
            'message' => "Pelatihan '{$this->course->title}' hanya memiliki {$this->enrollmentCount} pendaftar",
            'priority' => 'medium',
            'action_url' => route('admin.courses.edit', $this->course->id),
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'enrollment_count' => $this->enrollmentCount,
        ];
    }
}

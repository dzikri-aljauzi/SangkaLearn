<?php

namespace App\Notifications\Admin;

use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class CourseCompletedAlert extends Notification implements ShouldQueue
{
    use Queueable;

    protected $student;
    protected $course;
    protected $enrollment;

    public function __construct(User $student, Course $course, Enrollment $enrollment)
    {
        $this->student = $student;
        $this->course = $course;
        $this->enrollment = $enrollment;
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
            'title' => 'Pelatihan Diselesaikan - Upload Sertifikat',
            'message' => "{$this->student->first_name} {$this->student->last_name} telah menyelesaikan pelatihan {$this->course->title}. Klik untuk upload sertifikat.",
            'priority' => 'high',
            'action_url' => route('admin.course-monitoring.show', $this->course->id) . '?upload_certificate=' . $this->enrollment->id,
            'student_id' => $this->student->id,
            'student_name' => $this->student->first_name . ' ' . $this->student->last_name,
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'enrollment_id' => $this->enrollment->id,
            'progress' => 100,
        ];
    }
}

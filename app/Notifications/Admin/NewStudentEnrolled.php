<?php

namespace App\Notifications\Admin;

use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewStudentEnrolled extends Notification implements ShouldQueue
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
            'category' => 'enrollment',
            'title' => 'Pendaftaran pelatihan baru',
            'message' => "{$this->student->first_name} {$this->student->last_name} mendaftar pelatihan {$this->course->title}",
            'priority' => 'medium',
            'action_url' => route('admin.users.students.show', $this->student->id),
            'student_id' => $this->student->id,
            'student_name' => $this->student->first_name . ' ' . $this->student->last_name,
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'enrollment_id' => $this->enrollment->id,
        ];
    }
}

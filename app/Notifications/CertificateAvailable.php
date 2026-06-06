<?php

namespace App\Notifications;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class CertificateAvailable extends Notification implements ShouldQueue
{
    use Queueable;

    protected $course;
    protected $enrollment;
    protected $certificatePath;

    public function __construct(Course $course, Enrollment $enrollment, $certificatePath = null)
    {
        $this->course = $course;
        $this->enrollment = $enrollment;
        $this->certificatePath = $certificatePath;
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
            'title' => 'Sertifikat Tersedia',
            'message' => "Selamat! Sertifikat untuk pelatihan {$this->course->title} sudah tersedia untuk diunduh.",
            'priority' => 'high',
            'action_url' => route('student.progress'),
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'enrollment_id' => $this->enrollment->id,
            'certificate_path' => $this->certificatePath,
        ];
    }
}

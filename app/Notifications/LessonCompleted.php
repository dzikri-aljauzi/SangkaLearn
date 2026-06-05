<?php

namespace App\Notifications;

use App\Models\Lesson;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class LessonCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    protected $lesson;
    protected $course;
    protected $progress;

    public function __construct(Lesson $lesson, Course $course, $progress)
    {
        $this->lesson = $lesson;
        $this->course = $course;
        $this->progress = $progress;
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
            'title' => 'Pelajaran diselesaikan!',
            'message' => "Anda telah menyelesaikan pelajaran '{$this->lesson->title}'. Progress: {$this->progress}%",
            'priority' => 'low',
            'action_url' => route('courses.show', $this->course->id),
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
            'progress' => $this->progress,
        ];
    }
}

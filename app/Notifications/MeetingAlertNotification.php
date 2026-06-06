<?php

namespace App\Notifications;

use App\Models\Meeting;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MeetingAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $meeting;
    protected $course;

    /**
     * Create a new notification instance.
     */
    public function __construct(Meeting $meeting, Course $course)
    {
        $this->meeting = $meeting;
        $this->course = $course;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $scheduledDate = $this->meeting->scheduled_at->format('d F Y');
        $scheduledTime = $this->meeting->scheduled_at->format('H:i');

        return (new MailMessage)
            ->subject('🚨 ALERT: Zoom Meeting - ' . $this->meeting->title)
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('**PEMBERITAHUAN PENTING - ZOOM MEETING**')
            ->line('')
            ->line('Anda terdaftar sebagai peserta pelatihan **' . $this->course->title . '**')
            ->line('')
            ->line('**📅 Informasi Zoom Meeting:**')
            ->line('**Judul:** ' . $this->meeting->title)
            ->line('**Waktu:** ' . $scheduledDate . ' pukul ' . $scheduledTime . ' WIB')
            ->line('**Durasi:** ' . $this->meeting->duration_minutes . ' menit')
            ->line('')
            ->line('**📝 Deskripsi:**')
            ->line($this->meeting->description ?: 'Tidak ada deskripsi')
            ->line('')
            ->line('**⚠️ KETENTUAN PENTING:**')
            ->line('1. ✅ **WAJIB HADIR TEPAT WAKTU** - Zoom meeting akan dimulai sesuai jadwal')
            ->line('2. 📸 **WAJIB FOTO KEHADIRAN** - Screenshot sebagai bukti kehadiran')
            ->line('3. 📋 **ABSENSI MANUAL** - Admin akan mencatat kehadiran Anda')
            ->line('4. 🎓 **SYARAT SERTIFIKAT** - Kehadiran di Zoom adalah syarat mendapatkan sertifikat')
            ->line('')
            ->line('**❗ PERHATIAN:**')
            ->line('- Jangan terlambat! Absensi akan ditutup setelah meeting dimulai')
            ->line('- Pastikan koneksi internet stabil')
            ->line('- Siapkan screenshot untuk bukti kehadiran')
            ->line('')
            ->action('Join Zoom Meeting', $this->meeting->zoom_link)
            ->line('')
            ->line('**Link Zoom:** ' . $this->meeting->zoom_link)
            ->line($this->meeting->meeting_id ? '**Meeting ID:** ' . $this->meeting->meeting_id : '')
            ->line($this->meeting->passcode ? '**Passcode:** ' . $this->meeting->passcode : '')
            ->line('')
            ->line('Jika ada pertanyaan, silakan hubungi admin.')
            ->line('')
            ->line('Terima kasih,')
            ->salutation('Tim ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification (for database).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'meeting_id' => $this->meeting->id,
            'course_id' => $this->course->id,
            'meeting_title' => $this->meeting->title,
            'course_title' => $this->course->title,
            'scheduled_at' => $this->meeting->scheduled_at->toDateTimeString(),
            'zoom_link' => $this->meeting->zoom_link,
            'type' => 'meeting_alert',
        ];
    }
}
